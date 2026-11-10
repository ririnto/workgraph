# Claude Code guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
After background Agent or Workflow dispatch and other ready work, end the turn with a short reply.

### Select Agent or Workflow

Neither `ultracode` nor its session setting forces Workflow.
Use Workflow only for genuine multi-phase work or joins when dependencies benefit and the host permits it.
A single-phase run is Agent work and must use Agent.
Never add verification, review, or display phases or split a bounded task to justify Workflow.
If a genuine later phase emerges after Agent completes, consider a new Workflow run.
Only the Claude Code Main Agent may start Workflow.
Before an authorized Workflow run or design request, read [Workflow](../../workflow/SKILL.md) unless fully loaded.
Read linked Workgraph skills with Read because `Skill` refuses them.
Native worktree tools are `EnterWorktree` and `isolation: "worktree"`.

## Model selection

For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.

Verify selected settings are supported and each request returns a result.
Report unavailable or substituted settings using host evidence, substituting only when permitted.
