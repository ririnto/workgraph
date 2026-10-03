# Claude Code Guidance

## Orchestration

Use native Workflow when an assigned or identified in-scope follow-up agent needs another agent's result.
Use host Agent for independent assignments whose results Main combines.
A request to orchestrate subagents does not establish result dependencies.
Do not count a speculative future task as a follow-up agent.
Treat `/workgraph:workflow` or another explicit Workflow request as the user's tool choice, even for one stage.
Do not add display-only phases to justify implicit Workflow selection.
If implicitly selected Workflow is unavailable, report the limitation.
Use Agent for bounded outcomes only when it can safely meet the task contract.

## Model Selection

Choose a supported model for the task's difficulty.
Use each family's current model guidance and workload evidence to adjust these effort starting points.
Do not select the highest effort automatically.
Call `fable` only at the user's explicit request.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `haiku` | Bounded extraction and quick sweeps | Leave effort unset when the model has no effort control. |
| | Tasks that may benefit from extended thinking | Evaluate a supported manual thinking budget separately from effort. |
| `sonnet` | Routine coding and bounded agentic work | Use `medium`. |
| | Harder coding or reasoning | Start at `high`. |
| | Work requiring more quality | Compare Opus `medium` or `high` before increasing Sonnet effort. |
| `opus` | Complex coding and reasoning | Use `medium`, or `high` for harder tasks. |
| | Effort above high | Avoid `xhigh` and `max` unless comparable-task evidence justifies added latency and cost. |
| `fable` | The hardest or longest work | Start at `high`. |
| | Difficult terminal work | Compare `xhigh` before testing `max`. |
| | Harder reasoning | Evaluate `max` when required gains justify added cost. |

Treat manual thinking budgets and effort as separate controls.
Use Sonnet `xhigh` or `max` only when comparable-task evidence favors them over available Opus settings.
