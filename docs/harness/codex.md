# Workgraph in ChatGPT and Codex

## Install from the marketplace

Register the GitHub marketplace with Codex CLI:

```sh
codex plugin marketplace add ririnto/workgraph
codex plugin marketplace list
```

Open `/plugins` in Codex CLI, select the `workgraph` marketplace, and install `workgraph`.
In the ChatGPT desktop app, open Plugins and choose the same marketplace.
Start a new session after installation.

For local development, run `codex plugin marketplace add .` from the Workgraph checkout.
The repository catalog is `.agents/plugins/marketplace.json`.
Its source path selects the complete plugin at the repository root.

Workspace administrators can import a GitHub marketplace through their workspace plugin controls.
See the official [plugin guide](https://learn.chatgpt.com/docs/plugins) for supported surfaces and workspace installation.

## Choose a loading mode

| Surface | Workgraph loading |
| --- | --- |
| Local Codex or local-only Work with plugin hooks enabled and trusted | SessionStart loads Main, and SubagentStart loads Worker. |
| Cloud orchestration, including threads whose tools execute locally | Invoke the role skill explicitly at the start of its task. |
| Other supported skill clients | Use the client's skill picker or name the required Workgraph skill. |

The portable `plugin.json` discovers the shared `skills/` directory.
Its `extensions.com.openai.hooks` field selects `hooks/codex-hooks.json`.
OpenAI's [packaging guide](https://developers.openai.com/plugins/build/plugins) defines this manifest and the separate hook support requirements.

Hook execution requires Node.js 26.13.0 or later within major version 26.
The commands use `PLUGIN_ROOT` and keep complete context inline through `additionalContextLimit: 0`.
Their native skill fragments include source paths and complete skill files with frontmatter.

Main receives its [Codex reference](../../skills/main-agent-contract/references/codex.md).
Worker receives its [Codex reference](../../skills/subagent-context/references/codex.md).
Those references own host-specific execution and delegation.
The [Bash polling guard](../../README.md#bash-polling-guard) applies where the host runs its registered PreToolUse hook.

## Confirm hook activation

In a supported local Codex session, open `/hooks` and check the Workgraph source.
It should list SessionStart, SubagentStart, and Bash PreToolUse.
Review and trust the current definitions through the host controls before relying on them.
Installation alone does not grant hook trust, and changed definitions can require another review.
The [OpenAI hooks reference](https://learn.chatgpt.com/docs/hooks) describes trust, disabled hooks, managed policy, and cloud restrictions.

Check the installed plugin version and source when the listing differs from this checkout.
Start a fresh supported session and inspect hook results for failures or timeouts.
A discovered handler proves registration, while a successful event result establishes execution for that event.
Use the manual role entry below when the host cannot run local plugin hooks or its policy excludes them.

## Start a task

In Codex clients supporting dollar-prefixed skill invocation:

```text
$workgraph:main-agent-contract Fix the parser's escaped-quote bug and verify the original trigger.
```

In ChatGPT, select Workgraph from the `@` menu and ask it to use Main Agent Contract for the task.
An existing bounded worker assignment uses [Subagent Context](../../skills/subagent-context/SKILL.md).
Role invocation applies the role's instructions within the current host's tools and permissions.

For a focused task, select [Development](../../skills/development/SKILL.md) or [Writing](../../skills/writing/SKILL.md) directly.
The [skill map](../../README.md#skill-invocation) lists the remaining procedures and their triggers.

## Update

Refresh the registered marketplace:

```sh
codex plugin marketplace upgrade workgraph
```

Use the plugin browser to refresh the installed Workgraph copy, then start a new session.
Check the installed version against [version updates](../../README.md#version-updates) when diagnosing stale instructions.
The [verification map](../verification-map.md) describes package, hook, and behavior checks.
