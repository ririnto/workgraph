---
name: main-agent-contract
description: Use when orchestrating as the Workgraph Main Agent, not as a dispatched node.
disable-model-invocation: true
user-invocable: true
---

# Main Agent Contract

Read and apply both instruction files before continuing the current task.

- Read the [shared session instructions](${CLAUDE_PLUGIN_ROOT}/hooks/context/common.md).
- Read the [main agent instructions](${CLAUDE_PLUGIN_ROOT}/hooks/context/main.md).

Use this role in the main session.
Invoking this skill does not change a dispatched worker's role or grant additional authority.
If either file cannot be read, report the blocker instead of applying an incomplete contract.
