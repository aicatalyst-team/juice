import Database from 'better-sqlite3';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import type { JuiceRecord, JuiceStatus, Scope } from './types.js';

export type Store = { db: Database.Database; close(): void };
export function defaultDbPath() {
  return process.env.JUICE_DB ?? join(homedir(), '.local/share/juice/juice.sqlite');
}
export function openStore(path = defaultDbPath()): Store {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.exec(
    `create table if not exists juice_records (id text primary key, scope text not null, scope_key text not null, category text not null, statement text not null, triggers text not null, confidence real not null, strength real not null, status text not null, created_at text not null, updated_at text not null); create index if not exists idx_juice_records_lookup on juice_records(status, scope_key, category);`,
  );
  return { db, close: () => db.close() };
}
const rowToRecord = (r: any): JuiceRecord => ({ ...r, triggers: JSON.parse(r.triggers) });
export function insertRecord(store: Store, rec: JuiceRecord) {
  store.db
    .prepare(
      `insert into juice_records values (@id,@scope,@scope_key,@category,@statement,@triggers,@confidence,@strength,@status,@created_at,@updated_at)`,
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
  if (!existing) return undefined;
  const rec: JuiceRecord = {
    ...existing,
    ...patch,
    triggers: patch.triggers ?? existing.triggers,
    updated_at: new Date().toISOString(),
  };
  store.db
    .prepare(
      `update juice_records set scope=@scope, scope_key=@scope_key, category=@category, statement=@statement, triggers=@triggers, confidence=@confidence, strength=@strength, status=@status, updated_at=@updated_at where id=@id`,
    )
    .run({ ...rec, triggers: JSON.stringify(rec.triggers) });
  return rec;
}
export function getRecord(store: Store, id: string) {
  const r = store.db.prepare('select * from juice_records where id=?').get(id);
  return r ? rowToRecord(r) : undefined;
}
export function listRecords(
  store: Store,
  filters: { scope?: Scope; scope_key?: string; category?: string; status?: JuiceStatus } = {},
) {
  const wh: string[] = [],
    vals: any[] = [];
  for (const [k, v] of Object.entries(filters))
    if (v) {
      wh.push(`${k}=?`);
      vals.push(v);
    }
  const sql = `select * from juice_records ${wh.length ? 'where ' + wh.join(' and ') : ''} order by updated_at desc`;
  return store.db
    .prepare(sql)
    .all(...vals)
    .map(rowToRecord);
}
