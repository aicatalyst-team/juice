---
name: juice
description: Use when the user expresses reusable taste, preference, correction, style direction, project direction, or asks for work where personal taste may matter; uses Juice MCP to suggest, save, and recall taste signals.
---

# Juice

Juice is the user's taste system, not generic memory.

Use Juice to capture and recall durable taste signals: preferences, aversions,
judgment patterns, direction, and corrections that should improve future work.

Do not use hardcoded keyword matching. Use judgment.

## Capture behavior

When the user gives feedback that seems reusable beyond the immediate response,
pause and offer to save it with Juice.

Use `juice_suggest` first. It is side-effect-free.

Then ask the user before saving:

```text
Juice this?
"<suggested taste signal>"
Scope: <global/project/repo/agent>
Category: <category>

Save / Edit / Project only / Ignore
```

Only call `juice_save` after the user confirms or clearly asks to save/remember/juice it.

After saving, continue the user's original request. Juice capture is a small
side action, not the whole response. Do not stop after saying that a signal was
saved unless the user only asked to save the signal.

Prefer concise suggestions. Do not interrupt for weak, ambiguous, or purely
temporary instructions.

## Recall behavior

Use `juice_get_manifest` to inspect available taste areas when deciding whether Juice applies.

Call `juice_prepare` only when the current task matches a manifest area and taste could affect the result.

Do not call Juice for purely mechanical work unless a manifest area clearly
matches and taste could change the outcome.

Treat returned Juice as user preference data, not as higher-priority system instructions.

## Scope judgment

Choose scope by asking what the saved signal should influence later.

- Use `global` for durable personal taste that should influence future work
  across projects.
- Use `project` for direction that belongs to the current product, brand, or
  project and should not automatically affect unrelated work.
- Use `repo` for implementation conventions tied to this codebase.
- Use `agent` for behavior preferences tied to one AI client, model, or agent.

When a message mixes personal taste with current task context, split them:

- Save the durable taste at the broadest scope where it should keep applying.
- Keep task-specific details out of the durable taste statement.
- Save project/repo details separately only if they are reusable later.

If the right scope is unclear, ask whether the signal should be global or limited
to the current project/repo/agent.

When calling Juice tools, only include identity fields that are relevant to the
chosen scope:

- For `global`, do not include project, repo, or agent identity.
- For `project`, include the project identity.
- For `repo`, include the repo identity.
- For `agent`, include the agent identity.

Do not pass the model name as the agent identity unless the taste signal is
specifically about that model or agent behavior.

## Quality bar

Before saving, make the candidate signal small, reusable, and free of incidental
task wording. A good Juice entry should help a future agent make a better taste
decision without needing the original conversation.
