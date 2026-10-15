---
name: workflow
description: >-
  Use in Claude Code main sessions for fan-out, dependent stages, or verification that benefits from orchestration.
argument-hint: "[goal]"
---

# Workgraph Workflow

Use this skill only in Claude Code, as identified by session metadata, loaded host guidance, or native tool descriptions.
In Codex, report that native Workflow did not run.
Stop this skill without substituting another execution method in that host.
Only the main session starts native Workflow.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.

## Prepare The Run

Use native Workflow for independent fan-out or dependent verification, including follow-ups that consume an accepted result or run only when that result permits them.
Use a single host Agent for one bounded task, exclude speculative future tasks and display-only phases, and report unavailable implicit Workflow before using Agent only when it safely meets the task contract.
Use Main's accepted graph, scope, ownership, authority, and acceptance criteria as the run inputs.
Encode its actual dependencies in script control flow, not in progress labels.
Pass each required predecessor result to the dependent call.
Use one execution path per outcome instead of duplicating work in host Agent and Workflow.
For authorized engineering-delivery graphs, read `references/delivery.md` unless its complete content is already loaded.
Before authoring or editing a Workflow script, or resuming a run, read `references/authoring.md` unless its complete content is already loaded.
The native Workflow tool description remains authoritative when its API differs from bundled guidance.
Follow the Main Agent Contract's model policy for agent settings.

## Run Workflow

Call native Workflow with an inline JavaScript script on the first invocation.
Use its returned `scriptPath` and same-session `resumeFromRunId` for an authorized continuation.
Pass structured JSON through `args` when the script needs runtime inputs.
Await every required agent, pipeline, parallel, or nested Workflow promise before returning.

Keep a valid Workflow running because cancellation loses in-progress agent results.
Stop only broken or unauthorized runs.
Wait for completion before changing its script, then append later phases or accept a full rerun.

If the native Workflow tool is unavailable, report that it did not run.

## Verify Results

Treat failed, missing, null, or unsupported results as incomplete rather than successful.
Check returned evidence against acceptance criteria, including required predecessor data and phase outcomes.
Inspect the journal when a result, phase, or completion status is unexpected.
Report missing results, failed stages, skipped required work, or unverified checks.
