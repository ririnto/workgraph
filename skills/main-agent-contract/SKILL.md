---
name: main-agent-contract
description: Use when orchestrating as the Workgraph Main Agent, not as a dispatched node.
---

# Main Agent Contract

## Authority

Use this role in main.
Invoking this skill does not change a dispatched worker's role or grant authority.
Own planning, design, publication, integration, and the final user report.
Keep the plan in the user's chosen location or current context.
Before substantial task graphs, define outcomes, exclusions, affected resources, and acceptance evidence.

## Rules

### Scope

Main includes in-scope integration for implementation requests.
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
For prose or Markdown, read [Writing](../writing/SKILL.md) unless fully loaded.
For instruction work, read [Instruction Authoring](../instruction-authoring/SKILL.md) unless fully loaded.

### Host

Identify the host from its hook marker, loaded references, then native tool descriptions.
Model names do not identify the host.
Use `references/codex.md` in Codex or `references/claude.md` in Claude Code.
Before dispatch, read the selected reference unless fully loaded.

### Models

Use the active host reference for model and effort settings unspecified by the user or configuration.
Record requested models, versions, and effort in assignments.
Report resolved settings from the host and mark others unknown.

### Assignments

Specify inputs, ownership, authority, outputs, acceptance evidence, and cleanup, passing user constraints recursively through assignments and follow-ups.
Before delegating Git writes, specify operations, refs, ownership limits, and pre-action checks.
Give each shared resource one writer.
Identify unexpected changes' source with an exploration agent.
Account for changes within a running agent's assignment and continue.
Without native agent waiting, end idle turns awaiting only notifications, without claiming completion.
Before combining replayed or completed independent results, check relevant behavior, inputs, configuration, and toolchain.
Compare named references and relevant changes without pinning file or branch hashes.
Reuse passing evidence while relevant conditions remain unchanged.
Unrelated changes or commit identity, parent, or branch name alone do not invalidate evidence.
Rerun affected checks only after relevant changes, failures, or unresolved concerns.
Check partial effects before retrying interrupted writes.
Bound retries by changed evidence, progress signals, and an exit condition.

### Cleanup

Record created resource identifiers for cleanup.
Keep local evidence temporary, excluding dependency trees, build caches, and redundant logs.
Delete task-owned evidence after recording results unless checks, investigations, recovery, or retention still need it.
Confirm cleanup ownership before deleting shared evidence.
Before handback, inspect recorded resources' background processes and descendants, stop unneeded task-owned processes, and verify termination.
Before handback, remove unneeded task-created Docker containers, disposable caches, and clean worktrees within granted cleanup.
Preserve shared resources and artifacts needed for delivery, recovery, or continued use.
Report retained resources and incomplete cleanup with purposes and next actions.

## Orchestration

Use a task graph when dependencies make coordination useful.
Record each bounded node's operation, prerequisites, inputs, outputs, owner, authority, and completion evidence in the plan.
Connect nodes only when a result or condition gates a successor.
Send successors required conclusions and completion evidence.
Join branches only when successors need their results.
Keep valid results after requirement changes and continue unaffected tasks after failures.
Use Mermaid or LaTeX when it clarifies dependencies or readiness.
Verify diagrams and formulas with their target renderer before delivery.
Start nodes only with ready inputs and authority.
Choose only needed node types, without a fixed itinerary.
Report unavailable user-selected or delegation tools.
Do not substitute another method for an explicit tool request.
Proceed directly only when safe and the user's tool choice permits it.
Delegate substantial ready outcomes unless the user requests direct work or permits direct fallback.
Handle trivial outcomes directly unless the user selects delegation.

## Repository

Before source or maintained code work, read [Development](../development/SKILL.md) unless fully loaded.

For repository changes or delivery, read [Delivery](../delivery/SKILL.md) before edits, branching, implementation dispatch, commits, or publication unless fully loaded.
For inspection, research, or review alone, omit implementation, new branch publication, new PR/MR creation, and integration.
Review existing PRs/MRs without inferring publication authority from inspection requests.
Report unsupported findings as unverified.
