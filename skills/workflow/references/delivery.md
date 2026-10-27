# Authorized Engineering Delivery Nodes

This reference depends on the loaded Delivery skill as its prior dependency.
Delivery owns repository tracking, exposure scans, review, integration gates, and cleanup authority.
This reference maps those requirements to Workflow nodes without repeating their procedures.

Use only nodes allowed by the goal's scope and authority.

| Node | Owner and authority | Required inputs | Result and completion evidence |
| --- | --- | --- | --- |
| Implementation | Main or one named Worker writes only assigned files within granted authority. | Required tracking, task branch, initial candidate, bounded scope, accepted behavior, prerequisite results, and owned paths. | Changes, relevant checks, and material limitations reflected in any required tracking. |
| Verification | Main or one named Worker runs authorized read-only checks. | Changed behavior, expected results, and applicable existing checks. | Exact commands, outcomes, coverage, and evidence limits. |
| Environment scan | Main or an assigned reader scans the candidate when Delivery requires a scan. | The complete candidate and scan purpose defined by Delivery. | The scan outcome and coverage limits requested by Delivery. |
| Publication in Main | Main publishes only to the user-authorized destination. | Accepted changes, required checks, environment scan, working branch, and base branch. | Published branch and PR/MR URL. |
| Review | Reviewers selected under Delivery and the active host reference inspect the complete candidate and affected consumers. | Current candidate, intent, acceptance criteria, project review instructions, and validation evidence. | Findings with failure scenarios and source evidence, or an explicit no-findings result with coverage limits and truthful review timing. |
| Finding verification | A verifier independent of the finder and fixer checks candidates before reporting. | Complete predecessor result, candidate identifiers, evidence, affected source, and acceptance criteria. | Confirmed, refuted, or unverified outcomes for each candidate, with evidence and limits. |
| Blocker fix | The same branch owner changes only confirmed affected scope. | Confirmed blocker, affected files, and existing PR/MR when available. | Fix with relevant verification evidence. |
| Scoped review | Reviewers selected under Delivery and the active host reference reassess changes and interactions against the earlier review. | Prior findings and dispositions, updated files, and current PR/MR when available. | Reassessment with source evidence and a complete-review refresh when earlier coverage becomes insufficient. |
| Deferral registration | Main uses the authorized long-term tracker. | Newly accepted current-unit follow-up and verified tracker access. | Record evidence, scope, acceptance, owner, and next action without requiring new records for unrelated pre-existing issues. |
| Integration in Main | Main integrates after current-unit gates pass. | Passing required checks, resolved current-unit blockers, required deferral records, and authorized base branch. | Normal merge and named-base readback without waiting for unrelated open work. |
| Owned cleanup | Main or the assigned resource owner retires only authorized task-owned resources. | Named-base preservation, no unique work, no active consumers, and granted cleanup scope. | Removed disposable resources or exact retained resources and genuine blockers without renewed stage approval. |

## Readiness And Transitions

Before starting a node, confirm its accepted inputs, owner, authority, tools, paths, and branch.
Confirm required predecessor results and conflicting-resource ownership returns without waiting for unrelated global returns.
Connect nodes only when a predecessor result or condition gates its successor.
Select needed nodes for each domain rather than copying the whole delivery graph across every domain and phase.
Start ready independent nodes in parallel and serialize conflicting writes.
Join branches only when a later node requires their combined results.
Keep reports dependent on finding verification and edits dependent on any explicit user approval.

Main owns node status and decides whether to retry, reassign, or stop after a failure.
Follow Main Agent Contract for retry bounds and attempt handling, and Delivery for integration gates and base readback.
