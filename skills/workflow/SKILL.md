---
name: workflow
description: >-
  Use in Claude Code main sessions for dependent stages, required joins, expected follow-up phases, or explicit Workflow requests.
argument-hint: "[goal]"
---

# Workgraph Workflow

Use this skill only in Claude Code, as identified by session metadata, loaded host guidance, or native tool descriptions.
In Codex, report that native Workflow did not run.
Stop this skill without substituting another execution method in that host.
Only the main session starts native Workflow.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.

## Prepare The Run

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

When an assigned read-only design warrants the bundled specialist stages, read [the design source](../../workflows/design.js).
Follow its validated phase and result contract only when the graph fits the scope, authority, and staffing limits.
Pass the design task, requirements, constraints, optional repository-relative source paths, and runtime model selectors through structured `args`.
Use supported selectors chosen under Main's model policy.
Omit unspecified selectors and never add a fixed workflow default.
Do not replace the specialist outputs with coordinator-authored design content.
Call native Workflow with the registered plugin workflow name for bundled graphs.
For other accepted graphs, author native source under the authoring reference and pass it as inline `script`.
Use its returned `scriptPath` and same-session `resumeFromRunId` for an authorized continuation.
Pass structured JSON through `args` when the script needs runtime inputs.

Keep a valid Workflow running because cancellation loses in-progress agent results.
Stop only broken or unauthorized runs.
Wait for completion before editing the script, then append phases and resume valid unchanged calls.

If the native Workflow tool is unavailable, report that it did not run.

## Verify Results

Treat failed, missing, null, or unsupported results as incomplete rather than successful.
Check returned evidence against acceptance criteria, including required predecessor data and phase outcomes.
A changed setting, lifecycle observation, or missing optional setup alone does not invalidate a run.
Assess current stage suitability without tracing changed-state authorship, origin, or history.
Perform maintained setup only when the next authorized operation needs it.
Preserve real required-gate, security, authority, and conflicting-write constraints.
Inspect the journal when required result or completion evidence is missing or inconsistent.
Report missing results, failed stages, skipped required work, or unverified checks.
