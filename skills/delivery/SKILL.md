---
name: delivery
description: Use in the main session for repository changes or authorized branch publication and integration.
user-invocable: true
---

# Repository Delivery

Use this skill in the main session.

## Plan Delivery Units

Split broad goals into cohesive, independently verifiable units with acceptance evidence and one accountable owner.
Keep coupled work together when splitting prevents independent verification or mergeability.
Avoid tiny phases and stacked PRs that require repeated rebases.
Publish, review, and integrate each ready unit within granted authority.
Use the user's specified base branch, otherwise retain the recorded base or use the current branch.
Without a base, confirm the active development branch.
Record working and authorized base branches before branch creation, commits, or publication.
If they match, create a separate branch from the base before committing or pushing task changes.
Push only the working branch for PR delivery, and never push task changes directly to the base before PR review.
Use named branch references and current PR changes, not fixed commit hashes.

## Check Before Publication

Inspect changed files and required evidence before publishing to the authorized base.
Before publishing a branch, delegate a brief diff scan for exposed user environment details to an exploration agent.
Treat this scan as exploration, without a code review.
Require file locations and the type of exposure, or a clear no-findings result.
Inspect flagged content and remove exposed details before pushing the branch.

## Review Published Work

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
Implement deferred follow-ups only after updating the base branch.
Repeat base syncs or rebases only for conflicts or invalidated evidence.
Set a finite fix/re-review limit and stop sooner without progress or when a concrete blocker prevents work.
Integrate after required checks pass, confirmed blockers are resolved, and deferred follow-ups are recorded.
Finish delivery by verifying the authorized base branch update.
Delete feature branches except the base, only within granted cleanup after base integration and ancestry proof.
