import { randomUUID } from 'node:crypto';
import { insertRecord, listRecords, updateRecord, type Store } from './store.js';
import {
  MAX_CATEGORY,
  MAX_STATEMENT,
  MAX_TRIGGER,
  MAX_TRIGGERS,
  SCHEMA_VERSION,
  type Manifest,
  type PrepareResult,
  type Scope,
  type ScopeIdentity,
  type Suggestion,
} from './types.js';

export function canonicalIdentity(
  i: ScopeIdentity = {},
): Required<Pick<ScopeIdentity, 'scope'>> & ScopeIdentity {
  if (i.scope) return { ...i, scope: i.scope };
  const present = (['project', 'repo', 'agent'] as const).filter((k) => Boolean(i[k]));
  if (present.length > 1) throw new Error(`ambiguous scope identity: ${present.join(', ')}`);
  if (present.length === 1) return { ...i, scope: present[0] };
  return { ...i, scope: 'global' };
}
export function scopeKey(i: ScopeIdentity): string {
  const c = canonicalIdentity(i);
  if (c.scope === 'global') return 'global';
  const v = c[c.scope];
  if (!v) throw new Error(`${c.scope} identity is required`);
  return `${c.scope}:${v}`;
}
const clip = (s: string, n: number) => s.trim().replace(/\s+/g, ' ').slice(0, n);
const clamp01 = (n: unknown, fallback: number) =>
  Math.max(0, Math.min(1, typeof n === 'number' && Number.isFinite(n) ? n : fallback));
const clampLimit = (n: unknown) =>
  Math.max(1, Math.min(10, typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : 5));
const words = (s: string) => [
  ...new Set(
    (s.toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g) ?? []).filter(
      (w) =>
        ![
          'the',
          'and',
          'for',
          'with',
          'that',
          'this',
          'from',
          'should',
          'please',
          'when',
          'about',
        ].includes(w),
    ),
  ),
];
const inferCategory = (text: string) =>
  words(text).find((w) =>
    [
      'test',
      'tests',
      'typescript',
      'mcp',
      'sqlite',
      'http',
      'ui',
      'review',
      'commit',
      'style',
    ].includes(w),
  ) ??
  words(text)[0] ??
  'general';
const normTriggers = (xs: string[]) =>
  [...new Set(xs.map((x) => clip(x, MAX_TRIGGER).toLowerCase()).filter(Boolean))].slice(
    0,
    MAX_TRIGGERS,
  );
export function suggest(input: { feedback: string } & ScopeIdentity): Suggestion {
  const identity = canonicalIdentity(input);
  const category = clip(inferCategory(input.feedback), MAX_CATEGORY);
  return {
    scope: identity.scope,
    scope_key: scopeKey(identity),
    category,
    statement: clip(input.feedback, MAX_STATEMENT),
    triggers: normTriggers([category, ...words(input.feedback).slice(0, 7)]),
    confidence: 0.7,
    strength: 0.7,
  };
}
export function save(
  store: Store,
  input: Partial<Suggestion> & { statement: string } & ScopeIdentity,
) {
  const identity = canonicalIdentity(input);
  const sug =
    input.category && input.triggers
      ? {
          scope: identity.scope,
          scope_key: scopeKey(identity),
          category: input.category,
          statement: input.statement,
          triggers: input.triggers,
          confidence: clamp01(input.confidence, 0.7),
          strength: clamp01(input.strength, 0.7),
        }
      : suggest({ ...input, ...identity, feedback: input.statement });
  const now = new Date().toISOString();
  return insertRecord(store, {
    id: randomUUID(),
    ...sug,
    category: clip(sug.category, MAX_CATEGORY),
    statement: clip(sug.statement, MAX_STATEMENT),
    triggers: normTriggers(sug.triggers),
    confidence: clamp01(sug.confidence, 0.7),
    strength: clamp01(sug.strength, 0.7),
    status: 'active',
    created_at: now,
    updated_at: now,
  });
}
export function update(store: Store, id: string, patch: any) {
  const p = { ...patch };
  if (p.triggers) p.triggers = normTriggers(p.triggers);
  if (p.category) p.category = clip(p.category, MAX_CATEGORY);
  if (p.statement) p.statement = clip(p.statement, MAX_STATEMENT);
  if ('confidence' in p) p.confidence = clamp01(p.confidence, 0.7);
  if ('strength' in p) p.strength = clamp01(p.strength, 0.7);
  if (p.scope || p.project || p.repo || p.agent) {
    const identity = canonicalIdentity(p);
    p.scope = identity.scope;
    p.scope_key = scopeKey(identity);
  }
  const rec = updateRecord(store, id, p);
  return rec ?? { ok: false, error: 'not_found', id };
}
export function retire(store: Store, id: string) {
  const rec = updateRecord(store, id, { status: 'retired' });
  return rec ?? { ok: false, error: 'not_found', id };
}
export function list(
  store: Store,
  filters: ScopeIdentity & { category?: string; status?: 'active' | 'retired' } = {},
) {
  const f: any = { category: filters.category, status: filters.status };
  if (filters.scope || filters.project || filters.repo || filters.agent) {
    const identity = canonicalIdentity(filters);
    f.scope = identity.scope;
    f.scope_key = scopeKey(identity);
  }
  return listRecords(store, f);
}
export function manifest(store: Store): Manifest {
  const map = new Map<string, { triggers: Set<string>; scopes: Set<Scope> }>();
  for (const r of listRecords(store, { status: 'active' })) {
    const v = map.get(r.category) ?? { triggers: new Set(), scopes: new Set<Scope>() };
    r.triggers.forEach((t) => v.triggers.add(t));
    v.scopes.add(r.scope);
    map.set(r.category, v);
  }
  return {
    schema_version: SCHEMA_VERSION,
    areas: [...map.entries()].sort().map(([category, v]) => ({
      category,
      trigger_hints: [...v.triggers].sort(),
      scopes: [...v.scopes].sort(),
    })),
  };
}
function allowedKeys(i: ScopeIdentity) {
  return new Set(
    [
      'global',
      i.project && `project:${i.project}`,
      i.repo && `repo:${i.repo}`,
      i.agent && `agent:${i.agent}`,
    ].filter(Boolean) as string[],
  );
}
export function prepare(
  store: Store,
  input: { task: string; limit?: number } & ScopeIdentity,
): PrepareResult {
  const ws = new Set(words(input.task));
  const keys = allowedKeys(input);
  const relevant = listRecords(store, { status: 'active' })
    .filter((r) => keys.has(r.scope_key))
    .map((r) => {
      const hits = r.triggers.filter(
        (t) => ws.has(t) || input.task.toLowerCase().includes(t.toLowerCase()),
      ).length;
      const exact = r.scope_key !== 'global' ? 0.25 : 0;
      return { r, hits, score: hits * 0.4 + exact + r.confidence * 0.1 + r.strength * 0.1 };
    })
    .filter((x) => x.hits > 0 && x.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, clampLimit(input.limit))
    .map(({ r, score }) => ({
      id: r.id,
      scope: r.scope,
      scope_key: r.scope_key,
      category: r.category,
      statement: r.statement,
      confidence: r.confidence,
      strength: r.strength,
      score: Number(score.toFixed(3)),
    }));
  return { schema_version: SCHEMA_VERSION, heading: 'Taste signals to consider', relevant };
}
