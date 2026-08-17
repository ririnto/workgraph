# Workgraph

Workgraph is a Claude Code plugin with no runtime package dependencies.
It injects advisory Main Agent and bounded-node context contracts.

## Session Behavior

| Event | Injected context |
| --- | --- |
| `SessionStart: startup` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: clear` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: compact` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: resume` | Unregistered, no additional context |
| `SubagentStart` | Full bounded-node contract from `hooks/subagent-context.md` |

Claude Code's native Agent and Workflow lifecycle owns execution state.
The Main Agent orchestrates and reports the final result; it does not implement tasks.
Dispatch one semantic phase directly with Agent.
Dispatch independent work in parallel.
Use Workflow only for at least two connected semantic phases and a stronger reason.
An explicit Workflow request does not remove this requirement.

## Skills

- `main-agent-contract`: Main Agent contract for advisory orchestration and bounded node dispatch.

`hooks/subagent-context.md` is self-contained injected node context, not a Skill.
Each Skill is self-contained and does not load another Skill.

## Requirements

- Node.js 18 through the current LTS.
- A Claude Code release that supports plugin-bundled synchronous `SessionStart` and `SubagentStart` command hooks with a Node runtime, the native Agent dispatch surface, and the native Workflow surface.

The plugin runtime is zero-package-dependency.
The development toolchain (Node, npm, and the `package.json` tooling) is separate from the plugin runtime.
Contributors need Node 22 for development tooling.
The plugin runtime itself runs on Node.js 18 through the current LTS.
The plugin manifest owns the version: `.claude-plugin/plugin.json`.
The marketplace manifest does not contain a version.

Hook dispatch fails fast when Node is missing, the route is unknown, or the selected contract file is missing, unreadable, or empty.

## Claude Code

Add the marketplace:

```sh
claude plugin marketplace add ririnto/workgraph
```

Install the plugin:

```sh
claude plugin install workgraph@workgraph
```

Validate the local plugin:

```sh
claude plugin validate ./
```

Load the local plugin for one development session:

```sh
claude --plugin-dir ./
```

Use `/hooks` to confirm that the `SessionStart` and `SubagentStart` handlers are active.

## Layout

```text
workgraph/
+-- .claude-plugin/
|   +-- marketplace.json
|   +-- plugin.json
+-- hooks/
|   +-- hooks.json
|   +-- inject-context.mjs
|   +-- subagent-context.md
+-- rules/
|   +-- no-box-drawing.ts
+-- skills/
|   +-- main-agent-contract/
|       +-- SKILL.md
+-- .editorconfig
+-- .gitignore
+-- .markdownlint-cli2.jsonc
+-- AGENTS.md
+-- CLAUDE.md
+-- LICENSE
+-- README.md
+-- THIRD_PARTY_NOTICES.md
+-- oxlint.config.ts
+-- oxfmt.config.ts
+-- package-lock.json
+-- package.json
```

## Design Sources

`THIRD_PARTY_NOTICES.md` is the authoritative attribution inventory.
The design names only Superpowers, Ponytail, and Giver Architecture.
