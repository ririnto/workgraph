---
name: workflow
description: Use when the user explicitly asks to orchestrate a goal with Claude Code Workflow, including by invoking `/workgraph:workflow`.
argument-hint: "[goal]"
disable-model-invocation: true
user-invocable: true
---

# Workgraph Workflow

Use this skill only in the main session.
If dispatched as a worker, return the request to main without starting Workflow.
Treat `/workgraph:workflow` as an explicit request to orchestrate the goal through native Workflow.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.
Preserve every other scope, authority, and execution constraint from the user's request.
Resolve any conflict between Workflow selection and another execution constraint before calling the tool.
Do not ask whether to invoke Workflow again.

## Load Workflow Guidance

Load the `workflow-authoring` skill before constructing a Workflow script.
Follow its current tool API, script syntax, permission, pipeline, and resume guidance.

## Plan In Main

Keep goal definition, exclusions, affected resources, scope, design decisions, task graph planning, acceptance evidence, and authorized integration in the main session.
Resolve any question that changes scope or authority before starting Workflow because its script cannot pause for user input.
Ask only when missing information can change the result.

Build a task-specific graph from actual result dependencies and conditions.
Do not impose a fixed sequence of exploration, planning, implementation, review, or integration nodes.
Define each bounded outcome with its operation, decision, or check, required inputs, expected outputs, owner, authority, and completion evidence.
Connect nodes only when a result or condition gates another node.
Start ready independent nodes in parallel and serialize conflicting writes.

## Run Workflow

Call the native Workflow tool for the requested goal after defining its scope, graph, and acceptance evidence.
Do not stop after drafting a script or offering to run it.
Do not decline an explicit Workflow request based on subjective graph size, node count, or perceived overhead.
Keep every node within the user's authorization and host permissions.
Do not use Workflow or its agents to bypass a denied permission or expand the user's authority.

If the native Workflow tool is unavailable, report that the requested orchestration did not run.
Do not claim a run or silently substitute Agent or direct execution.
Ask how to proceed when the unavailable tool blocks the requested goal.

## Verify And Integrate

Treat failed or missing agent results, including `null`, as incomplete rather than successful.
Compare returned evidence with the acceptance criteria and report any missing results or checks.
Revalidate source files, repository state, and check inputs before relying on saved Workflow results.
Keep integration in the main session and perform it only within the user's authorization.
