---
name: delivery
description: Use in main for repository changes, branch publication, or integration.
---

# Repository delivery

Use in main under Main Agent Contract.

## Confirm repository access

Before writes, verify the repository, access, and operation-specific authority.
Select within the user's scope without age, activity, or archive-status filters.
Honor protections and destination/fork restrictions.
If access or authority is unverified, stop affected writes and report the gap.

## Establish merge authority

Base merge, auto-merge, and queue enrollment require a user request or explicit authorization for that integration and destination.
Fix/improvement requests, PR/MR publication, maintainer access, and checks/reviews do not authorize merges.
Reuse authorization while the candidate, destination, and conditions remain in scope, without asking again.
Otherwise finish authorized changes, checks, and publication, returning the ready candidate and evidence.
Preserve its branch and open request for the user's decision.
An unrequested merge is outside scope, not an implementation failure.

## Plan delivery

Use cohesive, independently verifiable units when helpful.
Keep coupled work together when splitting prevents verification or mergeability.
Avoid tiny phases and stacked PRs needing repeated rebases.
Publish and review each authorized ready unit.
Do setup only when an authorized operation needs it.
Git delivery does not authorize deployment, credentials, live assets, forks, or upstream destinations.
For assigned queue work or assessment, read [fix queue guidance](references/fix-queues.md) unless fully loaded.

### Branches

Use the requested base, otherwise the recorded base or current branch.
If none is known, confirm the active development branch.
Prefer a separate branch and PR/MR, honoring authorized alternatives within protections.
For PR delivery, record working and authorized base refs before branching, commits, or publication.
If equal, create a separate working branch before committing or pushing.
Push only that working branch and use named refs and the current PR/MR diff.

### Progress

Follow task/repository tracking requirements and create or reuse issues when required.
Keep tracked stage, evidence, blockers, links, and next action current.
Report completed stages, not guessed percentages.
Do not restart completed work.

## Inspect the complete candidate

Before implementation, inspect the candidate against its named base, including committed, staged, unstaged, and untracked changes.
Include complete incoming PR/MR diffs and relevant local changes.
Ordinary `git diff` cannot prove emptiness.
An empty finding requires complete inspection and covers only that snapshot.
Assess and address secrets and private information before exposure outside the trusted boundary.

## Check before publication

Before publication or integration, inspect changes and required evidence.
Inspect the complete publication for private environment details and secrets.
Do not report, flag, rewrite, or block on author/committer names or emails in commit metadata.
Use a separate read-only scanner when required or unfamiliar content creates meaningful exposure risk.
Request exposure locations/types or no findings, separately from correctness review.
Reuse scans only for unchanged diffs.
Inspect flagged content and remove exposure before pushing.

## Retain validation evidence

Define acceptance target, trigger, input, and observable outcome before checks.
Use existing commands and supported entry points, with runtime evidence when static checks cannot establish behavior.
Record commands, setup, exit status, and raw results apart from interpretation.
Retain failures and label unverified behavior.
Create evidence files only when checks, investigation, or recovery need them.
Summarize commands, outcomes, coverage, and limits in authorized PR/MR text without raw logs by default.

## Review and publish

Infer maintainership from project roles or the user's statement.
Follow repository review and independence requirements.
Keep valid reviews without calling sequential work parallel or rerunning only for timing.
Distinguish unavailable optional coverage from unmet required review.
Reuse the unit's existing PR/MR.

Give reviewers the complete current candidate, intent, acceptance, project review rules, and validation evidence.
Ask reviewers to inspect affected real consumers and correctness/security failure modes.
Request concrete scenarios and source locations, distinguishing introduced from pre-existing defects.
When no actionable defects remain, request no findings and coverage limits.
Apply Main's review and finding rules.
Give verifiers the candidate and relevant predecessor evidence.
Record each finding as fixed, rejected with evidence, or deferred.
Do not change code solely for unsupported style, cleanup, or repeated resolved requests.
Keep human approvals distinct from agent review.
Record failure consequences, uncovered risks, and recovery.

### Resolve blockers

Fix confirmed unit blockers to acceptance, required behavior, correctness, safety, or checks before integration.
Keep fixes on the working branch and update its existing PR/MR.
Reassess affected changes and interactions using prior findings and dispositions.
Refresh full review when changed scope or invalidated evidence defeats earlier coverage.
Apply Main's no-progress reassessment separately from productive fixes and runtime retries.
Keep unresolved blockers explicit without waiving acceptance or required checks at review limits.

## Defer and integrate

Block integration for own unmet acceptance, introduced/worsened defects, actual dependencies, or failed required gates.
Unrelated pre-existing issues, umbrellas, older failed units, and severity alone neither block verified delivery nor require new deferral records.
Defer only noncritical current-unit follow-ups outside required behavior, acceptance, correctness, and safety.
Before integration, record accepted deferrals in required trackers or, otherwise, the handback/existing work item.
Include evidence, scope, acceptance, and known next owner/action, reusing records when possible.
Missing required tracker access blocks only that unit.
Update the base before implementing deferred follow-ups.
Repeat syncs or rebases only for conflicts or invalidated evidence.

### Merge and verify

Merge under the authority above once required checks pass, confirmed blockers resolve, and required deferrals are recorded.
Main governs resource returns and base synchronization.
Verify completed merge into the intended destination before claiming success.
Report successful auto-merge or queue requests as enabled or queued, with remaining conditions, until the merge is observed.
After completed merge, read back the named authorized base and synchronize before dependent work.
For authorized installed-plugin updates, read [plugin update guidance](references/plugin-updates.md) before updating requested hosts unless fully loaded.

### Retire owned resources

Complete authorized task-owned cleanup without repeated stage approval.
Before retiring retained native work, use a supported non-destructive keep operation and verify worktree detachment.
Idle does not prove preservation because native exit may remove attached worktrees.
Without verified detachment, preserve unique source and required evidence outside auto-removed worktrees first.
Before discard, verify named-base source preservation, no unique work, and no active consumers.
Ahead-commit counts alone do not prove source loss.
Keep ungranted destruction and protected-resource refusals outside cleanup authority.
Delete nonbase feature branches only with cleanup authority after base integration and ancestry proof.
