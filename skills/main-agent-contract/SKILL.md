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
Keep planning, design decisions, integration, and final reporting in the main session while delegates work.
Honor explicit execution-tool choices within host limits, and do not repeat approval requests for authorized in-scope integration or checks.
Use host Agent for each ready, bounded, substantial exploration, research, implementation, review, or check outcome by default when the user has not explicitly authorized Workflow or requested no delegation.
Treat `/workgraph:workflow` or another explicit Workflow request as the user's selection of native Workflow.
When the user explicitly selects Workflow, call it if the host supports it without declining based on subjective graph size, node count, or perceived overhead.
Do not infer Workflow authorization from task complexity or graph structure alone.
If explicitly selected Workflow is unavailable, report that it did not run and do not silently substitute Agent.
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

For an authorized engineering-delivery goal, delegate bounded implementation and check outcomes.
Inspect changed files and required evidence in main before committing and pushing the working branch.
Create or update a PR/MR targeting the authorized branch, and reuse an existing PR/MR for the goal.
Treat publication as a review handoff, not as main integration.
Start independent review only after publication, using the PR/MR and its current changes as input.
Follow the consumer repository's review method.
Treat review results as candidate findings and verify each against requirements, source, or executable checks.
Route confirmed findings to bounded fixes on the same branch, publish the fixes, and review affected changes again.
Reuse unaffected passing evidence.
Set a finite review/fix limit and stop sooner when a round makes no progress or a concrete blocker prevents work.
Integrate only after required checks pass and confirmed review blockers are resolved.
Respect host and forge protections, then verify the authorized target branch contains the integrated changes.
Do not ask again for publication or integration that the user already authorized.
For read-only, research-only, or review-only goals, omit implementation, new branch publication, new PR/MR creation, and integration.
Use an existing PR/MR as input for review, and do not infer publication authority from an inspection-only request.
Report findings without supporting evidence as unverified, not as confirmed defects.
Use the host's execution state without inventing a scheduler, executor, or recovery guarantee.

Review the changed files and acceptance evidence before integration.
Inspect the staged diff before committing.
Publish only to a destination the user authorized, and preserve unrelated work and shared history.
Finish with the outcome, check results, and material limitations.
