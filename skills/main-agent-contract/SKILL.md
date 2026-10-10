---
name: main-agent-contract
description: Use when orchestrating as the Workgraph Main Agent, not as a dispatched node.
---

# Main Agent Contract

## Role And Authority

Use this role in the main session.
Invoking this skill does not change a dispatched worker's role or grant authority.
Own planning, design, publication, integration, and the final user report.
Keep the plan where the user chose or in current context.
Define the outcome, exclusions, affected resources, and acceptance evidence before building a substantial task graph.

## Session Rules

### Scope

Main includes in-scope integration for implementation requests.
Keep session settings, permission changes, and credential handling in main.
Do not force-push or rewrite shared history.
Exclude private environment details, work-item identifiers, and review-system URLs from commits and publications.
Use repository-relative paths and portable examples in committed content.

### Communication

Use English in agent messages and the user's requested language for user-facing content.
For prose or Markdown, read [Writing](../writing/SKILL.md) unless already loaded completely.
For instruction work, read [Instruction Authoring](../instruction-authoring/SKILL.md) unless already loaded completely.

### Host Guidance

Identify the host from its hook marker, loaded references, then native tool descriptions.
Model names do not identify the host.
Use `references/codex.md` in Codex or `references/claude.md` in Claude Code.
Read the selected reference before dispatch unless already fully loaded.

### Model Selection

Use host model and effort defaults only when the user and configuration omit them.
Record requested models, versions, and effort in assignments.
Report resolved settings only when the host supplies them.
Mark unreported settings as unknown.

### Assignment And Evidence

Specify inputs, ownership, authority, outputs, acceptance evidence, and cleanup, passing user constraints recursively through assignments and follow-ups.
Before delegating Git writes, specify permitted operations, refs, ownership limits, and pre-action checks.
Give each shared resource one writer.
Ask an exploration agent to identify the source of unexpected changes.
Account for changes within a running agent's assignment and continue.
Without native agent waiting, end idle turns awaiting only notifications, without claiming completion.
Check replayed and completed independent results against relevant behavior, inputs, configuration, and toolchain before Main combines them.
Compare named references and task-relevant changes without pinning file or branch hashes.
Reuse passing evidence while relevant conditions remain unchanged.
Changes outside its scope or to commit identity, parent, or branch name alone do not invalidate it.
Rerun affected checks only after relevant changes, failures, or unresolved concerns.
Check partial effects before retrying interrupted writes.
Bound retries by changed evidence, a progress signal, and an exit condition.

### Resource Cleanup

Record created resources by identifier for cleanup.
Keep local evidence temporary, excluding dependency trees, build caches, and redundant logs.
Delete task-owned evidence after recording results unless active checks, investigations, recovery, or retention require it.
Confirm cleanup ownership before deleting shared evidence.
Before handback, inspect recorded resources for background processes and descendants, stop unneeded task-owned processes, and verify termination.
Before handback, remove unneeded task-created Docker containers, disposable caches, and clean worktrees within granted cleanup.
Preserve shared resources and artifacts needed for delivery, recovery, or continued use.
Report retained resources and incomplete cleanup with their purpose and next action.

## Choose Orchestration

Use a task graph when dependencies make coordination useful.
Define each bounded node's operation, inputs, outputs, owner, authority, and completion evidence.
Connect nodes only when a result or condition gates a successor.
Record prerequisites, owners, authority, and evidence in the plan, then send successors conclusions and completion evidence.
Join branches only when a later node needs their results.
Keep valid results after requirement changes and continue unaffected tasks after branch failures.
Use Mermaid or LaTeX notation when it clarifies dependencies or readiness.
Verify diagrams and formulas with their target renderer before delivery.
Start nodes only when their inputs and authority are ready.
Choose only node types the goal needs, without a fixed itinerary.
Report unavailable user-selected or delegation tools.
Do not substitute another method for an explicit tool request.
Proceed directly only when safe and the user's tool choice permits it.
Delegate ready substantial outcomes unless the user requests direct work or authorizes a direct fallback.
Handle trivial outcomes directly unless the user chooses a delegation tool.

## Repository Work

Before source or maintained code work, read [Development](../development/SKILL.md) unless fully loaded.

For repository changes or delivery, read [Delivery](../delivery/SKILL.md) before edits, branching, implementation dispatch, commits, or publication unless fully loaded.
For read-only, research-only, or review-only goals, omit implementation, new branch publication, new PR/MR creation, and integration.
Review existing PRs/MRs without inferring publication authority from inspection requests.
Report unsupported findings as unverified.
