---
name: delivery
description: Use in the main session for repository changes or authorized branch publication and integration.
---

# Repository delivery

Use this skill in the main session.

## Confirm repository eligibility

Before repository writes, verify the target, access, and authorization required for the operation.
Respect repository protections and explicit restrictions on destinations or forks.
If required access or authority is unverified, stop affected writes and report the missing evidence.

## Plan delivery units

Split broad goals into cohesive, independently verifiable units with acceptance evidence and one accountable owner.
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
Assign each issue or coherent batch an isolated workspace, branch, and named source, Git, integration, evidence, and cleanup owners.
Use an isolation method supported by the host and assignment, and keep branches separate.
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
Record working and authorized base branches before branch creation, commits, or publication.
If they match, create a separate branch from the base before committing or pushing task changes.
Push only the working branch for PR delivery, and never push task changes directly to the base before PR review.
Use the named branch references and current PR changes for delivery.

## Make development progress visible

Follow the task's and repository's tracking and delivery requirements.
Create or reuse an issue when the task or repository requires one.
Do not restart completed work.
When tracking work, keep its stage, evidence, blockers, links, and next action current.
Report actual completed stages rather than guessed percentages.

### Inspect the complete candidate

Before implementation, determine the complete initial or incoming candidate against its named base.
Include committed changes against the base, staged changes, unstaged changes, and every untracked non-ignored file with its full content.
For incoming PR/MR work, include the complete incoming diff and all relevant local changes.
Do not use ordinary `git diff` alone to verify emptiness because it omits staged-only and untracked files.
Limit any empty-candidate finding to that snapshot without clearing later changes.
If the complete candidate cannot be determined, do not treat it as empty.
Before exposing candidate content outside its trusted boundary, assess and address private information and secret risks.

## Check before publication

Inspect changed files and required evidence before publishing to the authorized base.

Before each branch push, delegate a read-only scan of the complete diff for user environment details and secrets.
Commit author and committer names and email addresses are contributor information, not environment details or secrets.
Do not report, flag, rewrite, or block on contributor names or email addresses in commit metadata.
Reuse a scan only while its diff remains unchanged.
Treat this scan as exploration, without a code review.
Require file locations and the type of exposure, or a clear no-findings result.
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
Run selected independent reviewers in parallel when there is more than one.
Follow required repository review timing and any requested independent review.
Keep completed valid reviews without mislabeling sequential work as parallel or restarting it solely to change timing.

### Review the complete candidate

Reuse an existing PR/MR for the unit.
Follow the consumer repository's review method.
Give the reviewer the complete current candidate, stated intent, acceptance criteria, applicable project review instructions, and validation evidence.
Require inspection of affected real consumers beyond the changed lines, including relevant correctness and security failure modes.
Require concrete failure scenarios and source locations, separating introduced defects from pre-existing issues.
Request an explicit no-findings result and coverage limits when no actionable defects remain.
Verify review candidates against requirements, source, or checks, then classify confirmed findings.
Give an independent verifier each candidate and the complete predecessor result before reporting findings.
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
Before integration, register those deferrals in the authorized long-term issue tracker.
Include evidence, scope, acceptance criteria, a named owner, and a next action.
Reuse or update an existing tracker item when possible.
Without required tracker access, retain that unit's deferral blocker without blocking independent units.
Implement deferred follow-ups only after updating the base branch.
Repeat base syncs or rebases only for conflicts or invalidated evidence.
Follow Main Agent Contract for retry bounds and progress requirements.

### Integrate and read back the base

Integrate after current-unit checks pass, confirmed blockers are resolved, and required current-unit deferrals have records.
Require only relevant resource returns, not unrelated global ownership returns.
Finish delivery by reading back the named authorized base branch after normal merge.
After a merge lands, pull the base branch fast-forward-only before continuing dependent work.
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
