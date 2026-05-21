<p align="center">
  <img src="logo.svg" alt="Juice Logo" width="220" />
</p>

<h1 align="center">🧃 Juice</h1>

<p align="center">
  <strong>An MCP Taste System for AI Agents</strong><br />
  <em>Not generic memory—durable taste signals that guide agents when it matters most.</em>
</p>

<p align="center">
  <a href="#-mcp-tools--resources"><img src="https://img.shields.io/badge/MCP-Protocol-orange.svg" alt="Model Context Protocol" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D20-green.svg" alt="Node.js Version" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg" alt="TypeScript" /></a>
  <a href="https://github.com/modelcontextprotocol"><img src="https://img.shields.io/badge/Status-Early%20Preview-111827.svg" alt="Status" /></a>
</p>

---

**Juice** is a lightweight, specialized Model Context Protocol (MCP) server designed to act as an agent's **taste system**.

Unlike generic memory systems that store everything indiscriminately, Juice is built specifically to capture and recall **durable taste signals**—preferences, style directions, judgment patterns, and formatting choices. It returns highly compact guidance only when the agent is performing a task where personal or project-level taste actually affects the outcome.

---

## ✨ Features & Philosophy

- **Taste ≠ Generic Memory:** Juice doesn't store chat history or factual knowledge. It stores _stylistic and qualitative preferences_.
- **Compact & Context-Aware:** Exposes a lightweight trigger manifest so agents can quickly determine if they have relevant taste signals _before_ pulling full details.
- **Scoped Architecture:** Organize taste signals by context—`global`, `project`, `repo`, or `agent`.
- **Seamless Integrations:** Bundled as an agent skill and fully compatible with **OpenCode**, **Claude Code**, **Cursor**, **Codex**, and other modern MCP clients.

---

## 🛠️ MCP Tools & Resources

Juice exposes a clean, programmatic interface via MCP tools and a specialized URI resource.

### Resource

| URI                | Description                                                                                                                                                       |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `juice://manifest` | Returns a compact trigger manifest containing categories and trigger hints only. **Does not** include full taste statements, keeping context windows lightweight. |

### Tools

| Tool                 | Parameters                                                                             | Description                                                                                             |
| :------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `juice_get_manifest` | None                                                                                   | Returns the same compact trigger manifest as the resource (ideal for clients without resource support). |
| `juice_prepare`      | `task`, optional `limit`, optional scope identity                                      | Returns only the taste signals relevant to a task.                                                      |
| `juice_suggest`      | `feedback`, optional scope identity                                                    | Proposes a taste signal for review without saving it.                                                   |
| `juice_save`         | `statement`, optional `category`, `triggers`, `confidence`, `strength`, scope identity | Saves a confirmed taste signal.                                                                         |
| `juice_update`       | `id`, optional fields to change                                                        | Updates an existing taste signal.                                                                       |
| `juice_retire`       | `id`                                                                                   | Soft-deletes/retires a taste signal.                                                                    |
| `juice_list`         | optional `category`, `status`, scope identity                                          | Lists saved taste signals with optional filters.                                                        |

### Scopes

- 🌍 **`global`**: Durable personal preferences that should influence work across all projects.
- 📁 **`project`**: Direction tied to a specific product, brand, or project context.
- 💻 **`repo`**: Implementation and styling conventions tied to a specific codebase.
- 🤖 **`agent`**: Behavior and interaction preferences tied to a specific AI client or model.

---

## 🚀 Installation & Local Run

### 1. Build the Server

Ensure you have Node.js (>= 20) installed, then clone the repo and build:

```bash
npm install
npm run build
```

### 2. Run the MCP Server

#### Stdio Mode (Recommended for local clients)

```bash
node dist/cli.js stdio
```

#### HTTP Mode (Recommended for remote/containerized setups)

```bash
JUICE_HOST=127.0.0.1 JUICE_PORT=3055 node dist/cli.js http
```

For non-loopback HTTP, protect your server with an authorization token:

```bash
JUICE_HOST=100.x.y.z \
JUICE_PORT=3055 \
JUICE_TOKEN='your-secure-token' \
node dist/cli.js http
```

### Database Location

By default, Juice stores taste signals in a SQLite database:

```text
~/.local/share/juice/juice.sqlite
```

You can override this path by setting the `JUICE_DB` environment variable:

```bash
JUICE_DB=/path/to/custom-juice.sqlite
```

---

## 🧠 The Juice Agent Skill

Juice is more than just raw tools—it comes bundled with an **agent skill** that teaches models _how and when_ to capture and recall taste.

The canonical skill definition is located at:

```text
skills/juice/SKILL.md
```

### Automatic Installation (using `skills.sh`)

You can install the Juice skill globally across popular agent harnesses using the `skills` CLI:

```bash
npx skills add . --global --copy --agent opencode --agent claude-code --agent codex --agent cursor
```

### Manual Installation

Copy `skills/juice` (or the `SKILL.md` file) directly into your harness's skill directory:

| Client / Harness | Global Path                                | Project-Local Path                |
| :--------------- | :----------------------------------------- | :-------------------------------- |
| **OpenCode**     | `~/.config/opencode/skills/juice/SKILL.md` | `.opencode/skills/juice/SKILL.md` |
| **Claude Code**  | `~/.claude/skills/juice/SKILL.md`          | `.claude/skills/juice/SKILL.md`   |
| **Codex**        | —                                          | `.agents/skills/juice/SKILL.md`   |
| **Cursor**       | —                                          | `.agents/skills/juice/SKILL.md`   |

> 💡 **Note:** Always restart your agent client after installing or updating skills.

---

## ⚙️ Configuration

### 1. OpenCode Integration

OpenCode can communicate with Juice via a local stdio connection or a remote HTTP connection. Add the configuration to your global `~/.config/opencode/opencode.json` or project-specific `opencode.json`.

#### Local Stdio Configuration

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

#### Remote HTTP Configuration

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

> 🔑 **Tip:** If your token is stored in a file next to the config, OpenCode supports file substitution:
> `"Authorization": "Bearer {file:juice-token}"`

#### OpenCode Skill Discovery

OpenCode automatically scans global skills under `~/.config/opencode/skills/**/SKILL.md`. For project-local setups, copy the skill to `.opencode/skills/juice/SKILL.md` or point OpenCode to the skill folder in your configuration:

```json
{
  "skills": {
    "paths": ["/absolute/path/to/juice/skills"]
  }
}
```

---

### 2. Other MCP Clients

#### Stdio Setup

For clients running on the same machine (e.g., Claude Desktop, Cursor):

```json
{
  "command": "node",
  "args": ["/absolute/path/to/juice/dist/cli.js", "stdio"]
}
```

#### Remote HTTP Setup

For remote clients, connect to the streamable HTTP endpoint:

```text
URL: http://host-or-tailscale-ip:3055/mcp
Headers:
  Authorization: Bearer <your-secure-token>
```

---

## 🛠️ Development

Get involved or customize Juice for your own workflow:

```bash
# Run tests
npm test

# Build production files
npm run build

# Run type checking
npm run typecheck

# Check formatting
npm run format:check

# Auto-format codebase
npm run format
```

---

<p align="center">
  Small taste signals. Better agent decisions.
</p>
