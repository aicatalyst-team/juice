<p align="center">
  <img src="logo.svg" alt="Juice" width="220" />
</p>

<h1 align="center">🧃 Juice</h1>

<p align="center">
  <strong>A tiny taste layer for AI agents.</strong><br />
  <em>Save the stuff you keep correcting. Recall it when it actually matters.</em>
</p>

<p align="center">
  <a href="#mcp-tools"><img src="https://img.shields.io/badge/MCP-server-orange.svg" alt="MCP server" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D20-green.svg" alt="Node.js Version" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg" alt="TypeScript" /></a>
  <a href="https://github.com/modelcontextprotocol"><img src="https://img.shields.io/badge/status-early%20preview-111827.svg" alt="Status" /></a>
</p>

---

Juice helps agents pick up your taste over time.

Not everything belongs in memory. Juice is for preferences, corrections, and
style instincts - the little things that make work feel more like you. It keeps
those notes small, scoped, and out of context until an agent actually needs
them.

It runs as a small MCP server and ships with an agent skill that teaches models
when to capture and recall taste.

## What Juice is for

- Save taste notes from feedback you want agents to remember.
- Keep them scoped to `global`, `project`, `repo`, or `agent`.
- Let agents check a tiny manifest before pulling real taste guidance.
- Avoid dumping a whole memory file into every prompt.
- Work across OpenCode, Claude Code, Cursor, Codex, and other MCP clients.

## How it works

```text
you give feedback
  -> agent suggests a small Juice note
  -> you approve, edit, or ignore it
  -> future agents recall only the relevant notes
```

Example:

```text
User feedback:
"This copy feels too generic. Make it more direct."

Saved Juice:
"Prefers direct writing over generic copy."

Later:
An agent writing docs can recall that note before drafting.
```

## MCP tools

Juice exposes one resource and a small set of tools.

### Resource

| URI                | What it does                                                                         |
| :----------------- | :----------------------------------------------------------------------------------- |
| `juice://manifest` | Shows categories and trigger hints only. It does not include saved taste statements. |

### Tools

| Tool                 | What it does                                           |
| :------------------- | :----------------------------------------------------- |
| `juice_get_manifest` | Returns the same small manifest as `juice://manifest`. |
| `juice_prepare`      | Returns relevant taste notes for a task.               |
| `juice_suggest`      | Suggests a taste note without saving it.               |
| `juice_save`         | Saves a confirmed taste note.                          |
| `juice_update`       | Updates an existing note.                              |
| `juice_retire`       | Soft-deletes a note.                                   |
| `juice_list`         | Lists saved notes with optional filters.               |

## Scopes

| Scope     | Use it for                                              |
| :-------- | :------------------------------------------------------ |
| `global`  | Personal taste that should carry across projects.       |
| `project` | Direction for a specific product, brand, or project.    |
| `repo`    | Conventions tied to one codebase.                       |
| `agent`   | Preferences about one client, model, or agent behavior. |

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

Run as a HTTP MCP server:

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

Clients with good MCP resource support can read `juice://manifest`. Other
clients can call `juice_get_manifest` instead.

## Development

```bash
npm test
npm run build
npm run typecheck
npm run format:check
npm run format
```

<p align="center">
  Small taste notes. Better agent decisions.
</p>
