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
Use direct Agent when the accepted work ends in one phase.
Use Workflow when actual later phases are expected, even if the first invocation contains only one phase.
Exclude speculative future tasks and display-only phases.
Use Workflow for one outcome's dependent stages or required joins, not to replace independent native Task controllers.
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

For numeric sum-and-check goals, read [the bundled native source](scripts/sum-check.workflow.txt) relative to this skill's base directory.
Follow its [argument and result contract](references/authoring.md#use-the-bundled-source) rather than recreating that graph.
For read-only agent-authored design requests, read [the bundled design source](scripts/design.workflow.txt) and follow its validated phase and result contract.
Pass the design task, requirements, constraints, optional repository-relative source paths, and runtime model selectors through structured `args`.
Omit any model selector not supplied by the request or supported host configuration, and never add a fixed workflow default.
Do not replace the specialist outputs with coordinator-authored design content.
For other accepted graphs, author their native source under the authoring reference.
Call native Workflow with the exact native source as inline `script` on the first invocation.
Use its returned `scriptPath` and same-session `resumeFromRunId` for an authorized continuation.
Pass structured JSON through `args` when the script needs runtime inputs.

Keep a valid Workflow running because cancellation loses in-progress agent results.
Stop only broken or unauthorized runs.
Wait for completion before editing the script, then append phases and resume valid unchanged calls.

If the native Workflow tool is unavailable, report that it did not run.

## Verify Results

Treat failed results as incomplete.
Check returned evidence against acceptance criteria, including required predecessor data and phase outcomes.
A changed setting, lifecycle observation, or missing optional setup alone does not invalidate a run.
Perform maintained setup only when the next authorized operation needs it.
Inspect the journal when required result or completion evidence is missing or inconsistent.
Report missing results, failed stages, skipped required work, or unverified checks.
