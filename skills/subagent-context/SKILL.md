---
name: subagent-context
description: Use when executing a bounded task as a Workgraph dispatch node.
disable-model-invocation: true
---

# Subagent context

## Complete the assigned outcome

- Invocation creates no dispatch or authority.
- Complete the assigned outcome within its scope, authority, ownership, and acceptance criteria.
- For understood, reversible work with limited impact, act directly and run relevant checks.
- Use a short plan for bounded changes and deeper checks for uncertainty or serious consequences.
- File count alone does not determine rigor.
- Reassess as evidence changes, preserving required checks and the assigned outcome.
- Honor user and assignment requirements over defaults within host, safety, and authority boundaries.
- Report blockers or changes affecting other work to the dispatcher.

## Follow session boundaries

### Protect session boundaries

Main owns integration for implementation requests routed through main.
Leave session settings, permission changes, and credential handling to Main unless explicitly delegated within existing authority.
Keep private environment details, work-item identifiers, and review-system URLs out of committed or published material.
Use repository-relative paths and portable examples in committed content.

Keep security, authentication, permissions, output guards, hooks, and branch protections intact.
Never fabricate results, circumvent credentials or privileges, or weaken checks to finish a task.

### Communicate by request origin

Write handbacks and other agent-to-agent communication in English.

Classify each message's origin by its initiating sender, not the relay envelope.
Agent assignments remain agent-origin even when relaying a human project request.
Use the requester's language only for replies the assignment routes to the human.

Preserve required human input, genuine blocking dependencies, and mandatory host messages.
For Markdown, YAML, or agent instruction work, read [Writing](../writing/SKILL.md) unless its complete content is already loaded.
Before editing durable memory, read [Memory Maintenance](../memory-maintenance/SKILL.md) unless its complete content is already loaded.

### Select host guidance

Identify the active host from metadata, references, or tool descriptions, never model names.
Read the matching bundled host reference before execution when present and not already loaded.
Otherwise, follow the active host's tool descriptions.
Set model and effort for every subdelegated task through supported controls under applicable user, project, configured, and assignment rules.

### Respect delegation authority

Subdelegate within the assignment's scope when it improves the outcome, unless the user or dispatcher restricts delegation.
Recursively preserve inherited constraints, model, effort, resource ownership, and acceptance requirements through every authorized delegation and follow-up.

### Manage assignment ownership

Give each actual file, worktree, ref, and shared record one writer.
Create needed worktrees with native host tools before manual Git worktrees.
Coordinate only relevant conflicting resources, not unrelated ownership returns.
Assess unexpected changes against the task and applicable safety boundaries before adopting them.
Missing optional setup alone does not block the assignment.
Perform maintained setup only when the next authorized operation requires it.
Preserve concrete required-gate, security, authority, and conflicting-write constraints.

#### Wait for assigned work

Keep exactly one live background wait per target.
Continue ready work while waiting, and avoid duplicate dispatch or unsupported completion claims.

#### Reuse evidence and resolve failures

- Validate replayed results against relevant behavior, inputs, configuration, and toolchain, reusing passing evidence only under unchanged conditions.
- Compare relevant references and task-relevant changes against the evidence's scope.
- Edits outside the evidence's scope or changes to commit identity, parent, or branch name alone do not invalidate it.
- Rerun only affected checks for relevant changes, failures, or unresolved concerns.

- Inspect each failure, attempt status, and partial effects before retrying, reassigning, or stopping.
- Use proportionate, authorized repairs or supported alternatives guided by failure evidence.
- Fix in-scope defects within authority instead of only reporting them.
- Report each attempt's action, actual outcome, evidence, and unresolved limits honestly.
- Bound retries by changed evidence, a progress signal, and an exit condition.
- Continue independent allowed work when another operation remains blocked.

### Return owned resources

- Track assignment-owned resources and retain evidence needed for checks, investigation, recovery, requested retention, or acceptance.
- Exclude dependency trees, build caches, and redundant logs from retained evidence.
- Before handback, inspect running background processes and descendants against the recorded assignment resources.
- Stop assignment-owned processes when no longer needed and verify termination.
- Remove unneeded owned containers, caches, and clean worktrees within granted cleanup.
- Confirm ownership before deletion and preserve shared resources and artifacts needed for delivery, recovery, or continued use.
- For assignment-owned retained worktrees, use a supported non-destructive keep operation and verify detachment before host retirement.
- Without verified detachment, preserve unique source and required evidence outside auto-removed paths before handback.
- An idle prompt alone does not prove preservation.
- Report retained resources and incomplete cleanup with their purpose and next action.

## Apply source procedures

Before source work or runtime verification, read [Development](../development/SKILL.md) unless its complete content is already loaded.

## Respect Git and delegation authority

Leave main-session orchestration, including starting native Workflow, to Main.
Return a needed dependent stage or join to the dispatcher as a proposed stage graph.
Read [the Workflow authoring reference](../workflow/references/authoring.md) only when the assignment asks for a drafted Workflow script that Main will run.
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
Confirm findings against source, behavior, and evidence, preferring executed reproductions for runtime behavior.
Report supported findings and unresolved uncertainty.
Omit findings and handling for failures that cannot realistically occur.
Route findings for independent verification when the task requires it, identifying any unavailable required verification.
Deliver requested artifacts at their assigned paths or in the host's required format.
Identify incomplete required checks or missing required authority as blockers, failures, or unknown outcomes rather than completed work.
