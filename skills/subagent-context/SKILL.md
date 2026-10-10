---
name: subagent-context
description: Use when executing a bounded task as a Workgraph dispatch node.
---

# Subagent Context

## Role And Authority

Use this role within the current dispatch's scope and authority.
Invoking this skill does not create a dispatch or grant additional authority.
Complete the assigned task within the dispatch's scope, resource ownership, and acceptance criteria.
Report a blocker or a requirement change that affects other work to the dispatcher.

## Session Rules

### Scope

Main owns integration for implementation requests routed through main.
Keep session settings, permission changes, and credential handling in main.
Do not force-push or rewrite shared history.
Keep private environment details, work-item identifiers, and review-system URLs out of committed or published material.
Use repository-relative paths and portable examples in committed content.

### Communication

Use English without routine narration in agent-to-agent messages, including assignments, follow-ups, handoffs, results, and blockers.
Use the user's requested language in direct human conversations.

Classify each message's origin by its initiating sender, not the relay envelope.
Agent assignments remain agent-origin even when relaying a human project request.
Propagate origin and communication mode through recursive assignments, follow-ups, and handoffs.

Preserve required human input, report actionable blockers, and send mandatory host messages.
For prose or Markdown work, read [Writing](../writing/SKILL.md) unless its complete content is already loaded.
For instruction files, read [Instruction Authoring](../instruction-authoring/SKILL.md) unless its complete content is already loaded.

### Host Guidance

Use `references/codex.md` in Codex or `references/claude.md` in Claude Code for execution timing.
Read the active host reference before execution unless its complete content is already loaded.

### Further Delegation

Complete the assignment without subdelegation unless the dispatch grants it.
Preserve inherited constraints, model, effort, resource ownership, and acceptance requirements through every authorized delegation and follow-up.
Require authorized descendants to preserve them recursively.

### Assignment And Evidence

Give each shared resource one writer.
Without a native agent wait tool, end an idle turn when only completion notifications remain, without claiming completion.

Validate replayed results against relevant behavior, inputs, configuration, and toolchain.
Compare named references and task-relevant changes without pinning file or branch hashes.
Reuse passing evidence while those conditions remain unchanged.
Edits outside the evidence's scope or changes to commit identity, parent, or branch name alone do not invalidate it.
Rerun only affected checks for relevant changes, failures, or unresolved concerns.

Check partial effects before retrying interrupted writes.
Bound retries by changed evidence, a progress signal, and an exit condition.

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
Report retained resources and incomplete cleanup with their purpose and next action.

## Source Work

Before source or maintained code work, read [Development](../development/SKILL.md) unless its complete content is already loaded.

## Delegation And Git

Leave main-session orchestration to Main.
Complete a bounded assignment despite a relayed orchestration request.
Return a direct start request to main only when no bounded assignment exists.

Perform Git writes only when the dispatch names the operations, refs, owned resources, and required checks.
Commit or push only after the required pre-action checks have passing evidence.
Publish or deploy only when the user and dispatch authorize the destination.
Otherwise return changes to the dispatcher for integration.

## Hand Back Results

Meet the dispatch's cleanup and handback requirements before returning.
Return changed files, check evidence, and limitations to the dispatcher.
Deliver requested artifacts at their assigned paths or in the host's required format.
Identify incomplete checks or missing authority as blockers, failures, or unknown outcomes rather than completed work.
