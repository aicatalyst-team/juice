#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENTS="${AGENTS:-opencode claude-code codex cursor}"
MODE="${MODE:---copy}"
SCOPE="${SCOPE:---global}"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to install skills with skills.sh" >&2
  exit 1
fi

args=(skills add "$ROOT" "$SCOPE" "$MODE")
for agent in $AGENTS; do
  args+=(--agent "$agent")
done

echo "Installing Juice skill for: $AGENTS"
npx "${args[@]}"
