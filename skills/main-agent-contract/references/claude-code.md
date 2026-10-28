# Claude Code Guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
Read Workflow for phase selection and execution.

## Model Selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.
Use these tier anchors only where the host supports them.

| Model | Difficulty | Effort guidance |
| --- | --- | --- |
| `haiku` (light) | Trivial to harder bounded work. | Use low for simple work, medium or high for harder work, or `xhigh` when supported and permitted. |
| `sonnet` (middle) | Harder tasks. | Use medium or high effort. |
| `opus` (strong) | The hardest reasoning and judgment. | Use medium or high effort. |
| `fable` | Explicit request only. | Follow the request and host support. |

Where the host provides equivalent tier aliases, map each alias to its corresponding tier.
Light-tier equivalents may use up to their host-supported maximum effort.
For supported configurations, Haiku defaults to adaptive medium and cannot disable thinking.
With Haiku, multi-turn `xhigh` can return no visible response.
Verify that a response was produced at `xhigh` and higher supported effort levels.
Reserve efforts above high for explicit or configured choices under host rules.
[Model Effort Evidence](../../../docs/model-effort-evidence.md) covers specific workloads, not universal optima.
Do not pin a specific model version.
When these models or effort levels are unavailable, report the limitation and use a supported alternative only when permitted.
Use supported agent and tool controls, honoring explicit user and configuration choices.
Report unavailable or substituted settings using host evidence.
