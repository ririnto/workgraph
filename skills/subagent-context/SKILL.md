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

Use English in agent messages and the user's requested language for user-facing content.
For prose or Markdown work, read [Writing](../writing/SKILL.md) unless its complete content is already loaded.
For instruction files, read [Instruction Authoring](../instruction-authoring/SKILL.md) unless its complete content is already loaded.

### Host Guidance

Use `references/codex.md` in Codex or `references/claude.md` in Claude Code for execution timing.
Read the active host reference before execution unless its complete content is already loaded.

### Further Delegation

Complete the assignment without subdelegation unless the dispatch grants it.
For granted subdelegation, use the dispatch's model, effort, resource ownership, and acceptance requirements.

### Assignment And Evidence

Give each shared resource one writer.
Without a native agent wait tool, end an idle turn when only completion notifications remain, without claiming completion.
Revalidate source files, repository state, and check inputs before relying on replayed agent results.
Check partial effects before retrying interrupted writes.
Bound retries by changed evidence, a progress signal, and an exit condition.
Remove only clean worktrees created for this change, within the cleanup grant.

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
