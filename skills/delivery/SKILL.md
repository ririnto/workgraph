---
name: delivery
description: Use in the main session for repository changes or authorized branch publication and integration.
---

# Repository Delivery

Use this skill in the main session.

## Confirm Repository Eligibility

Before source changes or publication, verify authenticated metadata for an unarchived nonfork repository.
Require evidence of meaningful development within the preceding three calendar months.
Inspect actual source changes rather than relying on `pushedAt`, orchestration records, or template-only activity.
If eligibility is unverified or unmet, stop repository writes and report the missing evidence.

## Plan Delivery Units

Split broad goals into cohesive, independently verifiable units with acceptance evidence and one accountable owner.
Keep coupled work together when splitting prevents independent verification or mergeability.
Avoid tiny phases and stacked PRs that require repeated rebases.
Publish, review, and integrate each ready unit within granted authority.
A clear approved Git task includes implementation, checks, Issue/MR/PR creation, comments, normal merge, readback, and owned cleanup.
Complete those operations without renewed stage approval or repeated permission questions.
Preserve explicit user gates, new-scope boundaries, and authorization limits for irreversible actions.
Git delivery does not authorize deployment, credential handling, live assets, forks, or upstream destinations.
Keep authentication, hooks, output guards, host permissions, and server protections unchanged.
Never change permission settings or weaken guards to finish delivery.

Use the user's specified base branch, otherwise retain the recorded base or use the current branch.
Without a base, confirm the active development branch.
Record working and authorized base branches before branch creation, commits, or publication.
If they match, create a separate branch from the base before committing or pushing task changes.
Push only the working branch for PR delivery, and never push task changes directly to the base before PR review.
Use named branch references and current PR changes, not fixed commit hashes.

## Make Development Progress Visible

Follow this sequence: Issue creation -> branch creation -> brief diff security scan -> implementation -> parallel reviews -> normal merge.
Create or reuse a relevant Issue and record its link before branch creation or implementation.
For in-flight work without an Issue, establish one with its truthful stage before the next source action.
Do not restart completed work.
Keep its current stage, completed evidence, material blockers, branch and PR/MR links, and next action current as work changes.
Report actual completed stages rather than guessed percentages.

Before implementation, delegate a brief security scan of the initial branch or incoming PR/MR diff for user environment details and secrets.
Report an empty initial diff honestly rather than treating it as review of later changes.
Preserve completed valid work without fabricating an earlier scan or review.

## Check Before Publication

Inspect changed files and required evidence before publishing to the authorized base.

Before each branch push, delegate a brief diff scan for user environment details and secrets only to an exploration agent.
Commit author and committer names and email addresses are contributor information, not environment details or secrets.
Do not report, flag, rewrite, or block on contributor names or email addresses in commit metadata.
Reuse a scan only while its diff remains unchanged.
Treat this scan as exploration, without a code review.
Require file locations and the type of exposure, or a clear no-findings result.
Inspect flagged content and remove exposed details before pushing the branch.

## Evidence Retention

Record concise validation summaries in authorized PR/MR descriptions or comments.
Include commands, outcomes, coverage, and material limitations without uploading raw logs by default.
Create local evidence only when a current check, failure investigation, or recovery needs files.

## Review And Publish

Use project roles or the user's statement to determine whether the user maintains the project.
Cover each complete delivery unit with independent review, without multiplying review by domain and phase.
Select reviewer staffing and effort from the active Main host reference and explicit user requirements.
Run selected independent reviewers in parallel when there is more than one.
For maintainers, create the PR/MR before reviewing its complete current changes.
For contributors, review the complete working branch before creating the PR/MR.
Keep completed valid reviews without mislabeling sequential work as parallel or restarting it solely to change timing.

Reuse an existing PR/MR for the unit.
Follow the consumer repository's review method.
Give the reviewer the complete current candidate, stated intent, acceptance criteria, applicable project review instructions, and validation evidence.
Require inspection of affected real consumers beyond the changed lines, including relevant correctness and security failure modes.
Require concrete failure scenarios and source locations, separating introduced defects from pre-existing issues.
Request an explicit no-findings result and coverage limits when no actionable defects remain.
Verify review candidates against requirements, source, or checks, then classify confirmed findings.
Give an independent verifier each candidate and the complete predecessor result before reporting findings.
Keep verification independent of the finder and fixer, following Main's finding-verification requirement.
Record each finding as fixed, rejected with evidence, or deferred under the rules below.
Do not change code solely for unsupported style requests, cleanup suggestions, or repeated resolved findings.
Keep required human approvals distinct from agent review.
Record failure consequences, uncovered risks, and the recovery approach with delivery evidence.

Fix current-unit blockers before integration when they violate acceptance, required behavior, correctness, safety, or required checks.
Only confirmed blockers require code changes before integration.
Keep blocker fixes on the same working branch and update its existing PR/MR, if any.
Reassess affected changes and interactions against the earlier complete review, carrying forward findings and their dispositions.
Refresh the complete review when changed scope or invalidated evidence makes the earlier coverage insufficient.
When review cycles repeat without progress, reconsider the cause and approach instead of restarting the same review.
Apply Main's no-progress reassessment separately from productive fixes and native runtime retries.
Keep unresolved blockers explicit, and never treat a review limit as permission to waive acceptance or required checks.

## Defer And Integrate

Classify findings against the current unit's acceptance, changed behavior, dependencies, and required gates.
Block integration for own unmet acceptance, introduced or worsened defects, actual dependencies, or required-gate failures.
An unrelated pre-existing issue, umbrella issue, older failed unit, or severity label alone does not block independently verified delivery.
Merge independently verified A while unrelated pre-existing B remains open.
Require no new deferred tracker record for existing unrelated B.

For newly accepted current-unit follow-ups, defer only noncritical findings outside required behavior, acceptance, correctness, and safety.
Before integration, register those deferrals in the authorized long-term issue tracker.
Include evidence, scope, acceptance criteria, a named owner, and a next action.
Reuse or update an existing tracker item when possible.
Without required tracker access, retain that unit's deferral blocker without blocking independent units.
Implement deferred follow-ups only after updating the base branch.
Repeat base syncs or rebases only for conflicts or invalidated evidence.
Follow Main Agent Contract for retry bounds and progress requirements.

Integrate after current-unit checks pass, confirmed blockers are resolved, and required current-unit deferrals have records.
Require only relevant resource returns, not unrelated global ownership returns.
Finish delivery by reading back the named authorized base branch after normal merge.
Complete already-authorized task-owned cleanup without renewed stage approval.

Before native retirement with retained work, use a supported non-destructive keep operation and verify worktree detachment.
An idle prompt alone does not prove preservation because native exit can remove attached worktrees.
If detachment is unestablished, preserve unique source and required evidence outside auto-removed worktrees before retirement.

Before a discard option, verify named-base source preservation, no unique work, and no active consumers.
A local ahead-commit count alone does not prove source would be lost.
Keep ungranted destructive operations and protected-resource refusals outside that authority.
Delete feature branches except the base, only within granted cleanup after base integration and ancestry proof.
