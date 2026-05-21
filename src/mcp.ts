import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'node:http';
import { z } from 'zod';
import { openStore, type Store } from './store.js';
import * as juice from './juice.js';

const Scope = z.enum(['global', 'project', 'repo', 'agent']);
const Identity = {
  scope: Scope.optional(),
  project: z.string().optional(),
  repo: z.string().optional(),
  agent: z.string().optional(),
};
const text = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data ?? null, null, 2) }],
});

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

export function createJuiceMcpServer(store: Store = openStore()) {
  const server = new McpServer(
    { name: 'juice', version: '0.1.0' },
    { capabilities: { tools: {}, resources: {} } },
  );
  server.registerResource(
    'juice_manifest',
    'juice://manifest',
    { title: 'Juice manifest', mimeType: 'application/json' },
    () => ({
      contents: [
        {
          uri: 'juice://manifest',
          mimeType: 'application/json',
          text: JSON.stringify(juice.manifest(store)),
        },
      ],
    }),
  );
  server.registerTool(
    'juice_get_manifest',
    { description: 'Return Juice category manifest without taste statements.' },
    () => text(juice.manifest(store)),
  );
  server.registerTool(
    'juice_suggest',
    {
      description: 'Suggest a taste signal without saving.',
      inputSchema: { feedback: z.string(), ...Identity },
    },
    (a) => text(juice.suggest(a)),
  );
  server.registerTool(
    'juice_save',
    {
      description: 'Create and save a taste signal.',
      inputSchema: {
        statement: z.string(),
        category: z.string().optional(),
        triggers: z.array(z.string()).optional(),
        confidence: z.number().optional(),
        strength: z.number().optional(),
        ...Identity,
      },
    },
    (a) => text(juice.save(store, a)),
  );
  server.registerTool(
    'juice_prepare',
    {
      description: 'Return relevant taste signals for a task.',
      inputSchema: { task: z.string(), limit: z.number().optional(), ...Identity },
    },
    (a) => text(juice.prepare(store, a)),
  );
  server.registerTool(
    'juice_update',
    {
      description: 'Partially update a taste signal.',
      inputSchema: {
        id: z.string(),
        statement: z.string().optional(),
        category: z.string().optional(),
        triggers: z.array(z.string()).optional(),
        status: z.enum(['active', 'retired']).optional(),
        confidence: z.number().optional(),
        strength: z.number().optional(),
        ...Identity,
      },
    },
    (a) => text(juice.update(store, a.id, a)),
  );
  server.registerTool(
    'juice_retire',
    { description: 'Soft-delete a taste signal.', inputSchema: { id: z.string() } },
    (a) => text(juice.retire(store, a.id)),
  );
  server.registerTool(
    'juice_list',
    {
      description: 'List taste signals.',
      inputSchema: {
        category: z.string().optional(),
        status: z.enum(['active', 'retired']).optional(),
        ...Identity,
      },
    },
    (a) => text(juice.list(store, a)),
  );
  return server;
}

export async function runStdio() {
  await createJuiceMcpServer().connect(new StdioServerTransport());
}

export async function runHttp() {
  const token = process.env.JUICE_TOKEN;
  const host = process.env.JUICE_HOST ?? '127.0.0.1';
  const port = Number(process.env.JUICE_PORT ?? 3000);

  if (!token && !LOOPBACK_HOSTS.has(host)) {
    throw new Error('JUICE_TOKEN is required when JUICE_HOST is not loopback');
  }

  const store = openStore();

  createServer(async (req, res) => {
    try {
      if (token && req.headers.authorization !== `Bearer ${token}`) {
        res.writeHead(401).end('unauthorized');
        return;
      }
      if (!req.url?.startsWith('/mcp')) {
        res.writeHead(404).end('not found');
        return;
      }

      const mcp = createJuiceMcpServer(store);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

      await mcp.connect(transport);
      await transport.handleRequest(req, res);
    } catch (err) {
      console.error('Juice MCP HTTP request failed', err);

      if (!res.headersSent) {
        res.writeHead(500).end('internal error');
      }
    }
  }).listen(port, host, () => console.error(`Juice MCP HTTP listening on ${host}:${port}`));
}
