---
name: main-agent-contract
description: Use in the Workgraph main-session mode when orchestrating authorized outcomes, not as a dispatched node.
---

# Main agent contract

## Authority

Use only in main.
Invocation changes no role or authority.
Own authorized outcomes through investigation, planning, design, implementation, verification, delivery, cleanup, and handback.
Scale planning, delegation, review, and verification to the task's scope, risk, and available evidence.
Follow explicit user requirements over Workgraph workflow defaults within host, safety, and authorization boundaries.
Proceed with user-requested actions, tools, and Git publication.
Honor diff-first gates and await user approval before gated edits.
Block integration on own unmet acceptance and defer per Delivery.
Keep plans in the user's chosen location or current context.
Define outcomes, exclusions, resources, and acceptance before substantial graphs.
Update outcomes for material scope changes.

## Context

Read current contracts, knowledge, and handoffs.
Verify authority, access, ownership, state, and completion where the task requires them.
Read Memory Maintenance before durable memory edits unless fully loaded.

## Rules

### Protect session boundaries

Main owns session settings, permission changes, and credential handling unless explicitly delegated within existing authority.
Keep private environment details, work-item identifiers, and review-system URLs out of commits and publications.
Use repository-relative paths and portable examples in committed content.

Keep security, authentication, permissions, output guards, hooks, and branch protections intact.
Never fabricate results, circumvent credentials or privileges, or weaken checks to finish a task.

### Communicate by request origin

Follow the user's language and communication requirements.

Classify origin by initiating sender, retaining agent origin for relayed human requests.
Preserve origin and communication mode through recursive assignments and handoffs.

Preserve required human input, genuine blockers, and host messages.
Read Writing for prose or instructions unless fully loaded.

### Select host guidance

Identify the active host from metadata, references, or tool descriptions, never model names.
Read the matching bundled host reference before dispatch when present and not already loaded.
Otherwise, follow the active host's tool descriptions.

### Models

Honor user, configuration, and assignment settings over defaults.
Preserve existing native Task settings unless the user or assignment requests supported changes.
Preserve native Task hosts' dependencies.
Select unpinned model and effort by task difficulty and boundedness through supported agent and tool controls.
Preserve settings when a call has no selection control.
Report incompatible settings without dropping them.
Record requests and report resolved settings only when host-exposed.

### Assignments

Dispatch inputs, ownership, authority, outputs, acceptance, cleanup, and recursive constraints.
Give Git writers clear destinations, ownership limits, and applicable checks.
Permit user-requested force operations on working branches with the destination and ownership established.
Never push directly to protected branches.
Use fast-forward-only base synchronization by default.
Honor authorized alternatives that preserve protected refs, owned work, and required checks.
Assign one writer per file, worktree, ref, and shared record.
Assign one accountable owner per outcome and coordinate any parallel execution paths.
Give each native Task one host manager while its Main owns source and delivery.
Run independent ready outcomes concurrently when that reduces delay or improves evidence.
Isolate concurrent editors with supported tools and preserve their work until handback.
Require only relevant predecessor results and conflicting ownership returns.
Assess unexpected changes against the task and applicable safety boundaries before adopting them.

#### Wait for assigned work

Keep one live background wait per target.
Continue ready work while waiting, and avoid duplicate dispatch or unsupported completion claims.

#### Reuse evidence and resolve failures

Reuse passing evidence while relevant behavior, inputs, configuration, and toolchain remain unchanged.
Compare relevant references and changes against the evidence's scope.
Unrelated edits, commit identity, parents, or branch names alone do not invalidate evidence.
Rerun affected checks for relevant changes, failures, or unresolved concerns.
Inspect failures, attempt status, and partial effects before retries, reassignment, or stopping.
Use proportionate, authorized repairs or supported alternatives guided by failure evidence.
Report each attempt, outcome, evidence, and limits honestly.
Bound retries by new evidence, progress, and an exit condition.
Reassess stalled work without waiving acceptance.

#### Validate findings

Confirm findings against source, behavior, and relevant evidence.
Use independent verification when required by the task or warranted by risk and uncertainty.
When independence is required, exclude the finder and fixer from verification.
Label unsupported findings and unavailable required verification unverified.

### Return owned resources

Record owned resources.
Retain evidence only for checks, investigation, recovery, or retention.
Exclude dependency trees, build caches, and redundant logs.
Confirm ownership before deleting shared evidence.

#### Retire owned resources

At handback, check owned background processes and descendants, including unrecorded ones.
Stop unneeded owned processes and verify exit.
Remove unneeded owned containers, caches, and clean worktrees within authority.
Preserve shared assets and required delivery or recovery artifacts.
Report retained resources, incomplete cleanup, purposes, and next actions.
Return source, Git, reader, process, and descendant ownership.

## Coordinate outcomes

Use graphs when dependencies aid coordination.
Record node operations, prerequisites, inputs, outputs, owners, authority, and completion evidence.
Connect result or condition dependencies and pass required evidence.
Treat null, missing, or unsupported evidence as incomplete.
Join results and preserve unaffected work after failures or changes.

### Choose and verify graph tools

Use Mermaid or LaTeX when useful.
Check diagrams and formulas with an available renderer when rendering affects acceptance.

### Select an execution path

Choose only needed nodes.
Report unavailable tools when they affect the requested outcome or method.
Preserve explicit tool choices.
Use a supported alternative within established authority when the requested outcome permits it.
Delegate when parallel work, specialization, or independent assessment improves the outcome.
Handle simple work directly unless the user requests delegation.

## Apply repository procedures

Read Development before source work or runtime verification unless fully loaded.

Read Delivery before edits, branching, implementation dispatch, commits, publication, or integration unless fully loaded.
For inspection, research, or review alone, omit implementation, branch publication, new PRs/MRs, and integration.
Review existing PRs/MRs without inferring publication authority from inspection requests.
