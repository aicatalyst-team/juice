import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { openStore, type Store } from './store.js';
import * as juice from './juice.js';
import { createJuiceHttpServer, LOOPBACK_HOSTS } from './http.js';

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
    {
      description:
        'Return stable Juice category manifest without avoidance constraint statements. Defaults are general, design, and writing.',
    },
    () => text(juice.manifest(store)),
  );
  server.registerTool(
    'juice_add_category',
    {
      description:
        'Register a reusable avoidance constraint category with optional JSON trigger hints.',
      inputSchema: { name: z.string(), trigger_hints: z.array(z.string()).optional() },
    },
    (a) => text(juice.addCategory(store, a)),
  );
  server.registerTool(
    'juice_suggest',
    {
      description: 'Suggest a negative avoidance constraint without saving.',
      inputSchema: { feedback: z.string(), ...Identity },
    },
    (a) => text(juice.suggest(a)),
  );
  server.registerTool(
    'juice_save',
    {
      description:
        'Create and save a negative avoidance constraint. Custom categories must already be registered.',
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
      description: 'Return relevant avoidance constraints for a task.',
      inputSchema: { task: z.string(), limit: z.number().optional(), ...Identity },
    },
    (a) => text(juice.prepare(store, a)),
  );
  server.registerTool(
    'juice_update',
    {
      description: 'Partially update an avoidance constraint.',
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
    { description: 'Soft-delete an avoidance constraint.', inputSchema: { id: z.string() } },
    (a) => text(juice.retire(store, a.id)),
  );
  server.registerTool(
    'juice_list',
    {
      description: 'List avoidance constraints.',
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

  createJuiceHttpServer({ store: openStore(), host, token }).listen(port, host, () =>
    console.error(`Juice MCP HTTP listening on ${host}:${port}`),
  );
}
