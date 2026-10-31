# Codex guidance

## Orchestration

Complete authorized work under native Codex execution rules and report results directly.
Use available authorized host controls for independent and dependent assignments.
Inspect unreadable native-assignment failures and try a supported form that preserves the required task scope.
Use a plain read-only CLI context when it is an authorized, equivalent fallback.
Let Main review the full posted diff when independent review remains blocked and an authorized fallback permits it.
Use the host's supported wait controls to collect required results.
Codex does not provide Claude Code's native Workflow tool.

## Subagent context

Choose inherited history from the assignment's context needs and the active tool schema.
V2 `fork_turns` defaults to `"all"`, which inherits parent history.
Use `"all"` when relevant decisions or corrections span that history.
Use `"none"` when a complete assignment brief and selected evidence supply the required context.
For V1 `fork_context`, `true` inherits history and `false` or omission starts without parent history.

Neither form provides a recent-turn count.
Do not use numeric `fork_turns` values, which legacy handling can interpret as all history.
For selected recent context, use the supported no-history form with the relevant excerpts or a complete brief.
Preserve earlier requirements needed for the outcome and report an unsupported exact history limit when requested.
Preserve assigned settings and budgets when selecting history or continuing work.

## Worker turns and continuation

A Codex turn contains a request and the resulting work, including its tool calls.
Size assignments around coherent outcomes and their acceptance evidence.
Allow necessary investigation and verification within the assigned budget.
Do not add `max_turns` when the worker API lacks it or interpret `fork_turns` as an execution budget.

Continue an existing worker when the next assignment depends on its context.
Use a fresh worker when independent work or a fresh assessment benefits the task.
In V2, `followup_task` starts a turn for an idle worker and delivers steering when it is already running.
Use `send_message` for information that should not start a new turn.
In V1, use the available `send_input` and interruption controls.

When a worker stops before acceptance, inspect its result and remaining budget before supported continuation or reassignment.
Keep unmet acceptance visible when an actual limit prevents completion.
A wait timeout ends the wait without stopping the worker or completing its assignment.
Inspect actual worker status and continue supported waiting without duplicate dispatch.

## Resource cleanup

Before retiring sessions, worktrees, recovery copies, caches, or Worktree Artifact connections, read Codex Scoped Cleanup.
Skip this read when its complete content is already loaded.

## Model selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.
Respect model exclusions or request-only choices when the user or project actually sets them.
Resolve each tier at call time using the host's model list and supported controls.
For native Codex invocations, use the host-confirmed full model ID, never a bare alias or Claude-family name.

Verify that each request returns a result.
When requested settings are unavailable, report the limitation and substitute only when permitted.
Report unavailable or substituted settings using host evidence.
