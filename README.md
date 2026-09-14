# Workgraph

Workgraph is a zero-package-dependency Claude Code plugin.
It injects advisory Main Agent and bounded-node context contracts.
`.claude-plugin/plugin.json` is the version owner.

## Session Behavior

| Event | Injected context |
| --- | --- |
| `SessionStart: startup` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: clear` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: compact` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: resume` | Unregistered, no additional context |
| `SubagentStart` | Full bounded-node contract from `skills/subagent-context/SKILL.md` |

Claude Code's native Agent and Workflow lifecycle owns execution state.
The Main Agent orchestrates and reports the final result.
It does not implement tasks.
Dispatch one semantic phase directly with Agent.
Dispatch independent work in parallel.
Use Workflow only for at least two connected semantic phases and a stronger reason.
An explicit Workflow request does not remove this requirement.

## Skills

- `main-agent-contract`: Main Agent contract for advisory orchestration and bounded node dispatch.
- `subagent-context`: bounded-node contract for outcome, authority, data flow, communication, tool boundary, and result reporting.

Each Skill is self-contained and does not load another Skill.

## Requirements

- Node.js 18 through the current LTS for the plugin runtime.
- Node 22 for the development toolchain (Node, npm, and the `package.json` tooling), which is separate from the plugin runtime.
- A Claude Code release that supports plugin-bundled synchronous `SessionStart` and `SubagentStart` command hooks with a Node runtime, the native Agent dispatch surface, and the native Workflow surface.

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
+-- rules/
|   +-- no-box-drawing.ts
+-- skills/
|   +-- main-agent-contract/
|   |   +-- SKILL.md
|   +-- subagent-context/
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
