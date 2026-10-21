---
name: workflow
description: >-
  Use in Claude Code main sessions for dependent stages, expected follow-up phases, or explicit Workflow requests.
argument-hint: "[goal]"
---

# Workgraph Workflow

Use this skill only in Claude Code, as identified by session metadata, loaded host guidance, or native tool descriptions.
In Codex, report that native Workflow did not run.
Stop this skill without substituting another execution method in that host.
Only the main session starts native Workflow.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.

## Prepare The Run

Prefer direct Agent for work that ends in one phase.
Start a one-phase Workflow when the accepted task expects actual follow-up phases.
Exclude speculative future tasks and display-only phases.
Honor explicit Workflow requests within the host's supported authority.
If implicit Workflow is unavailable, report it and use Agent only when it satisfies the accepted contract.
Use Main's accepted graph, scope, ownership, authority, and acceptance criteria as the run inputs.
Encode its actual dependencies in script control flow, not in progress labels.
Pass each required predecessor result to the dependent call.
Use one execution path per outcome instead of duplicating work in host Agent and Workflow.
For authorized engineering-delivery graphs, read `references/delivery.md` unless its complete content is already loaded.
Before authoring or editing a Workflow script, or resuming a run, read `references/authoring.md` unless its complete content is already loaded.
The native Workflow tool description remains authoritative when its API differs from bundled guidance.
Follow the Main Agent Contract's model policy for agent settings.
Separate proposal and edit runs when a user requires diff-first approval because native Workflow cannot request mid-run sign-off.
Resume authorized edit work only after that approval, without adding gates to work already authorized.

## Run Workflow

Call native Workflow with an inline JavaScript script on the first invocation.
Use its returned `scriptPath` and same-session `resumeFromRunId` for an authorized continuation.
Pass structured JSON through `args` when the script needs runtime inputs.
Await every required agent, pipeline, parallel, or nested Workflow promise before returning.

Keep a valid Workflow running because cancellation loses in-progress agent results.
Stop only broken or unauthorized runs.
Wait for completion before editing the script, then append phases and resume valid unchanged calls.
Rerun only changed or invalidated work.

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
