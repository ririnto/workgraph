# Codex Guidance

## Orchestration

Use available native delegation tools for independent and dependent assignments.
Use plain read-only CLI contexts when native assignments arrive as unreadable tokens.
Do not retry the unreadable transport.
Let Main review the full posted diff when independent review remains blocked and an authorized fallback permits it.
When only delegated results remain, prefer `wait_agent` with `timeout_ms: 240000`.
When waiting for a yielded `functions.exec` cell, prefer `yield_time_ms: 240000` in `functions.wait` calls.
Codex does not provide Claude Code's native Workflow tool.

## Resource Cleanup

Before retiring sessions, worktrees, recovery copies, caches, or Worktree Artifact connections, read Codex Scoped Cleanup.
Skip this read when its complete content is already loaded.

## Model Selection

Select each model family's supported ID from the active host's catalog.
Use `luna` for clear tasks, including development, review, document analysis, and multistep agentic work.
Use `sol` when conflicting evidence, difficult tradeoffs, or acceptance failures justify stronger judgment.
Call `astra` only at the user's explicit request.
Start with one independent reviewer, adding depth or specialists for costly or uncovered failure modes.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `luna` | Simple exploration and extraction | Use `low`. |
| | Coding, debugging, refactoring, and code review | Use `xhigh`, or `max` for harder tasks. |
| | Other clear analysis and agentic work | Use `medium`, or `high` for harder tasks. |
| `sol` | Simple queries, conversions, and extraction | Use `low`. |
| | Ordinary development, review, and document analysis | Use `medium`. |
| | Complex debugging, algorithms, and architecture | Use `high`. |
| `astra` | Bounded work | Use `low`. |
| | Difficult terminal repairs or agentic work | Use `medium`, or `xhigh` for harder tasks. |
| | The hardest reasoning | Use `max`. |

Leave Sol `xhigh` and `max` to explicit or configured choices.
