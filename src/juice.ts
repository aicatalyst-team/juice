import { randomUUID } from 'node:crypto';
import { insertRecord, listRecords, updateRecord, type Store } from './store.js';
import {
  DEFAULT_CONFIDENCE,
  DEFAULT_STRENGTH,
  clampPrepareLimit,
  clampUnitScore,
} from './number.js';
import { canonicalizeScopeIdentity, createAllowedScopeKeys, createScopeKey } from './scope.js';
import {
  compactCategory,
  compactStatement,
  extractSearchTerms,
  inferCategoryFromText,
  normalizeTriggerHints,
} from './text.js';
import {
  SCHEMA_VERSION,
  type JuiceRecord,
  type JuiceStatus,
  type Manifest,
  type PrepareResult,
  type Scope,
  type ScopeIdentity,
  type Suggestion,
} from './types.js';

type SaveInput = Partial<Suggestion> & { statement: string } & ScopeIdentity;
type UpdateInput = Partial<Omit<JuiceRecord, 'id' | 'created_at' | 'updated_at'>> & ScopeIdentity;
type ListFilters = ScopeIdentity & { category?: string; status?: JuiceStatus };

export { canonicalizeScopeIdentity as canonicalIdentity, createScopeKey as scopeKey };

/**
 * Creates a proposed taste signal from user feedback without mutating storage.
 */
export function suggest(input: { feedback: string } & ScopeIdentity): Suggestion {
  const identity = canonicalizeScopeIdentity(input);
  const category = inferCategoryFromText(input.feedback);
  const searchTerms = extractSearchTerms(input.feedback);

  return {
    scope: identity.scope,
    scope_key: createScopeKey(identity),
    category,
    statement: compactStatement(input.feedback),
    triggers: normalizeTriggerHints([category, ...searchTerms.slice(0, 7)]),
    confidence: DEFAULT_CONFIDENCE,
    strength: DEFAULT_STRENGTH,
  };
}

/**
 * Saves a confirmed taste signal. If the caller does not provide category and
 * triggers, Juice derives them the same way `suggest` does.
 */
export function save(store: Store, input: SaveInput) {
  const identity = canonicalizeScopeIdentity(input);
  const candidate = createSaveCandidate(input, identity);
  const timestamp = new Date().toISOString();

  return insertRecord(store, {
    id: randomUUID(),
    ...candidate,
    status: 'active',
    created_at: timestamp,
    updated_at: timestamp,
  });
}

/**
 * Applies a partial update to a saved taste signal.
 */
export function update(store: Store, id: string, patch: UpdateInput) {
  const normalizedPatch = normalizeUpdatePatch(patch);
  const updatedRecord = updateRecord(store, id, normalizedPatch);

  return updatedRecord ?? { ok: false, error: 'not_found', id };
}

/**
 * Retires a taste signal without deleting history from the database.
 */
export function retire(store: Store, id: string) {
  const retiredRecord = updateRecord(store, id, { status: 'retired' });

  return retiredRecord ?? { ok: false, error: 'not_found', id };
}

/**
 * Lists saved taste signals with optional metadata filters.
 */
export function list(store: Store, filters: ListFilters = {}) {
  return listRecords(store, createRecordFilters(filters));
}

/**
 * Builds the lightweight manifest agents use to decide whether Juice applies.
 * The manifest intentionally omits taste statements to avoid context bloat.
 */
export function manifest(store: Store): Manifest {
  const categories = collectManifestCategories(store);

  return {
    schema_version: SCHEMA_VERSION,
    areas: [...categories.entries()].sort().map(([category, details]) => ({
      category,
      trigger_hints: [...details.triggers].sort(),
      scopes: [...details.scopes].sort(),
    })),
  };
}

/**
 * Returns the few taste signals relevant to the current task and scope.
 */
export function prepare(
  store: Store,
  input: { task: string; limit?: number } & ScopeIdentity,
): PrepareResult {
  const taskText = input.task.toLowerCase();
  const taskSearchTerms = new Set(extractSearchTerms(input.task));
  const allowedScopeKeys = createAllowedScopeKeys(input);

  const relevantSignals = listRecords(store, { status: 'active' })
    .filter((record) => allowedScopeKeys.has(record.scope_key))
    .map((record) => scoreRecordForTask(record, taskText, taskSearchTerms))
    .filter((match) => match.triggerMatches > 0 && match.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, clampPrepareLimit(input.limit))
    .map(({ record, score }) => ({
      id: record.id,
      scope: record.scope,
      scope_key: record.scope_key,
      category: record.category,
      statement: record.statement,
      confidence: record.confidence,
      strength: record.strength,
      score: Number(score.toFixed(3)),
    }));

  return {
    schema_version: SCHEMA_VERSION,
    heading: 'Taste signals to consider',
    relevant: relevantSignals,
  };
}

function createSaveCandidate(
  input: SaveInput,
  identity: ReturnType<typeof canonicalizeScopeIdentity>,
) {
  if (!input.category || !input.triggers) {
    return suggest({ ...input, ...identity, feedback: input.statement });
  }

  return {
    scope: identity.scope,
    scope_key: createScopeKey(identity),
    category: compactCategory(input.category),
    statement: compactStatement(input.statement),
    triggers: normalizeTriggerHints(input.triggers),
    confidence: clampUnitScore(input.confidence, DEFAULT_CONFIDENCE),
    strength: clampUnitScore(input.strength, DEFAULT_STRENGTH),
  };
}

function normalizeUpdatePatch(patch: UpdateInput) {
  const normalizedPatch: Partial<JuiceRecord> = { ...patch };

  if (patch.triggers) {
    normalizedPatch.triggers = normalizeTriggerHints(patch.triggers);
  }
  if (patch.category) {
    normalizedPatch.category = compactCategory(patch.category);
  }
  if (patch.statement) {
    normalizedPatch.statement = compactStatement(patch.statement);
  }
  if ('confidence' in patch) {
    normalizedPatch.confidence = clampUnitScore(patch.confidence, DEFAULT_CONFIDENCE);
  }
  if ('strength' in patch) {
    normalizedPatch.strength = clampUnitScore(patch.strength, DEFAULT_STRENGTH);
  }
  if (patch.scope || patch.project || patch.repo || patch.agent) {
    const identity = canonicalizeScopeIdentity(patch);
    normalizedPatch.scope = identity.scope;
    normalizedPatch.scope_key = createScopeKey(identity);
  }

  return normalizedPatch;
}

function createRecordFilters(filters: ListFilters) {
  const recordFilters: {
    scope?: Scope;
    scope_key?: string;
    category?: string;
    status?: JuiceStatus;
  } = {
    category: filters.category,
    status: filters.status,
  };

  if (filters.scope || filters.project || filters.repo || filters.agent) {
    const identity = canonicalizeScopeIdentity(filters);
    recordFilters.scope = identity.scope;
    recordFilters.scope_key = createScopeKey(identity);
  }

  return recordFilters;
}

function collectManifestCategories(store: Store) {
  const categories = new Map<string, { triggers: Set<string>; scopes: Set<Scope> }>();

  for (const record of listRecords(store, { status: 'active' })) {
    const category = categories.get(record.category) ?? {
      triggers: new Set<string>(),
      scopes: new Set<Scope>(),
    };

    for (const trigger of record.triggers) {
      category.triggers.add(trigger);
    }
    category.scopes.add(record.scope);
    categories.set(record.category, category);
  }

  return categories;
}

function scoreRecordForTask(record: JuiceRecord, taskText: string, taskSearchTerms: Set<string>) {
  const triggerMatches = record.triggers.filter(
    (trigger) => taskSearchTerms.has(trigger) || taskText.includes(trigger.toLowerCase()),
  ).length;

  // Scoped taste should beat global taste when both match the same task.
  const scopeSpecificityBonus = record.scope_key !== 'global' ? 0.25 : 0;
  const score =
    triggerMatches * 0.4 + scopeSpecificityBonus + record.confidence * 0.1 + record.strength * 0.1;

  return { record, triggerMatches, score };
}
