import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openStore, type Store } from '../src/store.js';
import { list, manifest, prepare, retire, save, suggest, update } from '../src/juice.js';

describe('Juice taste system', () => {
  let dir: string;
  let store: Store;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'juice-'));
    store = openStore(join(dir, 'juice.sqlite'));
  });
  afterEach(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns an empty manifest', () =>
    expect(manifest(store)).toEqual({ schema_version: '1.0', areas: [] }));
  it('suggests without saving', () => {
    const s = suggest({
      feedback: 'Prefer concise TypeScript tests',
      scope: 'project',
      project: 'juice',
    });
    expect(s.triggers).toContain('tests');
    expect(manifest(store).areas).toHaveLength(0);
  });
  it('infers project scope when project identity is supplied', () => {
    const s = suggest({ feedback: 'Prefer concise TypeScript tests', project: 'juice' });
    expect(s.scope).toBe('project');
    expect(s.scope_key).toBe('project:juice');
  });
  it('save creates a manifest area without statements', () => {
    save(store, { statement: 'Prefer compact MCP tool output', scope: 'global' });
    const m = manifest(store);
    expect(m.areas[0].category).toBe('mcp');
    expect(JSON.stringify(m)).not.toContain('compact MCP tool output');
  });
  it('list filters by inferred project scope', () => {
    save(store, {
      statement: 'Project taste',
      project: 'juice',
      category: 'style',
      triggers: ['style'],
    });
    save(store, { statement: 'Global taste', category: 'style', triggers: ['style'] });
    expect(list(store, { project: 'juice' })).toHaveLength(1);
  });
  it('prepare returns relevant scoped taste', () => {
    save(store, {
      statement: 'Use BDD style tests for behavior',
      scope: 'project',
      project: 'juice',
      category: 'tests',
      triggers: ['tests', 'bdd'],
    });
    const r = prepare(store, { task: 'write bdd tests', scope: 'project', project: 'juice' });
    expect(r.heading).toBe('Taste signals to consider');
    expect(r.relevant[0].statement).toContain('BDD');
  });
  it('requires trigger hits even with extreme confidence values', () => {
    save(store, {
      statement: 'Prefer SQLite WAL mode',
      category: 'sqlite',
      triggers: ['sqlite'],
      confidence: 99,
      strength: 99,
    });
    expect(prepare(store, { task: 'draw an icon' }).relevant).toEqual([]);
  });
  it('unrelated tasks return empty relevant list', () => {
    save(store, {
      statement: 'Prefer SQLite WAL mode',
      category: 'sqlite',
      triggers: ['sqlite', 'wal'],
    });
    expect(prepare(store, { task: 'draw an icon' }).relevant).toEqual([]);
  });
  it('retire removes records from manifest and prepare', () => {
    const r = save(store, {
      statement: 'Prefer SQLite WAL mode',
      category: 'sqlite',
      triggers: ['sqlite'],
    });
    retire(store, r.id);
    expect(manifest(store).areas).toEqual([]);
    expect(prepare(store, { task: 'sqlite schema' }).relevant).toEqual([]);
  });
  it('missing update/retire returns structured not_found', () => {
    expect(update(store, 'missing', { statement: 'x' })).toEqual({
      ok: false,
      error: 'not_found',
      id: 'missing',
    });
    expect(retire(store, 'missing')).toEqual({ ok: false, error: 'not_found', id: 'missing' });
  });
  it('manifest resource/tool parity at domain level', () => {
    save(store, {
      statement: 'Use loopback HTTP by default',
      category: 'http',
      triggers: ['http', 'loopback'],
    });
    expect(JSON.parse(JSON.stringify(manifest(store)))).toEqual(manifest(store));
  });
});
