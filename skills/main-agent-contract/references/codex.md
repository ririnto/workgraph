# Codex Guidance

## Orchestration

Complete authorized work under native Codex execution rules and report results directly.
Invoke Codex sessions through herdr agents for independent and dependent assignments.
Inspect unreadable native-assignment failures and try a supported form that preserves the required task scope.
Use a plain read-only CLI context when it is an authorized, equivalent fallback.
Let Main review the full posted diff when independent review remains blocked and an authorized fallback permits it.
Use blocking `wait_agent` with `timeout_ms: 270000` to collect required native results.
Use blocking `functions.wait` with `yield_time_ms: 270000` for required yielded `functions.exec` results.
Codex does not provide Claude Code's native Workflow tool.

## Resource Cleanup

Before retiring sessions, worktrees, recovery copies, caches, or Worktree Artifact connections, read Codex Scoped Cleanup.
Skip this read when its complete content is already loaded.
Route cleanup through the authorized resource owner and supported herdr agent operations.

## Model Selection

For native Codex spawning, use the model ID the tool lists for the selected alias at call time.
Keep the alias as the recorded label.
Use `luna` (alias) for clear tasks, including development, review, document analysis, and multistep agentic work.
Use `terra` (alias) for substantive coding or refactoring that exceeds a clear bounded task.
Use `sol` (alias) when conflicting evidence, difficult tradeoffs, or acceptance failures justify stronger judgment.
Call `astra` (alias) only at the user's explicit request.
Start with one independent reviewer, adding depth or specialists for costly or uncovered failure modes.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `luna` (alias) | Simple exploration and extraction | Use `low`. |
| | Coding, debugging, refactoring, and code review | Use `xhigh`, or `max` for harder tasks. |
| | Other clear analysis and agentic work | Use `medium`, or `high` for harder tasks. |
| `terra` (alias) | Substantive coding and refactoring | Use `medium`, or `high` for harder tasks. |
| `sol` (alias) | Simple queries, conversions, and extraction | Use `low`. |
| | Ordinary development, review, and document analysis | Use `medium`. |
| | Complex debugging, algorithms, and architecture | Use `high`. |
| `astra` (alias) | Bounded work | Use `low`. |
| | Difficult terminal repairs or agentic work | Use `medium`, or `xhigh` for harder tasks. |
| | The hardest reasoning | Use `max`. |

Leave Sol `xhigh` and `max` to explicit or configured choices.
