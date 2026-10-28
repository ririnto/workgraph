# Claude Code Guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
Read Workflow for phase selection and execution.

## Model Selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.

| Model | Difficulty | Effort guidance |
| --- | --- | --- |
| `haiku` | Simple extraction | Use `low`. |
| | Bounded read-only analysis | Use `medium`, or `high` for harder tasks. |
| | Demanding bounded work | Use `xhigh`. |
| `sonnet` | Harder tasks | Use `medium`, or `high` for harder tasks. |
| `opus` | The hardest reasoning and judgment | Use `medium`, or `high` for harder tasks. |
| `fable` | Explicit request only | Follow the request. |

Where the host provides equivalent tier aliases, map each alias to its corresponding tier.
Haiku defaults to adaptive `medium` and cannot disable thinking.
With Haiku, multi-turn `xhigh` can return no visible response.
Verify that a response was produced at `xhigh` effort.
Reserve efforts above `high` for explicit or configured choices under host rules.
[Model Effort Evidence](../../../docs/model-effort-evidence.md) covers specific workloads, not universal optima.
Do not pin a specific model version.
If a requested or configured setting requires a version pin, report the incompatibility without substituting it.
When these models or effort levels are unavailable, report the limitation and use a supported alternative only when permitted.
Use supported agent and tool controls, honoring explicit user and configuration choices.
Report unavailable or substituted settings using host evidence.
