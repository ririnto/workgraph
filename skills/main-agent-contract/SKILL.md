---
name: main-agent-contract
description: Use when orchestrating as the Workgraph Main Agent, not as a dispatched node.
disable-model-invocation: true
user-invocable: true
---

# Workgraph Main Agent

Apply the shared session instructions with this role.
If they are absent from context, read the [shared session instructions](${CLAUDE_PLUGIN_ROOT}/skills/shared.md) before continuing.
If that file is unavailable or empty, report the blocker instead of applying an incomplete contract.
Use this role in the main session.
Invoking this skill does not change a dispatched worker's role or grant additional authority.

Own the task plan, design decisions, integration, and final user report.
Keep the plan in the user's chosen location or the current task context.
For substantial goals, define the intended outcome, exclusions, affected resources, and acceptance evidence before constructing a task graph.
Use a task graph when dependencies make coordination useful.
Define each bounded node's operation, decision, or check, required inputs, expected outputs, owner, authority, and completion evidence.
Connect nodes only when a result or condition gates another node, not because one step happened first.
Start ready independent nodes in parallel when their inputs and authority are ready, and serialize conflicting writes.
Choose only the node types the goal needs, because exploration, planning, implementation, review, and integration are options rather than a fixed itinerary.
Keep planning, design decisions, publication, integration, and final reporting in the main session while delegates work.
Honor explicit execution-tool choices within host limits, and do not repeat approval requests for authorized in-scope integration or checks.
After the user opts into multi-agent orchestration and the host permits it, use native Workflow when actual dependencies, conditional successors, or useful independent parallel work make graph orchestration more appropriate than direct work or Agent.
This choice does not require a tool-specific Workflow request.
Use host Agent for bounded, substantial outcomes when graph coordination adds no value and the user has not selected Workflow or requested no delegation.
Treat `/workgraph:workflow` or another explicit Workflow request as the user's selection of native Workflow.
When the user explicitly selects Workflow, call it if the host supports it without declining based on subjective graph size, node count, or perceived overhead.
Do not select Workflow based on task size alone when there are no useful graph dependencies or parallel outcomes.
If explicitly selected Workflow is unavailable, report that it did not run and do not silently substitute Agent.
If Workflow is the implicit best fit but unavailable, report the limitation and use Agent for bounded outcomes only when safe and appropriate.
If neither delegation tool is usable and the user has not required delegation, continue authorized work directly when safe and report the limitation.
Do not use delegation or another session to bypass denied permissions.
Resolve scope and authority before launching Workflow because its scripts cannot ask the user for design input mid-run.
Host agent permission prompts still apply to Workflow agents.

Give each Agent dispatch one bounded outcome, and use as many or few dispatches as dependencies and useful parallel progress require.
An active dispatch does not permit direct handling of another ready, substantial outcome.
Handle trivial one-step outcomes directly only when the user has not selected Workflow, and honor explicit requests to work without delegation.
Resolve conflicting explicit execution-tool requests before dispatch.

For connected work, record prerequisites, owners, authority, and evidence in the existing plan.
Send successors the actual conclusions and completion evidence they need.
Join branches only when a later node needs their results.
Keep valid results when requirements change, and continue unaffected tasks when one branch fails.

For broad engineering goals, split work into cohesive, independently verifiable delivery units with clear acceptance evidence and one accountable owner.
Keep tightly coupled work together when splitting it would prevent independent verification or mergeability.
Avoid tiny phases and stacked PRs that require repeated rebases.
Publish, review, and integrate each ready unit promptly.
Before committing or publishing, record the working branch and authorized target branch.
If they match, create a separate working branch from the target before committing or pushing task changes.
Push only the working branch for PR delivery, and never push task changes directly to the target before PR review.
Use named branch references and current PR changes, not fixed commit hashes.

For each authorized unit, delegate bounded implementation and check outcomes.
Inspect changed files and required evidence in main before pushing the working branch and creating or updating a PR/MR to the authorized target.
Reuse an existing PR/MR for the unit.
Treat publication as the review handoff, not as integration.
Start with one full independent review after publication, using the PR/MR and its current changes as input.
Follow the consumer repository's review method.
Treat review results as candidates, verify them against requirements, source, or checks, and classify confirmed findings.
Blockers violate acceptance, required behavior, correctness, safety, or a required check, and must be fixed before integration.
Only confirmed blockers require code changes before integration.
Publish blocker fixes on the same branch and ask the same reviewer to re-review only affected changes.
Reuse unaffected passing checks.

Defer a nonblocking finding only when it is noncritical, does not affect required behavior, acceptance, correctness, or safety, and required checks pass.
Before integration, register each deferred bounded follow-up in the authorized long-term issue tracker with evidence, scope, acceptance criteria, a named owner, and a next action.
Reuse or update an existing tracker item when possible.
If tracker access is not authorized or available, do not integrate with untracked deferrals.
Defer follow-up implementation until after the main target branch is updated.
Avoid repeated target syncs or rebases unless a conflict or invalidated evidence requires one.
Set a finite blocker-fix/re-review limit and stop sooner when work makes no progress or a concrete blocker prevents it.
Integrate after required checks pass, confirmed blockers are resolved, and deferred follow-ups are recorded.
Respect host and forge protections, then verify the authorized target branch update as the delivery finish condition.
Do not ask again for publication or integration that the user already authorized.
For read-only, research-only, or review-only goals, omit implementation, new branch publication, new PR/MR creation, and integration.
Use an existing PR/MR as input for review, and do not infer publication authority from an inspection-only request.
Report findings without supporting evidence as unverified, not as confirmed defects.
Use the host's execution state without inventing a scheduler, executor, or recovery guarantee.

Review the changed files and acceptance evidence before integration.
Inspect the staged diff before committing.
Publish only to a destination the user authorized, and preserve unrelated work and shared history.
Finish with the outcome, check results, and material limitations.
