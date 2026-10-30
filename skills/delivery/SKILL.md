---
name: delivery
description: Use in the main session for repository changes or authorized branch publication and integration.
---

# Repository delivery

Use this skill in the main session.

## Confirm repository access

Before repository writes, verify the target, access, and authorization required for the operation.
Select repositories from the user's requested scope without adding age, recent-activity, or archive-status eligibility filters.
Respect repository protections and explicit restrictions on destinations or forks.
If required access or authority is unverified, stop affected writes and report the missing evidence.

## Plan delivery units

Organize broad goals into cohesive, independently verifiable units when that improves delivery.
Keep coupled work together when splitting prevents independent verification or mergeability.
Avoid tiny phases and stacked PRs that require repeated rebases.
Publish, review, and integrate each ready unit within granted authority.
Setup waits until an authorized operation needs it.
Complete authorized Git operations and required checks without repeated permission questions.
Preserve explicit user gates, new-scope boundaries, and authorization limits for irreversible actions.
Git delivery does not authorize deployment, credential handling, live assets, forks, or upstream destinations.

### Deliver an assigned fix queue

Use the assigned queue bounds, concurrency, acceptance, ownership, and publication limits.
Check existing issues and PRs before assigning fixes, and prioritize correctness and safety within scope.
Map children to an umbrella when it defines a coherent actionable unit.
Use isolated workspaces and branches when concurrent assignments could conflict.
Name responsibility for source changes, publication, integration, evidence, and cleanup without requiring a different person for each role.
Use an isolation method supported by the host and assignment.
The issue owner runs checks, publishes its branch, opens its PR, and returns the result and evidence.
The integration owner serializes merges and confirms acceptance before closure.
Preserve each issue's original acceptance and exclusions, including any umbrella's separate acceptance.
Skip ownership-blocked items and continue independent ready work within the assigned concurrency.
Use nonclosing issue references until acceptance is confirmed.
Serialize merges and let the branch owner resolve collisions unless ownership transfers.
Refresh affected checks, acceptance evidence, and review coverage after collisions, while retaining unaffected valid evidence.
Confirm each issue's original acceptance on the authorized base before closing it, then read back the tracker state.
Inspect relevant base source or run the required behavioral check because a merge and ref readback alone do not establish acceptance.
Confirm an umbrella's own acceptance separately from its children.
Keep issues open when acceptance is unmet or unverified, and report remaining criteria and their next owners.
Report merged items, acceptance evidence, closure states, blockers, owners, and remaining work.

### Select the base and working branches

Use the user's specified base branch, otherwise retain the recorded base or use the current branch.
Without a base, confirm the active development branch.
Prefer a separate working branch and PR for repository changes.
Follow an explicitly requested alternative delivery method within repository protections and granted authority.
For PR delivery, record working and authorized base branches before branch creation, commits, or publication.
If those branches match, create a separate working branch before committing or pushing task changes.
Push only the working branch for PR delivery.
Use the named branch references and current PR changes for delivery.

## Make development progress visible

Follow the task's and repository's tracking and delivery requirements.
Create or reuse an issue when the task or repository requires one.
Do not restart completed work.
When tracking work, keep its stage, evidence, blockers, links, and next action current.
Report actual completed stages rather than guessed percentages.

### Inspect the complete candidate

Before implementation, identify the initial or incoming candidate against its named base.
Inspect committed, staged, unstaged, and untracked changes relevant to the task or proposed publication.
For incoming PR/MR work, include the complete incoming diff and all relevant local changes.
Do not use ordinary `git diff` alone to verify emptiness because it omits staged-only and untracked files.
Limit any empty-candidate finding to that snapshot without clearing later changes.
If the complete candidate cannot be determined, do not treat it as empty.
Before exposing candidate content outside its trusted boundary, assess and address private information and secret risks.

## Check before publication

Inspect changed files and required evidence before publishing to the authorized base.

Before publication, inspect the complete content being published for private environment details and secrets.
Use a separate read-only scanner when explicitly required or when unfamiliar content creates meaningful exposure risk.
Commit author and committer names and email addresses are contributor information, not environment details or secrets.
Do not report, flag, rewrite, or block on contributor names or email addresses in commit metadata.
Reuse a scan only while its diff remains unchanged.
Keep a delegated exposure scan focused on exposure, separate from correctness review.
Request file locations and the type of exposure, or a clear no-findings result.
Inspect flagged content and remove exposed details before pushing the branch.

## Retain validation evidence

Identify the target, trigger, input, and observable expected outcome before checking acceptance.
Use existing commands and supported entry points, and collect runtime evidence when static checks cannot establish behavior.
Record the command, setup, exit status, and raw result separately from interpretation.
Retain failures and distinguish unverified behavior from passing evidence.
Record concise validation summaries in authorized PR/MR descriptions or comments.
Include commands, outcomes, coverage, and material limitations without uploading raw logs by default.
Create local evidence only when a current check, failure investigation, or recovery needs files.

## Review and publish

Use project roles or the user's statement to determine whether the user maintains the project.
Review each complete delivery unit at the depth required by the task and its risks.
Select reviewer staffing and effort from the task's risks, available controls, and explicit requirements.
Prefer parallel independent reviews when multiple reviewers are ready and their work does not conflict.
Follow required repository review timing and any requested independent review.
Keep completed valid reviews without mislabeling sequential work as parallel or restarting it solely to change timing.
Distinguish unavailable optional coverage from unmet required review.

### Review the complete candidate

Reuse an existing PR/MR for the unit.
Follow the consumer repository's review method.
Give the reviewer the complete current candidate, stated intent, acceptance criteria, applicable project review instructions, and validation evidence.
Ask reviewers to inspect affected real consumers, including relevant correctness and security failure modes.
Request concrete failure scenarios and source locations, separating introduced defects from pre-existing issues.
Request an explicit no-findings result and coverage limits when no actionable defects remain.
Verify review candidates against requirements, source, or checks, then classify confirmed findings.
Seek independent verification for uncertain or high-impact findings when available or explicitly required.
Give that verifier the candidate and relevant predecessor evidence.
Record each finding as fixed, rejected with evidence, or deferred under the rules below.
Do not change code solely for unsupported style requests, cleanup suggestions, or repeated resolved findings.
Keep required human approvals distinct from agent review.
Record failure consequences, uncovered risks, and the recovery approach with delivery evidence.

### Resolve review blockers

Fix current-unit blockers before integration when they violate acceptance, required behavior, correctness, safety, or required checks.
Only confirmed blockers require code changes before integration.
Keep blocker fixes on the same working branch and update its existing PR/MR, if any.
Reassess affected changes and interactions against the earlier complete review, carrying forward findings and their dispositions.
Refresh the complete review when changed scope or invalidated evidence makes the earlier coverage insufficient.
When review cycles repeat without progress, reconsider the cause and approach instead of restarting the same review.
Apply Main's no-progress reassessment separately from productive fixes and native runtime retries.
Keep unresolved blockers explicit, and never treat a review limit as permission to waive acceptance or required checks.

## Defer and integrate

Classify findings against the current unit's acceptance, changed behavior, dependencies, and required gates.
Block integration for own unmet acceptance, introduced or worsened defects, actual dependencies, or required-gate failures.
An unrelated pre-existing issue, umbrella issue, older failed unit, or severity label alone does not block independently verified delivery.
Merge independently verified A while unrelated pre-existing B remains open.
Require no new deferred tracker record for existing unrelated B.

### Record permitted deferrals

For newly accepted current-unit follow-ups, defer only noncritical findings outside required behavior, acceptance, correctness, and safety.
Before integration, satisfy any required tracking for accepted deferrals.
Otherwise, record nonblocking follow-ups in the delivery handback or existing work item.
Include evidence, scope, acceptance criteria, and the next owner and action when known.
Reuse or update an existing tracker item when possible.
Without required tracker access, retain that unit's deferral blocker without blocking independent units.
Implement deferred follow-ups only after updating the base branch.
Repeat base syncs or rebases only for conflicts or invalidated evidence.
Follow Main Agent Contract for retry bounds and progress requirements.

### Integrate and read back the base

Integrate after current-unit checks pass, confirmed blockers are resolved, and required current-unit deferrals have records.
Require only relevant resource returns, not unrelated global ownership returns.
Finish delivery by reading back the named authorized base branch after normal merge.
Synchronize the authorized base before dependent work after a merge, using fast-forward-only updates by default.
Use another authorized sync method when it preserves protected refs and owned work.
For an authorized plugin update, read `references/plugin-updates.md` after the plugin's merge and base update.
Complete already-authorized task-owned cleanup without renewed stage approval.

### Retire owned resources

Before native retirement with retained work, use a supported non-destructive keep operation and verify worktree detachment.
An idle prompt alone does not prove preservation because native exit can remove attached worktrees.
If detachment is unestablished, preserve unique source and required evidence outside auto-removed worktrees before retirement.

Before a discard option, verify named-base source preservation, no unique work, and no active consumers.
A local ahead-commit count alone does not prove source would be lost.
Keep ungranted destructive operations and protected-resource refusals outside that authority.
Delete feature branches except the base, only within granted cleanup after base integration and ancestry proof.
