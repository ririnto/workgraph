---
name: subagent-context
description: Use when executing a bounded task as a Workgraph dispatch node.
---

# Subagent context

## Complete the assigned outcome

Invoking this skill does not create a dispatch or grant additional authority.
Complete the assigned task within the current dispatch's scope, authority, resource ownership, and acceptance criteria.
Apply investigation, planning, design, implementation, verification, and cleanup when relevant to the assignment.
Scale methods and checks to the assignment's scope, risk, and available evidence.
Follow explicit user and assignment requirements over Workgraph workflow defaults within host, safety, and authorization boundaries.
Report a blocker or a requirement change that affects other work to the dispatcher.

## Follow session boundaries

### Protect session boundaries

Main owns integration for implementation requests routed through main.
Leave session settings, permission changes, and credential handling to Main unless explicitly delegated within existing authority.
Keep private environment details, work-item identifiers, and review-system URLs out of committed or published material.
Use repository-relative paths and portable examples in committed content.

Keep security, authentication, permissions, output guards, hooks, and branch protections intact.
Never fabricate results, circumvent credentials or privileges, or weaken checks to finish a task.

### Communicate by request origin

Follow the assigned language and communication requirements.

Classify each message's origin by its initiating sender, not the relay envelope.
Agent assignments remain agent-origin even when relaying a human project request.
Propagate origin and communication mode through recursive assignments, follow-ups, and handoffs.

Preserve required human input, genuine blocking dependencies, and mandatory host messages.
For prose, Markdown, or instruction work, read Writing unless its complete content is already loaded.
Before editing durable memory, read Memory Maintenance unless its complete content is already loaded.

### Select host guidance

Identify the active host from metadata, references, or tool descriptions, never model names.
Read the matching bundled host reference before execution when present and not already loaded.
Otherwise, follow the active host's tool descriptions.
Preserve assigned or configured model and effort through supported controls for every agent and tool call.

### Respect delegation authority

Subdelegate within the assignment's scope when it improves the outcome, unless the user or dispatcher restricts delegation.
Recursively preserve inherited constraints, model, effort, resource ownership, and acceptance requirements through every authorized delegation and follow-up.

### Manage assignment ownership

Give each actual file, worktree, ref, and shared record one writer.
Coordinate only relevant conflicting resources, not unrelated ownership returns.
Assess unexpected changes against the task and applicable safety boundaries before adopting them.
Missing optional setup alone does not block the assignment.
Perform maintained setup only when the next authorized operation requires it.
Preserve concrete required-gate, security, authority, and conflicting-write constraints.

#### Wait for assigned work

Keep exactly one live background wait per target.
Continue ready work while waiting, and avoid duplicate dispatch or unsupported completion claims.

#### Reuse evidence and resolve failures

Validate replayed results against relevant behavior, inputs, configuration, and toolchain, reusing passing evidence only under unchanged conditions.
Compare relevant references and task-relevant changes against the evidence's scope.
Edits outside the evidence's scope or changes to commit identity, parent, or branch name alone do not invalidate it.
Rerun only affected checks for relevant changes, failures, or unresolved concerns.

Inspect each failure, attempt status, and partial effects before retrying, reassigning, or stopping.
Use proportionate, authorized repairs or supported alternatives guided by failure evidence.
Report each attempt's action, actual outcome, evidence, and unresolved limits honestly.
Bound retries by changed evidence, a progress signal, and an exit condition.
Continue independent allowed work when another operation remains blocked.

### Return owned resources

Record resources created for the assignment so cleanup can use their known identifiers.
Keep local evidence temporary, excluding dependency trees, build caches, and redundant logs.
Delete task-owned evidence after recording required results when no active check, failure investigation, recovery, or retention requirement needs it.
Confirm cleanup ownership before deleting shared evidence.
Return check results in the requested format and retain an evidence archive when requested or needed for acceptance.

#### Retire owned resources

Before handback, inspect running background processes and descendants against the recorded assignment resources.
Stop assignment-owned processes when no longer needed and verify termination.
Before handback, remove unneeded Docker containers and disposable caches created for the assignment.
Before handback, remove clean assignment-created worktrees within granted cleanup when no longer needed.

#### Preserve retained work

Preserve shared resources and artifacts needed for delivery, recovery, or continued use.
For assignment-owned retained worktrees, use a supported non-destructive keep operation and verify detachment before host retirement.
Without verified detachment, preserve unique source and required evidence outside auto-removed paths before handback.
An idle prompt alone does not prove preservation.
Report retained resources and incomplete cleanup with their purpose and next action.

## Apply source procedures

Before source work or runtime verification, read Development unless its complete content is already loaded.

## Respect Git and delegation authority

Leave main-session orchestration to Main.
Complete a bounded assignment despite a relayed orchestration request.
Return a direct start request to main only when no bounded assignment exists.

Perform Git writes within the assignment's established authority, destinations, ownership, and required checks.
Commit or push only after the required pre-action checks have passing evidence.
Publish or deploy only when the user and dispatch authorize the destination.
Otherwise return changes to the dispatcher for integration.
Synchronize the authorized base before dependent work after a merge, using fast-forward-only updates by default.
Use another authorized sync method when it preserves protected refs and owned work.

## Hand back results

Meet the dispatch's cleanup and handback requirements before returning.
Return changed files, check evidence, and limitations to the dispatcher.
Report supported findings with evidence and identify unresolved uncertainty.
Route findings for independent verification when the task requires it, identifying any unavailable required verification.
Deliver requested artifacts at their assigned paths or in the host's required format.
Identify incomplete required checks or missing required authority as blockers, failures, or unknown outcomes rather than completed work.
