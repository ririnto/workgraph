---
name: workflow
description: >-
  Use only as the Claude Code Main Agent for native Workflow execution or design after selecting Workflow under Main's host guidance.
argument-hint: "[goal]"
disable-model-invocation: true
---

# Workgraph workflow

This skill is an entry point for the Claude Code Main Agent only.
Verify the active host and role from session metadata, loaded role guidance, or native tool descriptions before reading its procedure.
If this is not the Claude Code Main Agent, do not load the procedure or its references.
Complete an existing bounded assignment under its own contract, or report the host or role mismatch to the requester.

As the Claude Code Main Agent, use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.
Read [the execution procedure](references/claude-code-main.md) before proceeding, unless its complete content is already loaded.
For repository delivery, that procedure selects the single adaptive `workgraph:delivery` workflow.
