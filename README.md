<p align="center">
  <img src="logo.svg" alt="Juice" width="220" />
</p>

<h1 align="center">🧃 Juice</h1>

<p align="center">
  <strong>A negative-constraint memory layer for AI agents.</strong><br />
  <em>Teach agents what to avoid repeating — without dumping memory into every prompt.</em>
</p>

<p align="center">
  <a href="#mcp-tools"><img src="https://img.shields.io/badge/MCP-server-orange.svg" alt="MCP server" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D20-green.svg" alt="Node.js Version" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg" alt="TypeScript" /></a>
  <a href="https://github.com/modelcontextprotocol"><img src="https://img.shields.io/badge/status-early%20preview-111827.svg" alt="Status" /></a>
</p>

---

Juice is a small MCP server for durable **avoidance constraints**: things an AI
agent should not do again.

It is not a general memory store. It deliberately stores only negative guidance:
what to avoid, stop doing, prohibit, or not repeat. Positive preferences and
"always do this" instructions are rejected unless they can be converted into a
clear avoided alternative.

Juice keeps constraints scoped, categorized, and out of context until they are
actually relevant to a task.

## Why Juice exists

AI agents repeat mistakes. Full memory files are noisy. Project rules get too
large. Juice sits between those extremes:

- Save small corrections like "Avoid generic copy when direct writing is appropriate."
- Scope constraints to `global`, `project`, `repo`, or `agent`.
- Expose a tiny manifest so agents can decide whether Juice is relevant.
- Fetch only the few matching constraints for the current task.
- Keep old positive notes inert instead of silently treating them as constraints.
- Work with OpenCode, Claude Code, Cursor, Codex, and other MCP clients.

## How it works

```text
User correction
  -> agent suggests a negative constraint
  -> user approves, edits, or ignores it
  -> Juice stores the constraint
  -> future agents recall only matching constraints
```

Example:

```text
Feedback:
"This copy feels too generic. Make it more direct."

Saved Juice constraint:
"Avoid generic copy when direct writing is appropriate."

Later:
An agent drafting landing page copy can recall that constraint before writing.
```

## What gets stored

Each saved constraint includes:

- `statement` — the avoidance constraint itself.
- `scope` — where it applies: `global`, `project`, `repo`, or `agent`.
- `category` — a stable category such as `general`, `design`, or `writing`.
- `triggers` — short terms used to decide when the constraint is relevant.
- `confidence` and `strength` — lightweight ranking signals.
- `status` — `active` or `retired`.

New constraints are stored in `juice_constraints`. Legacy `juice_records` rows
are left inert so old positive data is not reinterpreted as negative guidance.

## Categories

Juice uses a stable category registry. New databases start with:

- `general`
- `design`
- `writing`

The manifest lists registered categories even when they are empty. Use the
defaults unless a custom reusable category is clearly needed. Custom categories
must be registered before constraints can use them.

HTTP clients can use:

```http
GET /api/categories
POST /api/categories
```

Example body:

```json
{ "name": "security", "trigger_hints": ["auth", "tokens"] }
```

## MCP tools

Juice exposes one MCP resource and a small tool set.

### Resource

| URI                | What it does                                                                   |
| :----------------- | :----------------------------------------------------------------------------- |
| `juice://manifest` | Returns categories, trigger hints, and scopes. It omits constraint statements. |

### Tools

| Tool                 | What it does                                                      |
| :------------------- | :---------------------------------------------------------------- |
| `juice_get_manifest` | Returns the same small manifest as `juice://manifest`.            |
| `juice_prepare`      | Returns relevant avoidance constraints for a task.                |
| `juice_suggest`      | Suggests an avoidance constraint without saving it.               |
| `juice_add_category` | Registers a reusable category for avoidance constraints.          |
| `juice_save`         | Saves a confirmed avoidance constraint.                           |
| `juice_update`       | Updates an existing avoidance constraint.                         |
| `juice_retire`       | Retires an avoidance constraint without deleting it from storage. |
| `juice_list`         | Lists saved avoidance constraints with optional filters.          |

## Scopes

| Scope     | Use it for                                              |
| :-------- | :------------------------------------------------------ |
| `global`  | Personal constraints that should carry across projects. |
| `project` | Constraints for a specific product, brand, or project.  |
| `repo`    | Constraints tied to one codebase.                       |
| `agent`   | Constraints about one client, model, or agent behavior. |

## Web UI and HTTP API

Juice can run as a small HTTP app with:

- A mobile-friendly web UI.
- PWA/iOS home-screen assets.
- No auth for the GUI and REST API by default.
- Token protection for `/mcp` when a token is configured.

Common endpoints:

```http
GET  /
GET  /api/manifest
GET  /api/categories
POST /api/categories
GET  /api/juices
POST /api/juices
POST /api/suggest
```

## Install and run

Requires Node.js 20 or newer.

```bash
npm install
npm run build
```

Run as a local stdio MCP server:

```bash
node dist/cli.js stdio
```

Run as an HTTP MCP server:

```bash
JUICE_HOST=127.0.0.1 JUICE_PORT=3055 node dist/cli.js http
```

If you bind outside loopback, set a token:

```bash
JUICE_HOST=100.x.y.z \
JUICE_PORT=3055 \
JUICE_TOKEN='your-secure-token' \
node dist/cli.js http
```

By default, Juice stores data here:

```text
~/.local/share/juice/juice.sqlite
```

Override it with:

```bash
JUICE_DB=/path/to/juice.sqlite
```

## Install the agent skill

The bundled skill lives here:

```text
skills/juice/SKILL.md
```

Install it with `skills.sh`:

```bash
npx skills add . --global --copy --agent opencode --agent claude-code --agent codex --agent cursor
```

Or copy it manually:

| Client      | Global path                                | Project path                      |
| :---------- | :----------------------------------------- | :-------------------------------- |
| OpenCode    | `~/.config/opencode/skills/juice/SKILL.md` | `.opencode/skills/juice/SKILL.md` |
| Claude Code | `~/.claude/skills/juice/SKILL.md`          | `.claude/skills/juice/SKILL.md`   |
| Codex       | N/A                                        | `.agents/skills/juice/SKILL.md`   |
| Cursor      | N/A                                        | `.agents/skills/juice/SKILL.md`   |

Restart your agent after installing or updating the skill.

## OpenCode setup

Local stdio:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "juice": {
      "type": "local",
      "command": ["node", "/absolute/path/to/juice/dist/cli.js", "stdio"],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

Remote HTTP:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "juice": {
      "type": "remote",
      "url": "http://100.x.y.z:3055/mcp",
      "enabled": true,
      "oauth": false,
      "headers": {
        "Authorization": "Bearer your-secure-token"
      },
      "timeout": 30000
    }
  }
}
```

OpenCode also supports file substitution for tokens:

```json
"Authorization": "Bearer {file:juice-token}"
```

To point OpenCode at the bundled skill without copying it:

```json
{
  "skills": {
    "paths": ["/absolute/path/to/juice/skills"]
  }
}
```

## Other MCP clients

For local stdio clients:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/juice/dist/cli.js", "stdio"]
}
```

For remote HTTP clients:

```text
URL: http://host-or-tailscale-ip:3055/mcp
Headers:
  Authorization: Bearer <your-secure-token>
```

Clients with MCP resource support can read `juice://manifest`. Other clients can
call `juice_get_manifest` instead.

## Development

```bash
npm test
npm run build
npm run typecheck
npm run format:check
npm run format
```

<p align="center">
  Remember what to avoid. Repeat fewer mistakes.
</p>
