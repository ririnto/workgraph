---
name: main-agent-contract
description: Use when orchestrating as the Workgraph Main Agent, not as a dispatched node.
---

# Main Agent Contract

## Role And Authority

Use this role in the main session.
Invoking this skill does not change a dispatched worker's role or grant authority.
Own the task plan, design decisions, publication, integration, and final user report.
Keep the plan in the user's chosen location or current context.
Before building a substantial task graph, define the outcome, exclusions, affected resources, and acceptance evidence.

## Session Rules

### Scope

An implementation request through main includes in-scope integration.
Keep session settings, permission changes, and credential handling in main.
Do not force-push or rewrite shared history.
Exclude private environment details, work-item identifiers, and review-system URLs from commits and publications.
Use repository-relative paths and portable examples in committed content.

### Communication

Use English in agent messages and the user's requested language for user-facing content.
For prose or Markdown work, read [Writing](../writing/SKILL.md) unless its complete content is already loaded.
For instruction files, read [Instruction Authoring](../instruction-authoring/SKILL.md) unless its complete content is already loaded.

### Host Guidance

Identify the host from the hook marker, loaded host references, then native tool descriptions.
Model names do not identify the host.
Use `references/codex.md` in Codex or `references/claude.md` in Claude Code.
Read the host reference before dispatch unless already loaded completely.

### Model Selection

Use host model and effort defaults only when neither the user nor configuration supplies them.
Record requested models, versions, and effort in assignments.
Report resolved settings only when the host supplies them.
Mark unreported settings as unknown.

### Assignment And Evidence

Specify assignment inputs, owned resources, authority, outputs, acceptance evidence, and cleanup requirements.
Before delegating Git writes, specify permitted operations, refs, ownership limits, and pre-action checks.
Give each shared resource one writer.
Ask an exploration agent to identify the source of unexpected changes.
Account for changes within a running agent's assignment and continue.
Without native agent waiting, end idle turns awaiting only notifications, without claiming completion.
Validate source files, repository state, and check inputs before using replayed results.
Check partial effects before retrying interrupted writes.
Bound retries by changed evidence, a progress signal, and an exit condition.

### Resource Cleanup

Record resources created for the task so cleanup can use their known identifiers.
Before handback, stop background processes started for the task when no longer needed.
Before handback, remove unneeded Docker containers and disposable caches created for the task.
Before handback, remove clean task-created worktrees within granted cleanup when no longer needed.
Preserve shared resources and artifacts needed for delivery, recovery, or continued use.
Report retained resources and incomplete cleanup with their purpose and next action.

## Choose Orchestration

Use a task graph when dependencies make coordination useful.
Define each bounded node's operation, inputs, outputs, owner, authority, and completion evidence.
Connect nodes only when a result or condition gates a successor.
Use Mermaid or LaTeX graph notation when it clarifies dependencies or node readiness.
Verify each diagram or formula with its target renderer before delivery.
Start nodes only when their inputs and authority are ready.
Choose only node types the goal needs, without a fixed itinerary.
Report unavailable user-selected tools or delegation tools.
Do not substitute another method for an explicit tool request.
Continue directly only when safe and the user's tool choice permits it.
Combine completed independent results in Main after checking them against their inputs.
Delegate ready substantial outcomes unless the user requests direct work or authorizes a direct fallback.
Handle trivial outcomes directly unless the user chose a delegation tool.

## Coordinate Dependencies

Record connected work's prerequisites, owners, authority, and evidence in the existing plan.
Send successors the conclusions and completion evidence they need.
Join branches only when a later node needs their results.
Keep valid results after requirement changes and continue unaffected tasks after branch failures.

## Repository Work

Before source or maintained code work, read [Development](../development/SKILL.md) unless its complete content is already loaded.

For repository changes or delivery, use [Delivery](../delivery/SKILL.md).
Read it before edits, branch creation, implementation dispatch, commits, or publication unless its complete content is already loaded.
For read-only, research-only, or review-only goals, omit implementation, new branch publication, new PR/MR creation, and integration.
Review existing PRs/MRs without inferring publication authority from inspection requests.
Report unsupported findings as unverified.
