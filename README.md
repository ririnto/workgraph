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

Claude Code's native Agent and Workflow lifecycle owns execution state and completion notifications.
The Main Agent owns the plan, integration and publication decisions, and final user report.
It delegates all repository work, including exploration and checks.
By default, use Agent for one bounded outcome and Workflow when connected outcomes justify orchestration.
Honor explicit user surface requests when the host permits them.
Parallel work must be independent and resource-disjoint.

## Skills

- `main-agent-contract`: orchestration contract for the Main Agent.
- `subagent-context`: execution contract for a bounded dispatch node.

Each Skill is self-contained for hook delivery and direct use.
Neither loads its sibling to recover authority, model-selection, completion, or reporting rules.

## Requirements

- Node.js 22.x LTS (Maintenance) or 24.x LTS (Active) for the plugin runtime.
- Node matching `package.json` engines and npm for development, separate from the plugin runtime.
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

See `THIRD_PARTY_NOTICES.md` for design sources and the attributed OpenAI prompt-guidance adaptation.
