# Claude Code Guidance

## Orchestration

Prefer `timeout: 240000` for foreground Bash.
Match background timeouts to required duration.
Consider available `Monitor` for actionable output or external events.
For requested fixed loops, prefer `/loop 4m` unless another interval is needed.
For requested dynamic loops, prefer `delaySeconds: 240` in `ScheduleWakeup` when the task permits.
Prefer Agent for one phase.
Read Workflow before using it.
Yield when only callbacks remain, then inspect results.

## Model Selection

Absent user or configuration overrides, use `opus` for Main, `haiku` for read-only scans, and `sonnet` for edits.
Give each editor an isolated worktree and return its diff to Main for review and delivery.
Prefer authorized, available ultracode for substantive orchestration without automatically changing session settings.
Aliases target Opus, Haiku, and Sonnet 5.5, subject to host routing and overrides.
Report unavailable or substituted settings using host evidence.
Use `fable` only when explicitly requested.
Start with one independent reviewer, adding specialists for costly or uncovered failures.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `haiku` | Extraction | Use `low`. |
| | Bounded read-only analysis | Use `medium`, or `high` for harder tasks. |
| `sonnet` | Edits and code review | Use `medium`, or `high` for harder tasks. |
| `opus` | Planning and complex reasoning | Use `medium`, or `high` for harder tasks. |
| `fable` | Explicitly requested work | Use `high`, `xhigh` for difficult terminal work, or `max` for the hardest reasoning. |

Haiku defaults to adaptive `medium` and cannot disable thinking.
Haiku multi-turn `xhigh` can return no visible response.
Subagent effort frontmatter overrides session effort unless `CLAUDE_CODE_EFFORT_LEVEL` is set.
Subagents inherit thinking without a separate toggle.
Use `max` only per session, effort frontmatter, or environment variable, never persistent `effortLevel` or `modelSettings`.
Reserve Sonnet and Opus `xhigh` and `max` for explicit or configured choices.
