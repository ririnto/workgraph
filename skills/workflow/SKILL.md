---
name: workflow
description: >-
  Use in the Claude Code main session when the user explicitly requests native Workflow or a dependent stage must consume an accepted earlier result.
argument-hint: "[goal]"
---

# Workgraph Workflow

Use this skill only in Claude Code, as identified by session metadata, loaded host guidance, or native tool descriptions.
In Codex, report that native Workflow did not run.
Stop this skill without substituting another execution method in that host.
Only the main session starts native Workflow.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.

## Prepare The Run

Use Main's accepted graph, scope, ownership, authority, and acceptance criteria as the run inputs.
Encode its actual dependencies in script control flow, not in progress labels.
Pass each required predecessor result to the dependent call.
Use one execution path per outcome instead of duplicating work in host Agent and Workflow.
For authorized engineering-delivery graphs, read `references/delivery.md` unless its complete content is already loaded.
Before authoring or editing a Workflow script, or resuming a run, read `references/authoring.md` unless its complete content is already loaded.
The native Workflow tool description remains authoritative when its API differs from bundled guidance.
Follow [Main's model policy](../main-agent-contract/SKILL.md#models) for agent settings.

## Run Workflow

Call native Workflow with an inline JavaScript script on the first invocation.
Use its returned `scriptPath` and same-session `resumeFromRunId` for an authorized continuation.
Pass structured JSON through `args` when the script needs runtime inputs.
Await every required agent, pipeline, parallel, or nested Workflow promise before returning.

If the native Workflow tool is unavailable, report that it did not run.
For an explicit Workflow request, do not silently substitute Agent or direct execution when Workflow is unavailable.
For an implicit selection, continue with Agent only when it can safely deliver bounded outcomes, and report the Workflow limitation.

## Verify Results

Treat failed, missing, null, or unsupported results as incomplete rather than successful.
Check returned evidence against acceptance criteria, including required predecessor data and phase outcomes.
Inspect the journal when a result, phase, or completion status is unexpected.
Report missing results, failed stages, skipped required work, or unverified checks.
