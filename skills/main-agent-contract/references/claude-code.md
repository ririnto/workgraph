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
| `haiku` (light) | Trivial or narrowly bounded simple work. | Use low effort. |
| `sonnet` (middle) | Harder tasks. | Use medium or high effort. |
| `opus` (strong) | The hardest reasoning and judgment. | Use high or maximum supported effort. |
| `fable` | Explicit request only. | Use supported effort suited to the task or request. |

Where the host provides equivalent tier aliases, map each alias to its corresponding tier.
Do not pin a specific model version.
When these models or effort levels are unavailable, report the limitation and use a supported alternative only when permitted.
Use supported agent and tool controls, honoring explicit user and configuration choices.
Report unavailable or substituted settings using host evidence.
