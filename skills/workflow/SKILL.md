---
name: workflow
description: Use when the user explicitly asks to orchestrate a goal with Claude Code Workflow, including by invoking `/workgraph:workflow`.
argument-hint: "[goal]"
disable-model-invocation: true
user-invocable: true
---

# Workgraph Workflow

Use this skill only in the main session.
If dispatched as a worker, return the request to main without starting Workflow.
Treat `/workgraph:workflow` as an explicit request to orchestrate the goal through native Workflow.
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
Do not decline an explicit Workflow request based on subjective graph size, node count, or perceived overhead.
Keep every node within the user's authorization and host permissions.
Do not use Workflow or its agents to bypass a denied permission or expand the user's authority.

If the native Workflow tool is unavailable, report that the requested orchestration did not run.
Do not claim a run or silently substitute Agent or direct execution.
Ask how to proceed when the unavailable tool blocks the requested goal.

## Authorized Engineering Delivery

For an authorized engineering-delivery goal, delegate bounded implementation and check outcomes.
After workers finish, inspect the changed files and required evidence in the main session.
When they meet scope and acceptance criteria, commit and push the working branch, then create or update a PR/MR targeting the authorized branch.
Reuse an existing PR/MR for the goal.
Treat branch and PR/MR publication as a handoff for review, not as main integration.

Start independent review only after the PR/MR exists.
Give each review node the published PR/MR and its current changes, and use the repository's review method.
Treat review comments as candidate findings.
Verify each candidate against requirements, source, or executable checks before routing confirmed findings to a bounded fix on the same branch.
Publish fixes through that branch and PR/MR, then review affected changes again.
Reuse unaffected passing evidence.
Set a finite review/fix limit and stop sooner when a round makes no progress or a concrete blocker prevents work.

Integrate from main only after required checks pass and confirmed review blockers are resolved.
Respect host and forge protections, then verify that the authorized target branch contains the integrated changes.
Do not ask again for publication or integration that the user already authorized.

For read-only, research-only, or review-only goals, omit implementation, branch publication, new PR/MR creation, and integration.
Use an existing PR/MR and its current changes as input when reviewing that artifact.
Do not infer publication authority from a request to inspect or review.

For example, a known parser regression can let a parser-fix node and a separate regression-test node start in parallel.
Their results gate the parser checks, and passing checks gate main's branch and PR/MR publication.
The published PR/MR gates independent review, confirmed blockers gate same-branch fixes, and resolved blockers plus passing checks gate main integration.

## Verify And Integrate

Treat failed or missing agent results, including `null`, as incomplete rather than successful.
Compare returned evidence with the acceptance criteria and report any missing results or checks.
Revalidate source files, repository state, and check inputs before relying on saved Workflow results.
Keep integration in the main session and perform it only within the user's authorization.
