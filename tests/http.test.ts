import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { AddressInfo } from 'node:net';
import { createJuiceHttpServer } from '../src/http.js';
import { openStore, type Store } from '../src/store.js';

describe('Juice HTTP API', () => {
  let dir: string;
  let store: Store;
  let server: ReturnType<typeof createJuiceHttpServer>;
  let baseUrl: string;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'juice-http-'));
    store = openStore(join(dir, 'juice.sqlite'));
    server = createJuiceHttpServer({ store, host: '127.0.0.1' });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('serves root HTML and logo', async () => {
    const root = await fetch(`${baseUrl}/`);
    expect(root.status).toBe(200);
    expect(root.headers.get('content-type')).toContain('text/html');
    const html = await root.text();
    expect(html).toContain('Juice');
    expect(html).toContain('/manifest.webmanifest');
    expect(html).toContain('/icons/apple-touch-icon.png');

    const logo = await fetch(`${baseUrl}/logo.svg`);
    expect(logo.status).toBe(200);
    expect(logo.headers.get('content-type')).toContain('image/svg+xml');

    const manifest = await fetch(`${baseUrl}/manifest.webmanifest`);
    expect(manifest.status).toBe(200);
    expect(manifest.headers.get('content-type')).toContain('application/manifest+json');
    expect((await manifest.json()).display).toBe('standalone');

    const appleIcon = await fetch(`${baseUrl}/icons/apple-touch-icon.png`);
    expect(appleIcon.status).toBe(200);
    expect(appleIcon.headers.get('content-type')).toContain('image/png');

    const favicon = await fetch(`${baseUrl}/favicon.ico`);
    expect(favicon.status).toBe(200);
    expect(favicon.headers.get('content-type')).toContain('image/x-icon');
  });

  it('creates, lists, gets, patches, retires, restores, and lists all statuses', async () => {
    const created = await json('POST', '/api/juices', {
      statement: 'Avoid verbose HTTP tests',
      category: 'general',
      triggers: ['tests'],
    });
    expect(created.statement).toContain('verbose HTTP tests');

    expect(await (await fetch(`${baseUrl}/api/juices`)).json()).toHaveLength(1);
    expect((await (await fetch(`${baseUrl}/api/juices/${created.id}`)).json()).id).toBe(created.id);

    await json('POST', '/api/categories', { name: 'api' });
    const patched = await json('PATCH', `/api/juices/${created.id}`, {
      category: 'api',
      status: 'active',
    });
    expect(patched.category).toBe('api');
    expect(await (await fetch(`${baseUrl}/api/juices?category=general`)).json()).toHaveLength(0);

    expect((await json('POST', `/api/juices/${created.id}/retire`)).status).toBe('retired');
    expect(await (await fetch(`${baseUrl}/api/juices`)).json()).toHaveLength(0);
    expect(await (await fetch(`${baseUrl}/api/juices?status=all`)).json()).toHaveLength(1);
    expect((await json('POST', `/api/juices/${created.id}/restore`)).status).toBe('active');
  });

  it('serves suggest and manifest endpoints', async () => {
    const suggestion = await json('POST', '/api/suggest', {
      feedback: 'Prefer SQLite tests over mock-heavy tests',
    });
    expect(suggestion.statement).toContain('Avoid mock-heavy tests');
    const manifest = await (await fetch(`${baseUrl}/api/manifest`)).json();
    expect(manifest.schema_version).toBe('1.0');
    expect(manifest.areas.map((a: any) => a.category)).toEqual(['general', 'design', 'writing']);
  });

  it('serves category registry endpoints', async () => {
    const defaults = await (await fetch(`${baseUrl}/api/categories`)).json();
    expect(defaults.map((c: any) => c.name)).toEqual(['general', 'design', 'writing']);
    const added = await json('POST', '/api/categories', {
      name: 'security',
      trigger_hints: ['auth'],
    });
    expect(added).toMatchObject({ name: 'security', trigger_hints: ['auth'] });
    expect((await jsonResponse('POST', '/api/categories', { name: '' })).status).toBe(400);
  });

  it('returns structured 400 for positive-only create and patch', async () => {
    const created = await json('POST', '/api/juices', {
      statement: 'Avoid verbose HTTP tests',
      category: 'general',
      triggers: ['tests'],
    });
    const createRejected = await jsonResponse('POST', '/api/juices', {
      statement: 'I love terse APIs',
    });
    expect(createRejected.status).toBe(400);
    expect(await createRejected.json()).toMatchObject({ error: 'positive_only_constraint' });
    const patchRejected = await jsonResponse('PATCH', `/api/juices/${created.id}`, {
      statement: 'Always use fetch',
    });
    expect(patchRejected.status).toBe(400);
    expect(await patchRejected.json()).toMatchObject({ error: 'positive_only_constraint' });
  });

  it('rejects invalid query, invalid body, malformed JSON, missing ids, and wrong methods', async () => {
    expect((await fetch(`${baseUrl}/api/juices?status=deleted`)).status).toBe(400);
    expect((await jsonResponse('POST', '/api/juices', { statement: '' })).status).toBe(400);
    expect(
      (await jsonResponse('POST', '/api/juices', { statement: 'x', scope: 'project' })).status,
    ).toBe(400);
    expect((await fetch(`${baseUrl}/api/juices`, { method: 'POST', body: '{' })).status).toBe(400);
    expect((await fetch(`${baseUrl}/api/juices/missing`)).status).toBe(404);
    expect((await fetch(`${baseUrl}/api/juices`, { method: 'DELETE' })).status).toBe(405);
  });

  it('allows GUI/API without auth while keeping MCP token gated', async () => {
    expect((await fetch(`${baseUrl}/api/manifest`)).status).toBe(200);

    const loopbackWithToken = createJuiceHttpServer({ store, host: '127.0.0.1', token: 'secret' });
    await new Promise<void>((resolve) => loopbackWithToken.listen(0, '127.0.0.1', resolve));
    const loopbackWithTokenUrl = `http://127.0.0.1:${(loopbackWithToken.address() as AddressInfo).port}`;
    expect((await fetch(`${loopbackWithTokenUrl}/api/manifest`)).status).toBe(200);
    expect((await fetch(`${loopbackWithTokenUrl}/mcp`)).status).toBe(401);
    await new Promise<void>((resolve) => loopbackWithToken.close(() => resolve()));

    const locked = createJuiceHttpServer({ store, host: '0.0.0.0', token: 'secret' });
    await new Promise<void>((resolve) => locked.listen(0, '127.0.0.1', resolve));
    const lockedUrl = `http://127.0.0.1:${(locked.address() as AddressInfo).port}`;
    expect((await fetch(`${lockedUrl}/`)).status).toBe(200);
    expect((await fetch(`${lockedUrl}/api/manifest`)).status).toBe(200);
    expect(
      (await fetch(`${lockedUrl}/api/manifest`, { headers: { authorization: 'Bearer secret' } }))
        .status,
    ).toBe(200);
    await new Promise<void>((resolve) => locked.close(() => resolve()));
  });

  it('keeps /mcp routed and authenticated consistently', async () => {
    expect((await fetch(`${baseUrl}/mcp`)).status).not.toBe(404);

    const locked = createJuiceHttpServer({ store, host: '0.0.0.0', token: 'secret' });
    await new Promise<void>((resolve) => locked.listen(0, '127.0.0.1', resolve));
    const lockedUrl = `http://127.0.0.1:${(locked.address() as AddressInfo).port}`;
    expect((await fetch(`${lockedUrl}/mcp`)).status).toBe(401);
    expect(
      (await fetch(`${lockedUrl}/mcp`, { headers: { authorization: 'Bearer secret' } })).status,
    ).not.toBe(404);
    await new Promise<void>((resolve) => locked.close(() => resolve()));
  });

  async function json(method: string, path: string, body?: unknown) {
    return (await jsonResponse(method, path, body)).json();
  }

  function jsonResponse(method: string, path: string, body?: unknown) {
    return fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
});
