# Claude Code guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
After background Agent or Workflow dispatch and other ready work, end the turn with a short reply.

### Select Agent or Workflow

Neither `ultracode` nor its session setting forces Workflow.
Use Workflow only for genuine multi-phase work or joins when dependencies benefit and the host permits it.
Handle bounded work directly unless delegation is requested or useful.
Use Agent for a delegated single-phase assignment.
Never add verification, review, or display phases or split a bounded task to justify Workflow.
If a genuine later phase emerges after Agent completes, consider a new Workflow run.
Only the Claude Code Main Agent may start Workflow.
If Workflow is unavailable, apply [Main's execution path](../SKILL.md#select-an-execution-path) to the remaining work.
Report native execution as unverified when it could not run.
Before an authorized Workflow run or design request, read [Workflow](../../workflow/SKILL.md) unless fully loaded.
Read linked Workgraph skills with Read because `Skill` refuses them.
Native worktree tools are `EnterWorktree` and `isolation: "worktree"`.

## Model selection

Choose the lowest sufficient tier for ordinary work.
In `workgraph:delivery`, leave `models.explore` and `models.plan` unset for routine lookup and planning.
The workflow requests Haiku for Explore and Sonnet for Plan.
Override a phase when the user or project specifies a model, or when the work calls for a higher tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.

Verify selected settings are supported and each request returns a result.
Report unavailable or substituted settings using host evidence, substituting only when permitted.
