---
name: workflow
description: Use for authorized multi-agent work with dependencies or useful parallel outcomes, or when the user requests Workflow.
argument-hint: "[goal]"
user-invocable: true
---

# Workgraph Workflow

Use this skill only in the main session.
If dispatched as a worker, return the request to main without starting Workflow.
Treat an explicit Workflow request or an authorized multi-agent goal with useful dependencies or parallel outcomes as a selection of native Workflow.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.
Preserve every other scope, authority, and execution constraint from the user's request.
Resolve any conflict between Workflow selection and another execution constraint before calling the tool.
Do not ask whether to invoke Workflow again.

## Load Workflow Guidance

Load the `workflow-authoring` skill before constructing a Workflow script.
Follow its current tool API, script syntax, permission, pipeline, and resume guidance.

## Plan In Main

Keep the goal, exclusions, scope, owners, authority, integration branch, and acceptance evidence in the main session.
Reuse the current goal, decisions, plan, and evidence when they still cover the request.
Skip exploration or planning work when existing facts already answer those questions.
Preserve valid goals and authorization across side questions and corrections, then continue unaffected work.
Resolve questions that can change scope or authority before starting Workflow because a script cannot pause for user input.

Build a task-specific graph from actual result dependencies and conditions.
Do not use progress-phase labels as dependencies or impose a fixed itinerary.
Define each bounded outcome by its operation, required inputs, expected outputs, owner, authority, and completion evidence.
Connect nodes only when a result or condition gates another node.
Start ready independent nodes in parallel and serialize conflicting writes.
Give each successor the actual predecessor results and evidence it needs.
Keep planning, design decisions, publication, and integration in the main session.

## Run Workflow

Call the native Workflow tool for each ready graph segment after defining its scope, dependencies, owners, authority, and evidence.
Do not stop after drafting a script or offering to run it.
Use Workflow when real dependencies or independent parallel outcomes make graph coordination appropriate, even without an explicit request.
Honor explicit Workflow requests whenever the host supports the tool, regardless of subjective graph size or node count.
Keep every node within the user's authorization and host permissions.
Do not use Workflow or its agents to bypass a denied permission or expand the user's authority.

If the native Workflow tool is unavailable, report that it did not run.
For an explicit Workflow request, do not silently substitute Agent or direct execution.
For an implicit selection, continue with Agent only when it can safely deliver bounded outcomes, and report the Workflow limitation.
Ask only when the unavailable tool blocks the goal or when a decision can change scope or authority.

## Build The Goal Graph

Use the delivery units and acceptance evidence already defined in the main-session plan.
Connect nodes only through actual results or conditions.

For authorized engineering delivery, make implementation and check nodes return changed files and check evidence.
Start independent nodes together and serialize conflicting writes.
Make main-owned branch/PR publication depend on accepted changes and required checks.
Make one full independent review depend on the published PR/MR and its current changes.
Make finding verification depend on that review result, using the main-session contract's blocker criteria.
Create a same-branch fix node only for a confirmed blocker.
Make the same PR/MR update depend on that fix, then run a scoped re-review of affected changes with the same reviewer.
Reuse unaffected checks and do not add recurring target-sync nodes.
Sync or rebase only when a conflict or changed target invalidates relevant evidence.

Represent each accepted nonblocking deferral as a tracker-record result with evidence, scope, acceptance criteria, owner, and next action.
Make its registration gate integration, and schedule follow-up implementation only after the target branch update.
Make main integration depend on passing required checks, resolved blockers, and recorded follow-ups.
Verify the target branch update as the delivery finish condition rather than stopping at PR creation.

For read-only, research-only, or review-only goals, omit implementation, new publication, and integration nodes.
Pass an existing PR/MR and its current changes to a review node when the goal concerns that artifact.
Do not infer publication or integration authority from an inspection-only goal.

For example, a known parser regression can let a parser-fix node and separate regression-test node start in parallel.
Their outputs gate checks, which gate PR publication, which gates one full review and blocker verification.
Only a verified blocker opens a same-branch fix and scoped re-review path before main integration.

## Verify And Integrate

Treat failed or missing agent results, including `null`, as incomplete rather than successful.
Compare returned evidence with the acceptance criteria and report any missing results or checks.
Revalidate source files, repository state, and check inputs before relying on saved Workflow results.
Keep integration in the main session and perform it only within the user's authorization.
