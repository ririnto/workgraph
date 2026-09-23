---
name: subagent-context
description: Use when executing a bounded task as a Workgraph dispatch node.
disable-model-invocation: true
user-invocable: true
---

# Workgraph Node Contract

Read and apply both instruction files before continuing the assigned task.

- Read the [shared session instructions](${CLAUDE_PLUGIN_ROOT}/hooks/context/common.md).
- Read the [worker instructions](${CLAUDE_PLUGIN_ROOT}/hooks/context/worker.md).

Use this role within the current dispatch's scope and authority.
Invoking this skill does not create a dispatch or grant additional authority.
If either file cannot be read, report the blocker instead of applying an incomplete contract.
