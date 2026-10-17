# Authorized Engineering Delivery Nodes

Use only nodes allowed by the goal's scope and authority.

| Node | Owner and authority | Required inputs | Result and completion evidence |
| --- | --- | --- | --- |
| Implementation | Main or one named Worker writes only assigned files within granted authority. | Bounded scope, accepted behavior, prerequisite results, and owned paths. | Changes, relevant checks, and material limitations. |
| Verification | Main or one named Worker runs authorized read-only checks. | Changed behavior, expected results, and applicable existing checks. | Exact commands, outcomes, coverage, and evidence limits. |
| Environment scan | Main assigns one read-only Explorer to scan only user environment details and secrets in the current diff. | Provide the current diff and publication destination, excluding commit author and committer names and email addresses. | Report exposure locations and types or no findings without reporting, flagging, rewriting, or blocking on excluded contributor information. |
| Publication in Main | Main publishes only to the user-authorized destination. | Accepted changes, required checks, environment scan, working branch, and base branch. | Published branch and PR/MR URL. |
| Independent review | A separate reviewer inspects the maintainer's complete PR/MR or contributor's complete branch and affected consumers. | Current candidate, intent, acceptance criteria, project review instructions, and validation evidence. | Findings with failure scenarios and source evidence, or an explicit no-findings result with coverage limits. |
| Finding verification | A verifier independent of the finder and fixer checks every candidate before reporting. | Candidate identifiers, evidence, affected source, and acceptance criteria. | Confirmed, refuted, or unverified outcomes for each candidate, with evidence and limits. |
| Blocker fix | The same branch owner changes only confirmed affected scope. | Confirmed blocker, affected files, and existing PR/MR when available. | Fix with relevant verification evidence. |
| Scoped review | An independent reviewer reassesses affected changes and interactions against the earlier complete review. | Prior findings and dispositions, updated files, and current PR/MR when available. | Reassessment with source evidence and a complete-review refresh when earlier coverage becomes insufficient. |
| Deferral registration | Main uses the authorized long-term tracker. | Accepted nonblocking finding and verified tracker access. | Follow-up record with evidence, scope, acceptance, owner, and next action. |
| Integration in Main | Main integrates only after all required gates pass. | Passing checks, resolved blockers, registered deferrals, and authorized base branch. | Base branch update and post-integration verification. |

## Readiness And Transitions

Before starting a node, confirm its accepted inputs, owner, authority, tools, paths, and branch.
Confirm that required predecessor nodes ended and no conflicting writer owns the same resource.
Connect nodes only when a predecessor result or condition gates its successor.
Start ready independent nodes in parallel and serialize conflicting writes.
Join branches only when a later node requires their combined results.
Keep reports dependent on finding verification and edits dependent on any explicit user approval.

Main owns node status and decides whether to retry, reassign, or stop after a failure.
Follow Main Agent Contract for retry bounds and attempt handling, and Delivery for integration gates and base readback.
