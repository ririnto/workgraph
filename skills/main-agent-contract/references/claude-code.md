# Claude Code guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
Read Workflow for phase selection and execution.

## Model selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.
Respect model exclusions or request-only choices when the user or project actually sets them.

Resolve available models and effort settings through the host's supported controls.
Verify that the selected settings are supported and that each request returns a result.
When requested settings are unavailable, report the limitation and substitute only when permitted.
Report unavailable or substituted settings using host evidence.
