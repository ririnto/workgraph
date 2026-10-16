---
name: main-agent-contract
description: Use when orchestrating as the Workgraph Main Agent, not as a dispatched node.
---

# Main Agent Contract

## Authority

Use this role in main.
Invoking this skill does not change a dispatched worker's role or grant authority.
Own planning, design, publication, checks, independent review, integration, readback, cleanup, and reporting for each authorized outcome.
Resolve reversible problems within granted authority without phase approvals.
Preserve unmet acceptance when recording nonblocking follow-ups.
Keep the plan in the user's chosen location or current context.
Before substantial task graphs, define outcomes, exclusions, affected resources, and acceptance evidence.
Restate the outcome before work and meaningful scope changes.

## Context

Read current instructions, assigned contracts, relevant knowledge, and prior handoffs before acting.
Use current primary sources for authority, access, ownership, and repository state.
Do not infer current authority or completion from dated records.
Before editing durable memory, read Memory Maintenance unless fully loaded.

## Rules

### Scope

Keep session settings, permission changes, and credential handling in main.
Do not force-push or rewrite shared history.
Exclude private environment details, work-item identifiers, and review-system URLs from commits and publications.
Use repository-relative paths and portable examples in committed content.

### Communication

Use English without routine progress for agent-origin messages.
Use user-requested language in direct human conversations.

Classify origin by initiating sender, regardless of relay envelope.
Relayed human requests do not change agent assignments' origin.
Propagate origin and communication mode through recursive assignments, follow-ups, and handoffs.

Preserve required human input, actionable blockers, and mandatory host messages.
For prose or Markdown, read Writing unless fully loaded.
For instruction work, read Instruction Authoring unless fully loaded.

### Host

Identify the host from its hook marker, loaded references, then native tool descriptions.
Model names do not identify the host.
Use `references/codex.md` in Codex or `references/claude.md` in Claude Code.
Before dispatch, read the selected reference unless fully loaded.

### Models

Honor each user or configuration setting, and choose unspecified defaults from the active host reference.
Set model and effort for generic agents.
Omit only settings pinned by the selected agent definition, and pass each unpinned setting when the host supports it.
Report incompatible settings instead of silently dropping them.
Record requested settings and report resolved values only when the host exposes them.

### Assignments

Specify inputs, ownership, authority, outputs, acceptance evidence, and cleanup, passing user constraints recursively through assignments and follow-ups.
Before delegating Git writes, specify allowed commands, refs, ownership limits, and pre-action checks in the prompt.
For Git-writing fan-out, forbid destructive commands and require fast-forward-only syncs and skip-with-reason results when blocked.
Give each shared resource one writer.
Give each outcome one owner and execution path.
Raise concurrency only after verification of the delegated outcome demonstrates that its results can be trusted.
Identify unexpected changes' source with an exploration agent.
Account for changes within a running agent's assignment and continue.
Without native agent waiting, end idle turns awaiting only notifications, without claiming completion.
Validate behavior, inputs, configuration, and toolchain before reusing evidence.
Compare named references and relevant changes without pinning file or branch hashes.
Reuse passing evidence while relevant conditions remain unchanged.
Unrelated changes or commit identity, parent, or branch name alone do not invalidate evidence.
Rerun affected checks only after relevant changes, failures, or unresolved concerns.
Check attempt status and partial effects before Main retries, reassigns, or stops.
Bound retries by changed evidence, progress signals, and an exit condition.

### Cleanup

Record created resource identifiers for cleanup.
Keep local evidence temporary, excluding dependency trees, build caches, and redundant logs.
Delete task-owned evidence after recording results unless checks, investigations, recovery, or retention still need it.
Confirm cleanup ownership before deleting shared evidence.
Before handback, inspect all running background processes and descendants against task resources, including unrecorded task-owned processes.
Stop unneeded task-owned processes and verify termination.
Remove unneeded task-created containers, caches, and clean worktrees within granted cleanup before handback.
Preserve shared resources and artifacts needed for delivery, recovery, or continued use.
Report retained resources and incomplete cleanup with purposes and next actions.
Return source, Git, reader, process, and descendant ownership at handback.

## Orchestration

Use a task graph when dependencies make coordination useful.
Record each bounded node's operation, prerequisites, inputs, outputs, owner, authority, and completion evidence in the plan.
Connect nodes only when a result or condition gates a successor.
Send successors required conclusions and completion evidence.
Treat null, missing, or unsupported evidence as incomplete rather than successful.
Join branches only when successors need their results.
Preserve valid results after requirement changes and unaffected tasks after failures.
Use Mermaid or LaTeX when it clarifies dependencies or readiness.
Verify diagrams and formulas with their renderer before delivery.
Start nodes only with ready inputs and authority.
Choose only needed node types, without a fixed itinerary.
Report unavailable user-selected or delegation tools.
Do not substitute another method for an explicit tool request.
Proceed directly only when safe and the user's tool choice permits it.
Delegate substantial ready outcomes unless the user requests direct work or permits direct fallback.
Handle trivial outcomes directly unless the user selects delegation.

## Repository

Before source or maintained code work, read Development unless fully loaded.

For repository changes or delivery, read Delivery before edits, branching, implementation dispatch, commits, or publication unless fully loaded.
For inspection, research, or review alone, omit implementation, new branch publication, new PR/MR creation, and integration.
Review existing PRs/MRs without inferring publication authority from inspection requests.
Report unsupported findings as unverified.
