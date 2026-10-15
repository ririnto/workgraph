# Claude Code Guidance

## Orchestration

Prefer `timeout: 240000` for foreground Bash commands.
Set background timeouts from required execution duration.
Consider available `Monitor` for actionable command output or external events.
For requested fixed loops, prefer `/loop 4m` unless another interval is needed.
For requested dynamic loops, prefer `delaySeconds: 240` in `ScheduleWakeup` when the task permits.
Use native Workflow to coordinate multiple agents, including independent fan-out and dependent verification.
Use it when a follow-up consumes an accepted earlier result or that result decides whether the follow-up runs.
Before authoring or resuming native Workflow, read the workflow skill unless its complete content is already loaded.
Use a single host Agent for one bounded task.
Speculative future tasks are not follow-up agents.
Do not add display-only phases for implicit Workflow selection.
If implicit Workflow is unavailable, use Agent only when it can safely meet the task contract, and report the limitation.
Rely on host notifications for tracked results.
Do not poll only to await them.

## Model Selection

Use `haiku` for clear, bounded tasks.
Escalate to `sonnet` for broader work or when Haiku misses criteria.
Use `opus` only for conflicting evidence, difficult tradeoffs, or acceptance failures.
Call `fable` only at the user's explicit request.
Follow the Main Agent Contract's model policy when assigning settings.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `haiku` | Simple exploration and extraction | Use `low`. |
| | Coding and code review | Use `medium` for small changes, `xhigh` for harder tasks, or `max` for the hardest. |
| | Other bounded analysis and agentic work | Use `medium`, or `high` for harder tasks. |
| `sonnet` | Routine coding and bounded agentic work | Use `medium`. |
| | Harder coding or reasoning | Use `high`. |
| `opus` | Complex coding and reasoning | Use `medium`, or `high` for harder tasks. |
| `fable` | The hardest or longest work | Use `high`. |
| | Difficult terminal work | Use `xhigh`. |
| | The hardest reasoning | Use `max`. |

Haiku defaults to `medium` with adaptive thinking, which cannot be disabled.
Haiku multi-turn sessions at `xhigh` can return no visible response.
Subagent `effort` frontmatter overrides session effort unless `CLAUDE_CODE_EFFORT_LEVEL` is set.
Subagents inherit session thinking and have no separate thinking toggle.
`max` is unavailable in persistent `effortLevel` and `modelSettings` values.
Use `max` only for a session, effort frontmatter, or the documented environment variable.
Leave Sonnet or Opus `xhigh` and `max` to explicit or configured choices.
