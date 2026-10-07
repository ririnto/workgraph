# Claude Code Guidance

## Orchestration

Prefer `timeout: 240000` for foreground Bash commands.
Set background command timeouts from the required execution duration.
Consider available `Monitor` for command output or external events that require action.
For requested fixed loops, prefer `/loop 4m` unless the task needs another interval.
For requested dynamic loops, prefer `delaySeconds: 240` in `ScheduleWakeup` calls when the task permits.
Use native Workflow when an assigned or identified in-scope follow-up agent needs another agent's result.
Use host Agent for independent assignments whose results Main combines.
A request to orchestrate subagents does not establish result dependencies.
Do not count a speculative future task as a follow-up agent.
Treat `/workgraph:workflow` or another explicit Workflow request as the user's tool choice, even for one stage.
Do not add display-only phases to justify implicit Workflow selection.
If implicitly selected Workflow is unavailable, report the limitation.
Use Agent for bounded outcomes only when it can safely meet the task contract.

## Model Selection

Use `haiku` for simple exploration and extraction, and `sonnet` for routine development and analysis.
Use `opus` when conflicting evidence, difficult tradeoffs, or acceptance failures justify stronger judgment.
Call `fable` only at the user's explicit request.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `haiku` | Bounded extraction and quick sweeps | Use `medium`. |
| `sonnet` | Routine coding and bounded agentic work | Use `medium`. |
| | Harder coding or reasoning | Use `high`. |
| `opus` | Complex coding and reasoning | Use `medium`, or `high` for harder tasks. |
| `fable` | The hardest or longest work | Use `high`. |
| | Difficult terminal work | Use `xhigh`. |
| | The hardest reasoning | Use `max`. |

Haiku supports `low`, `medium`, `high`, `xhigh`, and `max` effort.
Its API and Claude Code default is `medium`.
Reserve Haiku `xhigh` and `max` for workloads where evaluation shows a quality gain.
Haiku uses adaptive thinking by default.
Claude Code does not allow thinking to be disabled for Haiku.
The API accepts disabled thinking only with `low`, `medium`, or `high` effort.
Watch for empty visible responses in Haiku multi-turn sessions at `xhigh`.
Claude Code subagent `effort` frontmatter overrides session effort unless `CLAUDE_CODE_EFFORT_LEVEL` is set.
Subagents inherit the session thinking configuration and do not have a separate thinking toggle.
Claude Code does not accept `max` in persistent `effortLevel` or `modelSettings` values.
Use `max` only for a session, an effort frontmatter override, or the documented environment variable.
Leave Sonnet or Opus `xhigh` and `max` to explicit or configured choices.
