import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openStore, type Store } from '../src/store.js';
import {
  addCategory,
  list,
  listCategories,
  manifest,
  prepare,
  retire,
  save,
  suggest,
  update,
} from '../src/juice.js';

describe('Juice negative constraint system', () => {
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

  it('empty manifest has default categories', () => {
    expect(manifest(store).areas.map((a) => a.category)).toEqual(['general', 'design', 'writing']);
  });
  it('suggests without saving', () => {
    const s = suggest({
      feedback: 'Prefer concise TypeScript tests over verbose test setup',
      scope: 'project',
      project: 'juice',
    });
    expect(s.kind).toBe('negative');
    expect(s.statement).toBe(
      'Avoid verbose test setup when concise TypeScript tests is appropriate',
    );
    expect(s.triggers).toContain('tests');
    expect(manifest(store).areas.map((a) => a.category)).toEqual(['general', 'design', 'writing']);
  });
  it('infers project scope when project identity is supplied', () => {
    const s = suggest({ feedback: 'Avoid verbose TypeScript tests', project: 'juice' });
    expect(s.scope).toBe('project');
    expect(s.scope_key).toBe('project:juice');
  });
  it('save keeps inferred constraints in stable default categories without statements', () => {
    save(store, { statement: 'Avoid noisy MCP tool output', scope: 'global' });
    const m = manifest(store);
    expect(m.areas.map((a) => a.category)).toEqual(['general', 'design', 'writing']);
    expect(JSON.stringify(m)).not.toContain('noisy MCP tool output');
  });
  it('list filters by inferred project scope', () => {
    save(store, {
      statement: 'Avoid project-specific churn',
      project: 'juice',
      category: 'design',
      triggers: ['style'],
    });
    save(store, { statement: 'Avoid global churn', category: 'design', triggers: ['style'] });
    expect(list(store, { project: 'juice' })).toHaveLength(1);
  });
  it('prepare returns relevant scoped avoidance constraints', () => {
    save(store, {
      statement: 'Avoid implementation-only tests when BDD behavior tests are appropriate',
      scope: 'project',
      project: 'juice',
      category: 'general',
      triggers: ['tests', 'bdd'],
    });
    const r = prepare(store, { task: 'write bdd tests', scope: 'project', project: 'juice' });
    expect(r.heading).toBe('Avoidance constraints to respect');
    expect(r.relevant[0].statement).toContain('implementation-only tests');
  });
  it('requires trigger hits even with extreme confidence values', () => {
    save(store, {
      statement: 'Avoid non-WAL SQLite mode',
      category: 'general',
      triggers: ['sqlite'],
      confidence: 99,
      strength: 99,
    });
    expect(prepare(store, { task: 'draw an icon' }).relevant).toEqual([]);
  });
  it('unrelated tasks return empty relevant list', () => {
    save(store, {
      statement: 'Avoid non-WAL SQLite mode',
      category: 'general',
      triggers: ['sqlite', 'wal'],
    });
    expect(prepare(store, { task: 'draw an icon' }).relevant).toEqual([]);
  });
  it('retire removes records from manifest and prepare', () => {
    const r = save(store, {
      statement: 'Avoid non-WAL SQLite mode',
      category: 'general',
      triggers: ['sqlite'],
    });
    retire(store, r.id);
    expect(manifest(store).areas.map((a) => a.category)).toEqual(['general', 'design', 'writing']);
    expect(prepare(store, { task: 'sqlite schema' }).relevant).toEqual([]);
  });
  it('missing update/retire returns structured not_found', () => {
    expect(update(store, 'missing', { statement: 'Avoid x' })).toEqual({
      ok: false,
      error: 'not_found',
      id: 'missing',
    });
    expect(retire(store, 'missing')).toEqual({ ok: false, error: 'not_found', id: 'missing' });
  });
  it('manifest resource/tool parity at domain level', () => {
    save(store, {
      statement: 'Avoid public HTTP binding by default',
      category: 'general',
      triggers: ['http', 'loopback'],
    });
    expect(JSON.parse(JSON.stringify(manifest(store)))).toEqual(manifest(store));
  });
  it('rejects positive-only saves and suggestions', () => {
    expect(() => save(store, { statement: 'I like concise answers' })).toThrow(
      /negative avoidance/,
    );
    expect(() => suggest({ feedback: 'Always use semicolons' })).toThrow(/negative avoidance/);
  });
  it('does not surface legacy juice_records rows', () => {
    store.db
      .prepare(
        `insert into juice_records (id, scope, scope_key, category, statement, triggers, confidence, strength, status, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        'old',
        'global',
        'global',
        'style',
        'Prefer old positive taste',
        '["style"]',
        1,
        1,
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
      );
    expect(list(store)).toEqual([]);
    expect(manifest(store).areas.map((a) => a.category)).toEqual(['general', 'design', 'writing']);
    expect(prepare(store, { task: 'style' }).relevant).toEqual([]);
  });
  it('adds registered category and rejects unregistered categories on save', () => {
    addCategory(store, { name: 'security', trigger_hints: ['auth'] });
    expect(listCategories(store).map((c) => c.name)).toContain('security');
    expect(manifest(store).areas.find((a) => a.category === 'security')?.trigger_hints).toContain(
      'auth',
    );
    expect(() =>
      save(store, {
        statement: 'Avoid leaking tokens in logs',
        category: 'ops',
        triggers: ['logs'],
      }),
    ).toThrow(/registered/);
    save(store, {
      statement: 'Avoid leaking tokens in logs',
      category: 'security',
      triggers: ['auth'],
    });
    expect(manifest(store).areas.map((a) => a.category)).toContain('security');
  });
});
