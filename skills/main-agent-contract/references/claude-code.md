# Claude Code guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
After background Agent or Workflow dispatch and other ready work, end the turn with a short reply.

### Select Agent or Workflow

Neither `ultracode` nor its session setting forces Workflow.
For delegated work, use Workflow only for multiple phases or expected follow-ups, including joins and phases conditional on predecessor results.
The first invocation can have one phase.
Use Agent for delegated work with one phase and no expected follow-up.
Exclude speculative or display-only phases.
Only the Claude Code Main Agent may start Workflow.
Before an authorized Workflow run or design request, read [Workflow](../../workflow/SKILL.md) unless fully loaded.
Read linked Workgraph skills with Read because `Skill` refuses them.
Native worktree tools are `EnterWorktree` and `isolation: "worktree"`.

## Model selection

For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.

Verify selected settings are supported and each request returns a result.
Report unavailable or substituted settings using host evidence, substituting only when permitted.
