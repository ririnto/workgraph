---
name: workflow
description: >-
  Use in the main session when the user requests Workflow or delegated stages depend on earlier results.
  Use for an identified in-scope follow-up agent that may need an earlier result.
  Use host Agent for independent assessments that main combines.
argument-hint: "[goal]"
user-invocable: true
---

# Workgraph Workflow

Only the main session starts native Workflow.
A worker completes a bounded assignment despite a relayed Workflow request.
Without a bounded assignment, the worker returns a direct start request to main.
Use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.

## Plan In Main

Keep the goal, exclusions, scope, owners, authority, integration branch, and acceptance evidence in the main session.

Build a task-specific graph from actual result dependencies and conditions.
Do not use progress-phase labels as dependencies or impose a fixed itinerary.
Define each bounded outcome by its operation, required inputs, expected outputs, owner, authority, and completion evidence.
Connect nodes only when a result or condition gates another node.
Start ready independent nodes in parallel and serialize conflicting writes.
Give each successor the actual predecessor results and evidence it needs.
Keep planning, design decisions, publication, and integration in the main session.

## Run Workflow

Use Workflow implicitly when an assigned or identified in-scope follow-up agent needs another agent's result.
For independent assessments that Main combines into a final report, use host Agent, including parallel assignments.
Do not invent a follow-up or add display-only phases to justify implicit Workflow selection.
Honor explicit Workflow requests even for one stage when the host supports the tool.
Call native Workflow after defining scope, dependencies, owners, authority, and evidence.

If the native Workflow tool is unavailable, report that it did not run.
For an explicit Workflow request, do not silently substitute Agent or direct execution when Workflow is unavailable.
For an implicit selection, continue with Agent only when it can safely deliver bounded outcomes, and report the Workflow limitation.

## Build The Goal Graph

Gate publication on accepted changes and required checks.
Gate one full independent review on the published PR/MR and its current changes.
Gate fix nodes on confirmed blockers, and send the same PR/MR and changed results to scoped review nodes.
Gate integration on required check evidence, resolved blockers, and registered follow-ups.
Finish the graph with evidence of the target branch update.
Add sync or rebase nodes only when a conflict or changed target invalidates relevant evidence.
Read `references/delivery.md` before building an authorized engineering-delivery graph for its detailed node mapping.

For read-only, research-only, or review-only goals, omit implementation, new publication, and integration nodes.
Pass an existing PR/MR and its current changes to a review node when the goal concerns that artifact.
Do not infer publication or integration authority from an inspection-only goal.

## Verify And Integrate

Treat failed or missing agent results, including `null`, as incomplete rather than successful.
Compare returned evidence with the acceptance criteria and report any missing results or checks.
