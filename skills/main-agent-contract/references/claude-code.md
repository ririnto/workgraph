# Claude Code Guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
Read Workflow for phase selection and execution.

## Model Selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.
Where supported, use `haiku` as the light tier with low effort for trivial or narrowly bounded simple work.
Use `sonnet` as the middle tier with medium or high effort for harder tasks.
Use `opus` for the hardest reasoning and judgment with high or maximum supported effort.
Use `fable` only on explicit request.
Where the host provides equivalent tier aliases, map each alias to its corresponding tier.
Do not pin a specific model version.
When these models or effort levels are unavailable, report the limitation and use a supported alternative only when permitted.
Use supported agent and tool controls, honoring explicit user and configuration choices.
Report unavailable or substituted settings using host evidence.
