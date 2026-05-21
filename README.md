# Juice

Juice is a small MCP taste system for AI agents. It is not generic memory: it
stores durable taste signals and returns compact guidance when taste could affect
the result.

Juice exposes both:

- MCP tools for programmatic use.
- An agent skill at `skills/juice/SKILL.md` that teaches agents when to use the
  tools.

## MCP tools and resource

Resource:

- `juice://manifest` — compact trigger manifest with categories and trigger
  hints only. It does not include saved taste statements.

Tools:

- `juice_get_manifest` — returns the same manifest as the resource.
- `juice_prepare` — returns relevant taste signals for a task.
- `juice_suggest` — proposes a taste signal without saving it.
- `juice_save` — saves a confirmed taste signal.
- `juice_update` — updates a signal.
- `juice_retire` — soft-deletes a signal.
- `juice_list` — lists signals.

Scopes:

- `global`
- `project`
- `repo`
- `agent`

## Run locally

```bash
npm install
npm run build
```

Stdio MCP mode:

```bash
node dist/cli.js stdio
```

HTTP MCP mode:

```bash
JUICE_HOST=127.0.0.1 JUICE_PORT=3055 node dist/cli.js http
```

For non-loopback HTTP, set a token:

```bash
JUICE_HOST=100.x.y.z \
JUICE_PORT=3055 \
JUICE_TOKEN='change-me' \
node dist/cli.js http
```

Default DB path:

```text
~/.local/share/juice/juice.sqlite
```

Override with:

```bash
JUICE_DB=/path/to/juice.sqlite
```

## Install the Juice skill

The canonical skill is bundled here:

```text
skills/juice/SKILL.md
```

### Using skills.sh

Install globally for common agent harnesses:

```bash
npx skills add . --global --copy --agent opencode --agent claude-code --agent codex --agent cursor
```

Or use the helper script:

```bash
./scripts/install-skill.sh
```

Customize targets:

```bash
AGENTS="opencode claude-code" ./scripts/install-skill.sh
```

By default the script uses `--copy` and `--global`. Override if you prefer
symlinks or project-local installs:

```bash
MODE="" SCOPE="" ./scripts/install-skill.sh
```

### Manual skill paths

Copy `skills/juice` to the skill directory for your harness:

```text
OpenCode global:    ~/.config/opencode/skills/juice/SKILL.md
OpenCode project:   .opencode/skills/juice/SKILL.md
Claude global:      ~/.claude/skills/juice/SKILL.md
Claude project:     .claude/skills/juice/SKILL.md
Codex project:      .agents/skills/juice/SKILL.md
Cursor project:     .agents/skills/juice/SKILL.md
```

Restart the agent after installing or updating a skill.

## Configure OpenCode

OpenCode can use Juice through a local stdio MCP server or a remote HTTP MCP
server.

### Local stdio

Add this to `~/.config/opencode/opencode.json` or project `opencode.json`:

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

### Remote HTTP

If Juice is running as an HTTP MCP server:

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
        "Authorization": "Bearer your-token"
      },
      "timeout": 30000
    }
  }
}
```

If the token is in a file next to the config, OpenCode supports file
substitution:

```json
"Authorization": "Bearer {file:juice-token}"
```

### OpenCode skill discovery

OpenCode automatically scans global skills under:

```text
~/.config/opencode/skills/**/SKILL.md
```

For a project-local install, copy the skill to:

```text
.opencode/skills/juice/SKILL.md
```

Or point OpenCode at this repo's skill folder:

```json
{
  "skills": {
    "paths": ["/absolute/path/to/juice/skills"]
  }
}
```

Restart OpenCode after changing config or skills.

## Configure other MCP clients

Use stdio when the client runs on the same machine as Juice:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/juice/dist/cli.js", "stdio"]
}
```

Use Streamable HTTP when Juice runs remotely:

```text
http://host-or-tailscale-ip:3055/mcp
Authorization: Bearer <token>
```

Clients with MCP resource support can attach/read `juice://manifest`. Clients
that do not expose resources well should call `juice_get_manifest` instead.

## Development

```bash
npm test
npm run build
npm run typecheck
npm run format:check
```

Format:

```bash
npm run format
```
