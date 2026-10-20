# Authorized Engineering Delivery Nodes

Use only nodes allowed by the goal's scope and authority.
For authorized repository changes, preserve Delivery's sequence: Issue creation -> branch creation -> brief diff security scan -> implementation -> parallel reviews -> normal merge.
Reuse a relevant Issue and require its link before branch creation or implementation.
For in-flight work without an Issue, establish its truthful current stage before the next source action.
Do not restart completed work.
Keep the Issue's stage, completed evidence, material blockers, branch and PR/MR links, and next action current.

| Node | Owner and authority | Required inputs | Result and completion evidence |
| --- | --- | --- | --- |
| Implementation | Main or one named Worker writes only assigned files within granted authority. | Linked Issue, task branch, initial or incoming diff scan, bounded scope, accepted behavior, prerequisite results, and owned paths. | Changes, relevant checks, and material limitations reflected in the Issue's actual stage. |
| Verification | Main or one named Worker runs authorized read-only checks. | Changed behavior, expected results, and applicable existing checks. | Exact commands, outcomes, coverage, and evidence limits. |
| Environment scan | Main assigns one read-only Explorer to scan only user environment details and secrets before implementation and each changed push. | Provide the initial or incoming diff, or current changed diff for publication, excluding commit author and committer names and email addresses. | Exposure locations and types or no findings, with an empty initial diff labeled honestly and no claims about later changes. |
| Publication in Main | Main publishes only to the user-authorized destination. | Accepted changes, required checks, environment scan, working branch, and base branch. | Published branch and PR/MR URL. |
| Independent review | Selected separate reviewers inspect the maintainer's complete PR/MR or contributor's complete branch and affected consumers in parallel. | Current candidate, intent, acceptance criteria, project review instructions, and validation evidence. | Findings with failure scenarios and source evidence, or an explicit no-findings result with coverage limits and truthful review timing. |
| Finding verification | A verifier independent of the finder and fixer checks every candidate before reporting. | Complete predecessor result, candidate identifiers, evidence, affected source, and acceptance criteria. | Confirmed, refuted, or unverified outcomes for each candidate, with evidence and limits. |
| Blocker fix | The same branch owner changes only confirmed affected scope. | Confirmed blocker, affected files, and existing PR/MR when available. | Fix with relevant verification evidence. |
| Scoped review | An independent reviewer reassesses affected changes and interactions against the earlier complete review. | Prior findings and dispositions, updated files, and current PR/MR when available. | Reassessment with source evidence and a complete-review refresh when earlier coverage becomes insufficient. |
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
