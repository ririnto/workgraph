# Workgraph in Codex

## Install and load

Use Node.js 26.13.0 or later within major version 26 for hook execution.
Install or enable the repository through a Codex host that supports native plugin lifecycle hooks.
Use that host's normal plugin activation and trust controls.

Codex selects `.codex-plugin/plugin.json`, which declares `hooks/codex-hooks.json` and the shared skills directory.
The hook commands use `PLUGIN_ROOT` and set `additionalContextLimit: 0` to keep complete context inline.
The inspected Codex source supports this configuration, while activation in the installed desktop host remains unverified.
This adapter therefore supplies no unverified universal installation command.

## Automatic loading

SessionStart loads [Main Agent mode](../../skills/main-agent-contract/SKILL.md) with its [Codex reference](../../skills/main-agent-contract/references/codex.md).
SubagentStart loads the [Worker contract](../../skills/subagent-context/SKILL.md) with its [Codex reference](../../skills/subagent-context/references/codex.md).
Both references own execution timing.
The Main reference also provides host-specific orchestration and model selection guidance.
This user adapter does not replace them.

The hook's native `<skill>` fragment includes the qualified name, source path, and complete skill file with YAML frontmatter.
Reference fragments preserve raw file text.
Source labels identify complete content already loaded, so agents need no startup retrieval for those files.
The [delivery design](../design.md#deliver-context) describes message-envelope differences and failure behavior.

The [Bash polling guard](../../README.md#bash-polling-guard) uses Codex's Bash PreToolUse interface, including unified execution commands.
Native activation requires a host with local command hooks enabled.

Codex uses its native delegation tools under the Main host reference.
Claude Code's native Workflow is unavailable in Codex.

## Manual invocation

Use dollar-prefixed, plugin-qualified skill names in hosts supporting this invocation form.
The public mode entry remains `$workgraph:main-agent-contract`.

```text
$workgraph:main-agent-contract Fix the parser's escaped-quote bug and verify the original trigger within the authorized scope.
```

| Invocation | Purpose |
| --- | --- |
| `$workgraph:main-agent-contract` | Load Main Agent mode in the main session. |
| `$workgraph:subagent-context` | Load the Worker role for an existing bounded dispatch. |
| `$workgraph:delivery` | Load Main's repository delivery procedure. |
| `$workgraph:development` | Select the matching development playbook and language references. |
| `$workgraph:principle-preserve-behavior` | Load guidance for behavior-preserving transformations. |
| `$workgraph:principle-production-interfaces` | Load guidance for production interfaces, abstractions, and test design. |
| `$workgraph:writing` | Load prose and Markdown guidance. |
| `$workgraph:instruction-authoring` | Load agent-facing instruction design guidance. |
| `$workgraph:verification` | Load runtime reproduction and evidence guidance. |
| `$workgraph:memory-maintenance` | Load authorized durable memory maintenance guidance. |
| `$workgraph:codex-scoped-cleanup` | Load scoped Codex resource retirement and attachment guidance. |

Manual role invocation reads its Codex reference unless that complete content is already present.
Invoking a skill does not create a dispatch, change the session's role, or grant permissions.
The [skill map](../../README.md#skill-invocation) identifies each procedure's owner and trigger.
The Workflow skill reports unavailability and stops when invoked in Codex.

## Updates

Use the host's plugin update controls and start a new session after updating.
Confirm the selected descriptor version and loaded source paths before evaluating changed instructions.
Both host descriptors must retain the matching release number defined by [Version Updates](../../README.md#version-updates).

## Evidence limits

The [verification map](../verification-map.md) distinguishes source delivery, installed activation, interactive invocation, and model behavior.
Passing hook tests does not establish installed desktop activation or model adherence.
A full-history fork can retain Main context before receiving Worker-only hook output.
Requested model settings do not prove resolved settings unless the host reports them.

Return to the [Workgraph guide](../../README.md) for task routing, development setup, and release instructions.
