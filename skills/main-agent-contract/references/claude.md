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
On the Anthropic API, `haiku` resolves to Haiku 5.5.
Claude Code resolves that alias to Haiku 4.5 on Claude Platform on AWS, Bedrock, Google Cloud, and Microsoft Foundry.
Use a provider-supported exact model ID when a specific Haiku release is required.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `haiku` | Bounded extraction and quick sweeps | Use `medium` for Haiku 5.5, and leave effort unset for Haiku 4.5. |
| `sonnet` | Routine coding and bounded agentic work | Use `medium`. |
| | Harder coding or reasoning | Use `high`. |
| `opus` | Complex coding and reasoning | Use `medium`, or `high` for harder tasks. |
| `fable` | The hardest or longest work | Use `high`. |
| | Difficult terminal work | Use `xhigh`. |
| | The hardest reasoning | Use `max`. |

Haiku 5.5 supports `low`, `medium`, `high`, `xhigh`, and `max` effort, with `medium` as the API and Claude Code default.
Use `high` for longer tasks or strict instruction following, and reserve `xhigh` or `max` for workloads where evaluation shows a quality gain.
Haiku 5.5 uses adaptive thinking by default and does not accept a manual thinking budget.
Claude Code does not allow thinking to be disabled for Haiku 5.5.
The API accepts disabled thinking only with `low`, `medium`, or `high` effort.
Watch for empty visible responses in Haiku 5.5 multi-turn sessions at `xhigh`.
Claude Code subagent `effort` frontmatter overrides session effort unless `CLAUDE_CODE_EFFORT_LEVEL` is set.
Subagents inherit the session thinking configuration and do not have a separate thinking toggle.
Claude Code does not accept `max` in persistent `effortLevel` or `modelSettings` values.
Use `max` only for a session, an effort frontmatter override, or the documented environment variable.
Leave Haiku 4.5's manual thinking budget and Sonnet or Opus `xhigh` and `max` to explicit or configured choices.
