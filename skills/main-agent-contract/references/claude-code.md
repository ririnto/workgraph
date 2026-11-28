# Claude Code guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
After background Agent dispatch and other ready work, end the turn with a short reply.

Handle bounded work directly unless delegation is requested or useful.
Use Agent for delegated assignments under [Main's execution path](../SKILL.md#select-an-execution-path).
Report native execution as unverified when it could not run.
Read linked Workgraph skills with Read because `Skill` refuses them.
Native worktree tools are `EnterWorktree` and `isolation: "worktree"`.

## Model selection

Choose the lowest sufficient tier for ordinary work.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.

Verify selected settings are supported and each request returns a result.
Report unavailable or substituted settings using host evidence, substituting only when permitted.
