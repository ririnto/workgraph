---
name: workflow
description: >-
  Claude Code only: use solely as the Claude Code Main Agent, never on other hosts or as a subagent, for read-only design or for native Workflow runs on genuinely multi-phase work or expected follow-up phase expansion, not for single-phase work.
argument-hint: "[goal]"
disable-model-invocation: true
---

# Workgraph Workflow

This skill is an entry point for the Claude Code Main Agent only.
Invocation does not change the active host, role, or authority.
Verify the active host and role from session metadata, loaded role guidance, or native tool descriptions before reading its procedure.
If this is not the Claude Code Main Agent, do not load the procedure or its references.
Dispatched agents do not receive the Workflow tool: Agent-tool subagents and Workflow stages lose it through the host subagent filter.
Forks keep the main pool, so do not dispatch Workgraph nodes as forks when Workflow must stay unavailable.
Complete an existing bounded assignment under its own contract, or report the host or role mismatch to the requester.

As the Claude Code Main Agent, use `$ARGUMENTS` as the requested goal, or use the current user request when the arguments are empty.
Read [the execution procedure](references/claude-code-main.md) before proceeding, unless its complete content is already loaded.
