import Database from 'better-sqlite3';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import type { JuiceCategory, JuiceRecord, JuiceStatus, Scope } from './types.js';

export const DEFAULT_CATEGORIES = ['general', 'design', 'writing'] as const;
const DEFAULT_CATEGORY_ORDER: Map<string, number> = new Map(
  DEFAULT_CATEGORIES.map((name, index) => [name, index]),
);

export type Store = { db: Database.Database; close(): void };

export function defaultDbPath() {
  return process.env.JUICE_DB ?? join(homedir(), '.local/share/juice/juice.sqlite');
}

export function openStore(path = defaultDbPath()): Store {
  mkdirSync(dirname(path), { recursive: true });

  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');

  db.exec(`
    create table if not exists juice_records (
      id text primary key,
      scope text not null,
      scope_key text not null,
      category text not null,
      statement text not null,
      triggers text not null,
      confidence real not null,
      strength real not null,
      status text not null,
      created_at text not null,
      updated_at text not null
    );

    create index if not exists idx_juice_records_lookup
      on juice_records(status, scope_key, category);

    create table if not exists juice_constraints (
      id text primary key,
      kind text not null check (kind = 'negative'),
      scope text not null,
      scope_key text not null,
      category text not null,
      statement text not null,
      triggers text not null,
      confidence real not null,
      strength real not null,
      status text not null,
      created_at text not null,
      updated_at text not null
    );

    create index if not exists idx_juice_constraints_lookup
      on juice_constraints(status, scope_key, category);

    create table if not exists juice_categories (
      name text primary key,
      trigger_hints text not null,
      created_at text not null,
      updated_at text not null
    );
  `);

  seedDefaultCategories({ db, close: () => db.close() });

  return { db, close: () => db.close() };
}

function seedDefaultCategories(store: Store) {
  for (const name of DEFAULT_CATEGORIES) addCategory(store, { name, trigger_hints: [name] });
}

function rowToCategory(row: any): JuiceCategory {
  return { ...row, trigger_hints: JSON.parse(row.trigger_hints) };
}

export function addCategory(store: Store, input: { name: string; trigger_hints?: string[] }) {
  const timestamp = new Date().toISOString();
  store.db
    .prepare(
      `insert into juice_categories (name, trigger_hints, created_at, updated_at)
     values (@name, @trigger_hints, @created_at, @updated_at)
     on conflict(name) do update set
       trigger_hints = case
         when excluded.trigger_hints != '[]' then excluded.trigger_hints
         else juice_categories.trigger_hints
       end,
       updated_at = excluded.updated_at`,
    )
    .run({
      name: input.name,
      trigger_hints: JSON.stringify(input.trigger_hints ?? []),
      created_at: timestamp,
      updated_at: timestamp,
    });
  return getCategory(store, input.name)!;
}

export function getCategory(store: Store, name: string) {
  const row = store.db
    .prepare(
      'select name, trigger_hints, created_at, updated_at from juice_categories where name = ?',
    )
    .get(name);
  return row ? rowToCategory(row) : undefined;
}

export function listCategories(store: Store) {
  return store.db
    .prepare('select name, trigger_hints, created_at, updated_at from juice_categories')
    .all()
    .map(rowToCategory)
    .sort((a, b) => {
      const left = DEFAULT_CATEGORY_ORDER.get(a.name) ?? Number.MAX_SAFE_INTEGER;
      const right = DEFAULT_CATEGORY_ORDER.get(b.name) ?? Number.MAX_SAFE_INTEGER;
      return left === right ? a.name.localeCompare(b.name) : left - right;
    });
}

function rowToRecord(row: any): JuiceRecord {
  return { ...row, triggers: JSON.parse(row.triggers) };
}

export function insertRecord(store: Store, rec: JuiceRecord) {
  store.db
    .prepare(
      `insert into juice_constraints (
        id, kind, scope, scope_key, category, statement, triggers,
        confidence, strength, status, created_at, updated_at
      ) values (
        @id,
        @kind,
        @scope,
        @scope_key,
        @category,
        @statement,
        @triggers,
        @confidence,
        @strength,
        @status,
        @created_at,
        @updated_at
      )`,
    )
    .run({ ...rec, triggers: JSON.stringify(rec.triggers) });

  return rec;
}

export function updateRecord(
  store: Store,
  id: string,
  patch: Partial<Omit<JuiceRecord, 'id' | 'created_at'>>,
) {
  const existing = getRecord(store, id);

  if (!existing) {
    return undefined;
  }

  const rec: JuiceRecord = {
    ...existing,
    ...patch,
    triggers: patch.triggers ?? existing.triggers,
    updated_at: new Date().toISOString(),
  };
  store.db
    .prepare(
      `update juice_constraints set
        kind = @kind,
        scope = @scope,
        scope_key = @scope_key,
        category = @category,
        statement = @statement,
        triggers = @triggers,
        confidence = @confidence,
        strength = @strength,
        status = @status,
        updated_at = @updated_at
      where id = @id`,
    )
    .run({ ...rec, triggers: JSON.stringify(rec.triggers) });

  return rec;
}

export function getRecord(store: Store, id: string) {
  const row = store.db.prepare('select * from juice_constraints where id = ?').get(id);
  return row ? rowToRecord(row) : undefined;
}

export function listRecords(
  store: Store,
  filters: { scope?: Scope; scope_key?: string; category?: string; status?: JuiceStatus } = {},
) {
  const whereClauses: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      whereClauses.push(`${key} = ?`);
      values.push(value);
    }
  }

  const whereSql = whereClauses.length ? `where ${whereClauses.join(' and ')}` : '';
  const sql = `select * from juice_constraints ${whereSql} order by updated_at desc`;

  return store.db
    .prepare(sql)
    .all(...values)
    .map(rowToRecord);
}
