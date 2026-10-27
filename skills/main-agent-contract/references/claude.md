# Claude Code Guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
Read Workflow for phase selection and execution.

## Model Selection

Unless overridden, use `opus` for Main, `haiku` for read-only scans, and `sonnet` for edits.
Return editor diffs to Main for review and delivery.
Use model and effort controls exposed by the host, honoring explicit user and configuration choices.
Report unavailable or substituted settings using host evidence.
Use `fable` only on explicit request.
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
