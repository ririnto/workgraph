---
name: workflow
description: >-
  Use in Claude Code main sessions for read-only design, dependent stages, required joins, expected follow-up phases, or explicit Workflow requests.
argument-hint: "[goal]"
---

# Workgraph Workflow

Use this skill only in Claude Code, as identified by session metadata, loaded host guidance, or native tool descriptions.
In Codex, report that native Workflow did not run.
Stop this skill without substituting another execution method in that host.
Only the main session starts native Workflow.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.

## Prepare the run

Honor explicit supported tool choices within the host's authority before applying default routing.
Use direct Agent when one assignment completes the accepted work without a dependent agent stage or join.
Use Workflow when actual later phases are expected, even if the first invocation contains only one phase.
Exclude speculative future tasks and display-only phases.
Use Workflow for dependent agent stages or required joins within one outcome, not for steps within one Agent assignment.
Do not use Workflow to replace independent native Task controllers.
Keep each independent Task's Main and host manager distinct from bounded host Agent delegation.
Workflow's internal `agent()` calls are stages, not additional host Agent dispatches or native Task Mains.
If implicit Workflow is unavailable, report it and use Agent only when it satisfies the accepted contract.
Use Main's accepted graph, scope, ownership, authority, and acceptance criteria as the run inputs.
For ownership of each outcome, follow the [Main Agent Contract](../main-agent-contract/SKILL.md#assignments).
For authorized engineering-delivery graphs, read Delivery and `references/delivery.md` unless their complete content is already loaded.
Before authoring or editing a Workflow script, or resuming a run, read `references/authoring.md` unless its complete content is already loaded.
The native Workflow tool description remains authoritative when its API differs from bundled guidance.
Follow the Main Agent Contract's model policy for agent settings.
Separate proposal and edit runs when a user requires diff-first approval because native Workflow cannot request mid-run sign-off.
Resume authorized edit work only after that approval, without adding gates to work already authorized.

## Run Workflow

For bundled delivery graphs, read the applicable [simple](../../workflows/delivery-simple.js) or [complex](../../workflows/delivery-complex.js) source and call native Workflow with its registered plugin name.
For other accepted graphs, author native source under the authoring reference and pass it as inline `script`.
Use its returned `scriptPath` and same-session `resumeFromRunId` for an authorized continuation.
Pass structured JSON through `args` when the script needs runtime inputs.

Keep a valid Workflow running because cancellation loses in-progress agent results.
Stop only broken or unauthorized runs.
Wait for completion before editing the script, then append phases and resume valid unchanged calls.

If the native Workflow tool is unavailable, report that it did not run.

## Read-only design

For a design request, establish the task, requirements, constraints, and relevant sources before developing a candidate.
Describe components, interfaces, data flow, decisions and alternatives, failure behavior, evidence, and assumptions.
Map each requirement to the proposed design and propose representative regression and evaluation cases with observable outcomes.
Distinguish repository evidence from inference and proposed checks from executed checks.
Challenge the candidate against each requirement, interface, failure mode, test claim, and open question.
Record contradictions and unmet requirements as blockers, including when the candidate acknowledges them.
Verify findings independently of their finder and author when the accepted task requires independent verification.
Record a disposition for every finding and an evidence-backed status for each requirement.
Do not accept a design with missing required work, unverified findings, confirmed blocking or major findings, or unmet requirements.
Report the candidate as incomplete when required independent verification is unavailable, rather than claiming it occurred.

Keep read-only work within the session's authorization and tool restrictions.
Use delegated stages only when the required host-enforced tool restrictions are verified in force for those calls, because a prompt cannot restrict tools.
Otherwise work directly within the main session's authorized tools and report any unmet independence requirement.

## Verify results

Treat failed, missing, null, or unsupported results as incomplete rather than successful.
Check returned evidence against acceptance criteria, including required predecessor data and phase outcomes.
A changed setting, lifecycle observation, or missing optional setup alone does not invalidate a run.
Assess current stage suitability without tracing changed-state authorship, origin, or history.
Perform maintained setup only when the next authorized operation needs it.
Preserve real required-gate, security, authority, and conflicting-write constraints.
Inspect the journal when required result or completion evidence is missing or inconsistent.
Report missing results, failed stages, skipped required work, or unverified checks.
