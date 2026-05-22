import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const ocDir = join(homedir(), '.config/opencode');
const agentsPath = join(ocDir, 'AGENTS.md');
const configPath = join(ocDir, 'opencode.json');
const tokenPath = join(ocDir, 'juice-token');
const envPath = join(homedir(), '.config/juice/env');
const markerStart = '<!-- JUICE_NEGATIVE_CONSTRAINTS_START -->';
const markerEnd = '<!-- JUICE_NEGATIVE_CONSTRAINTS_END -->';
const rule = `${markerStart}\n## Juice negative constraints\n\nJuice must store only negative constraints: things to avoid, stop doing, prohibit, or not repeat. Do not store likes, preferences, positive guidance, or \"do exactly this\" instructions in Juice.\n${markerEnd}`;

run('npm', ['run', 'build']);
mkdirSync(join(ocDir, 'skills/juice'), { recursive: true });
copyFileSync(join(root, 'skills/juice/SKILL.md'), join(ocDir, 'skills/juice/SKILL.md'));

mkdirSync(ocDir, { recursive: true });
upsertMarkedSection(agentsPath, rule);

const env = readEnv(envPath);
const host = env.JUICE_HOST || '127.0.0.1';
const port = env.JUICE_PORT || '3055';
const token = env.JUICE_TOKEN || '';
const loopback = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
if (!token && !loopback.has(host))
  throw new Error('JUICE_TOKEN is required for non-loopback Juice MCP host');
if (token) {
  writeFileSync(tokenPath, token, { mode: 0o600 });
  chmodSync(tokenPath, 0o600);
}

const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
config.mcp = config.mcp && typeof config.mcp === 'object' ? config.mcp : {};
config.mcp.juice = {
  ...(config.mcp.juice || {}),
  type: 'remote',
  url: `http://${host}:${port}/mcp`,
  enabled: true,
  oauth: false,
  headers: token || existsSync(tokenPath) ? { Authorization: 'Bearer {file:juice-token}' } : {},
  timeout: 30000,
};
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

const hasService =
  spawnSync('systemctl', ['--user', 'status', 'juice.service'], { stdio: 'ignore' }).status !== 4;
if (hasService)
  spawnSync('systemctl', ['--user', 'restart', 'juice.service'], { stdio: 'inherit' });

console.log(
  'Juice OpenCode deployment updated. Restart OpenCode to reload config, skills, and AGENTS.md.',
);

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

function readEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

function upsertMarkedSection(path, section) {
  const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const re = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`);
  const next = re.test(current) ? current.replace(re, section) : `${section}\n\n${current}`;
  writeFileSync(path, next.endsWith('\n') ? next : `${next}\n`);
}
