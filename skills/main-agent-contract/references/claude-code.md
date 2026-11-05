# Claude Code guidance

## Orchestration

Use supported callback and wait controls for pending host operations.

### Select Agent or Workflow

These tool-selection rules apply only to the Claude Code Main Agent.
Neither the `ultracode` keyword nor the ultracode session setting is a flag that forces Workflow use.
Do not use Workflow for work that ends in a single phase with no possible follow-up phase.
Use Agent when Agent is sufficient, including independent one-phase assignments.
Select Workflow when actual dependent phases, required joins, or conditional follow-ups need its continuation, even if the first invocation has one phase.
Exclude speculative future tasks and display-only phases.
Only the Claude Code Main Agent may start Workflow.
Before an authorized Workflow run or Workflow design request, read Workflow unless its complete content is already loaded.

## Model selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.
Respect model exclusions or request-only choices when the user or project actually sets them.

Resolve available models and effort settings through the host's supported controls.
Verify that the selected settings are supported and that each request returns a result.
Report unavailable or substituted settings using host evidence, and substitute only when permitted.
