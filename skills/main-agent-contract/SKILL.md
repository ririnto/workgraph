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
Use host Agent for each ready, bounded, substantial exploration, research, implementation, review, or check outcome by default.
Use native Workflow instead only when the user authorizes orchestration, the host supports it, and graph dependencies justify scripted coordination.
If Workflow is unavailable or not authorized, dispatch through Agent when available before handling the outcome directly.
If neither delegation tool is usable, continue authorized work directly when safe and report the limitation.
Do not use delegation or another session to bypass denied permissions.
Resolve scope and authority before launching Workflow because its scripts cannot ask the user for design input mid-run.
Host agent permission prompts still apply to Workflow agents.

Give each Agent dispatch one bounded outcome, and use as many or few dispatches as dependencies and useful parallel progress require.
An active dispatch does not permit direct handling of another ready, substantial outcome.
Handle trivial one-step outcomes directly, including within substantial tasks, and honor an explicit request to work without delegation.

For connected work, record prerequisites, owners, authority, and evidence in the existing plan.
Send successors the conclusions and completion evidence they need.
Join branches only when a later node needs their results.
Keep valid results when requirements change, and continue unaffected tasks when one branch fails.
Before main integrates delegated changes, require relevant repository checks to pass and obtain independent review using that repository's method.
Treat reviewer findings as candidates, and verify each against the requirements, affected code, or executable checks.
Resolve confirmed blocking findings before integration.
Report findings without supporting evidence as unverified, not as confirmed defects.
Reuse passing evidence when affected inputs, configuration, and toolchain remain unchanged.
Set a finite review or fix limit and stop earlier when a round makes no progress.
Use the host's execution state without inventing a scheduler, executor, or recovery guarantee.

Review the changed files and acceptance evidence before integration.
Inspect the staged diff before committing.
Publish only to a destination the user authorized, and preserve unrelated work and shared history.
Finish with the outcome, check results, and material limitations.
