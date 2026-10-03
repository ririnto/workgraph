---
name: main-agent-contract
description: Use when orchestrating as the Workgraph Main Agent, not as a dispatched node.
user-invocable: true
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
Use one sentence per Markdown source line and punctuate complete table sentences.
Keep conditions with their actions, and preserve required syntax.
Do not join separate sentences with semicolons or other punctuation.

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
Before delegating Git writes, specify permitted operations, refs, ownership limits, and required checks.
Give each shared resource one writer.
Ask an exploration agent to identify the source of unexpected changes.
Account for changes within a running agent's assignment and continue.
Without native agent waiting, end idle turns awaiting only notifications, without claiming completion.
Validate source files, repository state, and check inputs before using replayed results.
Check partial effects before retrying interrupted writes.
Bound retries by changed evidence, a progress signal, and an exit condition.
Delete feature branches only within granted cleanup, after default-branch integration and ancestry proof.
Remove only clean task-created worktrees within granted cleanup.

## Choose Orchestration

Use a task graph when dependencies make coordination useful.
Define each bounded node's operation, inputs, outputs, owner, authority, and completion evidence.
Connect nodes only when a result or condition gates a successor.
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

## Plan Delivery Units

Split broad goals into cohesive, independently verifiable units with acceptance evidence and one accountable owner.
Keep coupled work together when splitting prevents independent verification or mergeability.
Avoid tiny phases and stacked PRs that require repeated rebases.
Publish, review, and integrate each ready unit.
Before committing or publishing, record the working branch and authorized target branch.
If they match, create a separate branch from the target before committing or pushing task changes.
Push only the working branch for PR delivery, and never push task changes directly to the target before PR review.
Use named branch references and current PR changes, not fixed commit hashes.

## Review Published Work

In Main, inspect changed files and required evidence before publishing to the authorized target.
Reuse an existing PR/MR for the unit.
Treat publication as the review handoff, not as integration.
Run one full independent review after publication using the PR/MR and its current changes.
Follow the consumer repository's review method.
Verify review candidates against requirements, source, or checks, then classify confirmed findings.
Fix blockers before integration when they violate acceptance, required behavior, correctness, safety, or required checks.
Only confirmed blockers require code changes before integration.
Publish blocker fixes on the same branch and request the same reviewer's assessment of affected changes only.

## Defer And Integrate

After required checks pass, defer only noncritical findings that do not affect required behavior, acceptance, correctness, or safety.
Before integration, register each deferred follow-up in the authorized long-term issue tracker.
Include evidence, scope, acceptance criteria, a named owner, and a next action.
Reuse or update an existing tracker item when possible.
Without authorized, available tracker access, do not integrate with untracked deferrals.
Implement deferred follow-ups only after updating the target branch.
Repeat target syncs or rebases only for conflicts or invalidated evidence.
Set a finite fix/re-review limit and stop sooner without progress or when a concrete blocker prevents work.
Integrate after required checks pass, confirmed blockers are resolved, and deferred follow-ups are recorded.
Finish delivery by verifying the authorized target branch update.
For read-only, research-only, or review-only goals, omit implementation, new branch publication, new PR/MR creation, and integration.
Review existing PRs/MRs without inferring publication authority from inspection requests.
Report unsupported findings as unverified.
