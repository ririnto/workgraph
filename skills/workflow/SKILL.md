---
name: workflow
description: >-
  Use only as the Claude Code Main Agent for native Workflow execution or design after selecting Workflow under Main's host guidance.
argument-hint: "[goal]"
disable-model-invocation: true
---

# Workgraph Workflow

This skill is an entry point for the Claude Code Main Agent only.
Verify the active host and role from session metadata, loaded role guidance, or native tool descriptions before reading its procedure.
If this is not the Claude Code Main Agent, do not follow the procedure or load its references.
Complete an existing bounded assignment under its own contract, or report the host or role mismatch to the requester.

As the Claude Code Main Agent, use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.
For repository delivery, this procedure selects the single adaptive `workgraph:delivery` workflow.

Do not describe another execution method as native Workflow.

## Prepare the run

Do not use Workflow to replace independent native Task controllers.
Keep each independent Task's Main and host manager distinct from bounded host Agent delegation.
Workflow's internal `agent()` calls are stages, not additional host Agent dispatches or native Task Mains.
A dispatched `claude -p` Task Main or reviewer loads Main's contract, so its brief must state that the session is a dispatch node and must read [Subagent Context](../subagent-context/SKILL.md).
Agent-tool subagents and Workflow stages lose the Workflow tool through the host subagent filter.
Do not dispatch a Workgraph node as a fork, because forks keep the main tool pool including Workflow.
If implicit Workflow is unavailable, report it and use Agent only when it satisfies the accepted contract.
Use Main's accepted graph, scope, ownership, authority, and acceptance criteria as the run inputs.
Group outcomes in one Workflow only when they share a prerequisite, result, integration, or acceptance dependency.
Use separate runs for independent repository tasks without such dependencies, so one cannot block another's validation or publication.
A shared activity label or simultaneous request alone is not a dependency.
For ownership of each outcome, follow the [Main Agent Contract](../main-agent-contract/SKILL.md#assignments).
For authorized engineering-delivery graphs, read [Delivery](../delivery/SKILL.md) and [delivery mapping](references/delivery.md) unless their complete content is already loaded.
Before authoring or editing a Workflow script, or resuming a run, read [authoring](references/authoring.md) unless its complete content is already loaded.
The native Workflow tool description remains authoritative when its API differs from bundled guidance.
Follow the Main Agent Contract's model policy for agent settings.
Separate proposal and edit runs when a user requires diff-first approval because native Workflow cannot request mid-run sign-off.
Resume authorized edit work only after that approval, without adding gates to work already authorized.

## Run Workflow

For bundled delivery graphs, read the [adaptive delivery](../../workflows/delivery.js) source and call native Workflow with its registered plugin name.
For other accepted graphs, author native source under the authoring reference and pass it as inline `script`.
Use its returned `scriptPath` and same-session `resumeFromRunId` for an authorized continuation.
Pass structured JSON through `args` when the script needs runtime inputs.

Keep useful authorized Workflow runs active because cancellation loses in-progress agent results.
Stop when the user requests it, authorization changes, or the run cannot usefully complete the accepted task.
Wait for completion before editing the script, then append phases and resume valid unchanged calls.

If the native Workflow tool is unavailable, report that it did not run.

## Read-only design

For a design request, establish the task, requirements, constraints, and relevant sources before developing a candidate.
Describe components, interfaces, data flow, decisions and alternatives, failure behavior, evidence, and assumptions.
Map each requirement to the proposed design and propose representative regression and evaluation cases with observable outcomes.
Distinguish repository evidence from inference and proposed checks from executed checks.
Challenge the candidate against each requirement, interface, realistic failure mode, test claim, and open question.
Record contradictions and unmet requirements as blockers, including when the candidate acknowledges them.
Verify findings independently of their finder and author when the accepted task requires independent verification.
Record a disposition for every finding and an evidence-backed status for each requirement.
Block acceptance when required work is missing, accepted requirements are unmet, or confirmed defects violate those requirements.
Keep unresolved findings visible and assess their effect on acceptance instead of blocking on optional suggestions alone.
Report the candidate as incomplete when required independent verification is unavailable, rather than claiming it occurred.

Keep read-only work within the session's authorization and tool restrictions.
Use delegated stages only when the required host-enforced tool restrictions are verified in force for those calls, because a prompt cannot restrict tools.
Otherwise work directly within the main session's authorized tools and report any unmet independence requirement.

## Verify results

Check returned evidence against acceptance criteria, including required predecessor data and phase outcomes.
A changed setting, lifecycle observation, or missing optional setup alone does not invalidate a run.
Assess current stage suitability without tracing changed-state authorship, origin, or history.
Perform maintained setup only when the next authorized operation needs it.
Preserve real required-gate, security, authority, and conflicting-write constraints.
Inspect the journal when required result or completion evidence is missing or inconsistent.
Report missing results, failed stages, skipped required work, or unverified checks.
