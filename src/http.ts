import { createReadStream, existsSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z, ZodError } from 'zod';
import * as juice from './juice.js';
import { getRecord, openStore, type Store } from './store.js';
import { createWebHtml } from './web.js';
import { createJuiceMcpServer } from './mcp.js';
import { ConstraintValidationError } from './text.js';

export const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const MAX_BODY_BYTES = 64 * 1024;

const Scope = z.enum(['global', 'project', 'repo', 'agent']);
const Status = z.enum(['active', 'retired']);
const Identity = {
  scope: Scope.optional(),
  project: z.string().optional(),
  repo: z.string().optional(),
  agent: z.string().optional(),
};
function validateScopeIdentity(
  data: { scope?: string; project?: string; repo?: string; agent?: string },
  ctx: z.RefinementCtx,
) {
  const present = (['project', 'repo', 'agent'] as const).filter((key) => Boolean(data[key]));
  if (!data.scope && present.length > 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ambiguous scope identity' });
  }
  if (data.scope && data.scope !== 'global' && !data[data.scope as 'project' | 'repo' | 'agent']) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${data.scope} identity is required` });
  }
}
const SaveBody = z
  .object({
    statement: z.string().trim().min(1),
    category: z.string().optional(),
    triggers: z.array(z.string()).optional(),
    confidence: z.number().optional(),
    strength: z.number().optional(),
    ...Identity,
  })
  .strict()
  .superRefine(validateScopeIdentity);
const PatchBody = z
  .object({
    statement: z.string().trim().min(1).optional(),
    category: z.string().optional(),
    triggers: z.array(z.string()).optional(),
    confidence: z.number().optional(),
    strength: z.number().optional(),
    status: Status.optional(),
    ...Identity,
  })
  .strict()
  .superRefine(validateScopeIdentity);
const SuggestBody = z
  .object({ feedback: z.string().trim().min(1), ...Identity })
  .strict()
  .superRefine(validateScopeIdentity);
const CategoryBody = z
  .object({ name: z.string().trim().min(1), trigger_hints: z.array(z.string()).optional() })
  .strict();
const ListQuery = z.object({
  status: z.enum(['active', 'retired', 'all']).optional().default('active'),
  category: z.string().optional(),
});

export type HttpOptions = { store?: Store; host?: string; token?: string };

export function createJuiceHttpHandler({
  store = openStore(),
  host = '127.0.0.1',
  token,
}: HttpOptions = {}) {
  const mcpRequiresAuth = Boolean(token);

  return async function juiceHttpHandler(req: IncomingMessage, res: ServerResponse) {
    try {
      const url = new URL(req.url ?? '/', `http://${host}`);
      if (url.pathname === '/mcp' || url.pathname.startsWith('/mcp/')) {
        if (mcpRequiresAuth && req.headers.authorization !== `Bearer ${token}`) {
          return sendText(res, 401, 'unauthorized');
        }
        return await handleMcp(req, res, store);
      }

      if (url.pathname === '/') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return sendText(res, 200, createWebHtml(), 'text/html; charset=utf-8');
      }
      if (url.pathname === '/logo.svg') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return serveLogo(res);
      }
      if (url.pathname === '/manifest.webmanifest') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return servePublicFile(
          res,
          'manifest.webmanifest',
          'application/manifest+json; charset=utf-8',
        );
      }
      if (url.pathname === '/favicon.ico') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return servePublicFile(res, 'favicon.ico', 'image/x-icon');
      }
      if (url.pathname === '/icons/apple-touch-icon.png') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return servePublicFile(res, 'icons/apple-touch-icon.png', 'image/png');
      }
      if (url.pathname === '/icons/icon-192.png') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return servePublicFile(res, 'icons/icon-192.png', 'image/png');
      }
      if (url.pathname === '/icons/icon-512.png') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return servePublicFile(res, 'icons/icon-512.png', 'image/png');
      }
      if (url.pathname === '/api/manifest') {
        if (req.method !== 'GET') return sendText(res, 405, 'method not allowed');
        return sendJson(res, 200, juice.manifest(store));
      }
      if (url.pathname === '/api/suggest') {
        if (req.method !== 'POST') return sendText(res, 405, 'method not allowed');
        return sendJson(res, 200, juice.suggest(SuggestBody.parse(await readJson(req))));
      }
      if (url.pathname === '/api/categories') {
        if (req.method === 'GET') return sendJson(res, 200, juice.listCategories(store));
        if (req.method === 'POST')
          return sendJson(
            res,
            200,
            juice.addCategory(store, CategoryBody.parse(await readJson(req))),
          );
        return sendText(res, 405, 'method not allowed');
      }

      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'api' && parts[1] === 'juices') {
        return await handleJuices(req, res, url, parts.slice(2), store);
      }

      return sendText(res, 404, 'not found');
    } catch (err) {
      if (err instanceof ConstraintValidationError)
        return sendJson(res, 400, { error: err.code, message: err.message });
      if (err instanceof juice.CategoryValidationError)
        return sendJson(res, 400, { error: err.code, message: err.message });
      if (err instanceof ZodError)
        return sendJson(res, 400, { error: 'bad_request', issues: err.issues });
      if (err instanceof BadRequest) return sendJson(res, 400, { error: 'bad_request' });
      console.error('Juice HTTP request failed', err);
      if (!res.headersSent) return sendText(res, 500, 'internal error');
    }
  };
}

export function createJuiceHttpServer(options: HttpOptions = {}) {
  return createServer(createJuiceHttpHandler(options));
}

async function handleJuices(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  parts: string[],
  store: Store,
) {
  if (parts.length === 0) {
    if (req.method === 'GET') {
      const query = ListQuery.parse(Object.fromEntries(url.searchParams));
      return sendJson(
        res,
        200,
        juice.list(store, {
          category: query.category,
          status: query.status === 'all' ? undefined : query.status,
        }),
      );
    }
    if (req.method === 'POST')
      return sendJson(res, 200, juice.save(store, SaveBody.parse(await readJson(req))));
    return sendText(res, 405, 'method not allowed');
  }

  const [id, action] = parts;
  if (parts.length === 1) {
    if (req.method === 'GET') {
      const record = getRecord(store, id);
      return record ? sendJson(res, 200, record) : sendText(res, 404, 'not found');
    }
    if (req.method === 'PATCH')
      return sendExisting(res, juice.update(store, id, PatchBody.parse(await readJson(req))));
    return sendText(res, 405, 'method not allowed');
  }
  if (parts.length === 2 && req.method === 'POST' && action === 'retire')
    return sendExisting(res, juice.retire(store, id));
  if (parts.length === 2 && req.method === 'POST' && action === 'restore')
    return sendExisting(res, juice.update(store, id, { status: 'active' }));
  return sendText(
    res,
    parts.length === 2 ? 405 : 404,
    parts.length === 2 ? 'method not allowed' : 'not found',
  );
}

async function handleMcp(req: IncomingMessage, res: ServerResponse, store: Store) {
  const mcp = createJuiceMcpServer(store);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await mcp.connect(transport);
  await transport.handleRequest(req, res);
}

function sendExisting(res: ServerResponse, result: any) {
  return result?.error === 'not_found'
    ? sendText(res, 404, 'not found')
    : sendJson(res, 200, result);
}

async function readJson(req: IncomingMessage) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw new BadRequest();
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw new BadRequest();
  }
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  sendText(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

function sendText(
  res: ServerResponse,
  status: number,
  body: string,
  type = 'text/plain; charset=utf-8',
) {
  res.writeHead(status, { 'content-type': type }).end(body);
}

function serveLogo(res: ServerResponse) {
  const logo = findLogoPath();
  if (!logo) return sendText(res, 404, 'not found');
  res.writeHead(200, { 'content-type': 'image/svg+xml' });
  createReadStream(logo).pipe(res);
}

function servePublicFile(res: ServerResponse, relativePath: string, contentType: string) {
  const file = findPublicPath(relativePath);
  if (!file) return sendText(res, 404, 'not found');
  res.writeHead(200, { 'content-type': contentType, 'cache-control': 'public, max-age=86400' });
  createReadStream(file).pipe(res);
}

function findLogoPath() {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const candidate of [
    resolve(here, '../logo.svg'),
    resolve(here, '../../logo.svg'),
    join(process.cwd(), 'logo.svg'),
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

function findPublicPath(relativePath: string) {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const candidate of [
    resolve(here, '../public', relativePath),
    resolve(here, '../../public', relativePath),
    join(process.cwd(), 'public', relativePath),
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

class BadRequest extends Error {}
