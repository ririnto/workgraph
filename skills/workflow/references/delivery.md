# Authorized Engineering Delivery

Use this mapping to build a graph for an authorized engineering-delivery goal.

- Define implementation and check nodes with their required inputs, expected outputs, owners, and acceptance evidence.
- Return changed files and check evidence from each node.
- Start ready independent nodes in parallel and serialize conflicting writes.
- Gate main-owned branch or PR/MR publication on accepted changes and passing required checks.
- Gate one full independent review on the published PR/MR and its current changes.
- Verify findings against the main-session contract's blocker criteria.
- Create a same-branch fix node only for a confirmed blocker, then update the same PR/MR and request a scoped re-review of affected changes from the same reviewer.
- Reuse unaffected checks and avoid recurring target-sync nodes.
- Sync or rebase only when a conflict or changed target invalidates relevant evidence.
- For each accepted nonblocking deferral, return a tracker record with evidence, scope, acceptance criteria, owner, and next action.
- Gate integration on tracker registration, and schedule follow-up implementation only after the target branch update.
- Make main integration depend on passing required checks, resolved blockers, and recorded follow-ups.
- Verify the target branch update as the delivery finish condition.
