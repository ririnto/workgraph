---
name: workflow
description: >-
  Use in the Claude Code main session when the user requests Workflow or delegated stages depend on earlier results.
  Use for an identified in-scope follow-up agent that may need an earlier result.
  Use host Agent for independent assessments that main combines.
argument-hint: "[goal]"
user-invocable: true
---

# Workgraph Workflow

Use this skill only in Claude Code, as identified by session metadata, loaded host guidance, or native tool descriptions.
Model names do not identify the execution host.
In Codex, report that native Workflow did not run.
Stop this skill without substituting another execution method in that host.
Only the main session starts native Workflow.
A worker completes a bounded assignment despite a relayed Workflow request.
Without a bounded assignment, the worker returns a direct start request to main.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.

## Prepare The Run

Use the current goal, scope, owners, authority, dependencies, and acceptance evidence as run inputs.
Map prerequisite outputs to successor inputs.
Start ready independent nodes in parallel and serialize conflicting writes.
Read `references/delivery.md` when building an authorized engineering-delivery graph.
Use the goal's acceptance evidence as the terminal output for every graph.

## Run Workflow

Call native Workflow with the prepared graph.

If the native Workflow tool is unavailable, report that it did not run.
For an explicit Workflow request, do not silently substitute Agent or direct execution when Workflow is unavailable.
For an implicit selection, continue with Agent only when it can safely deliver bounded outcomes, and report the Workflow limitation.

## Verify Results

Treat failed or missing agent results, including `null`, as incomplete rather than successful.
Compare returned evidence with the acceptance criteria and report any missing results or checks.
