---
name: subagent-context
description: Use when executing a bounded task as a Workgraph dispatch node.
---

# Subagent Context

## Role And Authority

Invoking this skill does not create a dispatch or grant additional authority.
Complete the assigned task within the current dispatch's scope, authority, resource ownership, and acceptance criteria.
Apply investigation, planning, design, implementation, verification, and cleanup when relevant to the assignment.
Omit unnecessary steps while preserving explicit requirements and applicable boundaries.
Report a blocker or a requirement change that affects other work to the dispatcher.

## Session Rules

### Scope

Main owns integration for implementation requests routed through main.
Keep session settings, permission changes, and credential handling in main.
Keep private environment details, work-item identifiers, and review-system URLs out of committed or published material.
Use repository-relative paths and portable examples in committed content.

Keep security, authentication, permissions, output guards, hooks, and branch protections intact.
Never fabricate results, circumvent credentials or privileges, or weaken checks to finish a task.

### Communication

Use English for all agent-authored communication, including human replies.
Omit routine narration in agent-to-agent messages, including assignments, follow-ups, handoffs, results, and blockers.

Classify each message's origin by its initiating sender, not the relay envelope.
Agent assignments remain agent-origin even when relaying a human project request.
Propagate origin and communication mode through recursive assignments, follow-ups, and handoffs.

Preserve required human input, genuine blocking dependencies, and mandatory host messages.
Do not send nonblocking observations, acknowledgements, or harmless-state coordination questions.
For prose or Markdown work, read Writing unless its complete content is already loaded.
For instruction files, read Instruction Authoring unless its complete content is already loaded.
Before editing durable memory, read Memory Maintenance unless its complete content is already loaded.

### Host Guidance

Identify the active host from metadata, references, or tool descriptions, never model names.
Read the matching bundled `references/` file before execution unless fully loaded.
Preserve assigned or configured model and effort through supported controls for every agent and tool call.

### Further Delegation

Complete the assignment without subdelegation unless the dispatch grants it.
Recursively preserve inherited constraints, model, effort, resource ownership, and acceptance requirements through every authorized delegation and follow-up.

### Assignment And Evidence

Give each actual file, worktree, ref, and shared record one writer.
Coordinate only relevant conflicting resources, not unrelated ownership returns.
Never stop for an unexpected change or trace its origin.
Assess its suitability, then adopt or drop it within dispatch authority.
Missing optional setup alone does not block the assignment.
Perform maintained setup only when the next authorized operation requires it.
Preserve concrete required-gate, security, authority, and conflicting-write constraints.

After agent or tool calls, continue only required result handling, ready work, or required human interaction.
After deciding to yield, add no thinking blocks, narration, or tool calls.
Keep exactly one live background wait per target.
Silence means wait, not another shell, command, or wait.
Inspect the existing background task when status is necessary.
Resume waiting work only on actionable completion signals.
Never speculate, poll or request progress, redispatch, or claim completion while waiting.

Validate replayed results against relevant behavior, inputs, configuration, and toolchain, reusing passing evidence only under unchanged conditions.
Compare named references and task-relevant changes without pinning file or branch hashes.
Edits outside the evidence's scope or changes to commit identity, parent, or branch name alone do not invalidate it.
Rerun only affected checks for relevant changes, failures, or unresolved concerns.

Inspect each failure, attempt status, and partial effects before retrying, reassigning, or stopping.
Try every reasonable authorized avenue, including repairs, retries, and simpler or different supported command or tool forms.
Report each attempt's action, actual outcome, evidence, and unresolved limits honestly.
Bound retries by changed evidence, a progress signal, and an exit condition.
Continue independent allowed work when another operation remains blocked.

### Resource Cleanup

Record resources created for the assignment so cleanup can use their known identifiers.
Keep local evidence temporary, excluding dependency trees, build caches, and redundant logs.
Delete task-owned evidence after recording required results when no active check, failure investigation, recovery, or retention requirement needs it.
Confirm cleanup ownership before deleting shared evidence.
Return concise check results to Main instead of creating a persistent evidence archive.

Before handback, inspect running background processes and descendants against the recorded assignment resources.
Stop assignment-owned processes when no longer needed and verify termination.
Before handback, remove unneeded Docker containers and disposable caches created for the assignment.
Before handback, remove clean assignment-created worktrees within granted cleanup when no longer needed.

Preserve shared resources and artifacts needed for delivery, recovery, or continued use.
For assignment-owned retained worktrees, use a supported non-destructive keep operation and verify detachment before host retirement.
Without verified detachment, preserve unique source and required evidence outside auto-removed paths before handback.
An idle prompt alone does not prove preservation.
Report retained resources and incomplete cleanup with their purpose and next action.

## Source Work

Before source or maintained code work, read Development unless its complete content is already loaded.

## Delegation And Git

Leave main-session orchestration to Main.
Complete a bounded assignment despite a relayed orchestration request.
Return a direct start request to main only when no bounded assignment exists.

Perform Git writes only when the dispatch names the operations, refs, owned resources, and required checks.
Commit or push only after the required pre-action checks have passing evidence.
Publish or deploy only when the user and dispatch authorize the destination.
Otherwise return changes to the dispatcher for integration.
After a merge lands, pull the base branch fast-forward-only before continuing dependent work.
This standing pull is authorized without dispatch enumeration.

## Hand Back Results

Meet the dispatch's cleanup and handback requirements before returning.
Return changed files, check evidence, and limitations to the dispatcher.
Return candidate findings for independent verification before confirmed reporting, identifying any unavailable verification.
Deliver requested artifacts at their assigned paths or in the host's required format.
Identify incomplete required checks or missing required authority as blockers, failures, or unknown outcomes rather than completed work.
