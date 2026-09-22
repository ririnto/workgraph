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

Claude Code's native Agent, Workflow, and background Bash lifecycles own execution state and completion notifications.
The Main Agent owns the plan, integration and publication decisions, and final user report.
It performs small or tightly coupled work directly and delegates when isolation, parallelism, or expertise improves the outcome.
The native `Workflow` tool is available when exposed by the host; use it only within its authorization requirements.
Use Agent for one delegated outcome and Workflow when connected outcomes justify orchestration.
Honor explicit user surface requests when the host permits them.
Parallel work must be independent and resource-disjoint.
Inter-agent prompts, messages, steering, and results use English; user-facing explanations follow the requested language.

For any authorized background tool, continue independent work or end the current turn immediately.
Resume dependent work on the native completion notification, without polling or repeated waiting messages or thinking.
This ends the turn, not the unfinished task, and applies to main agents and dispatched nodes alike.
These contracts provide instructions, not runtime enforcement or a replacement scheduler.

## Graph Engineering

For connected work, represent dependencies in the existing plan instead of inventing a fixed multi-agent process.
Nodes are bounded tasks, tools, checks, or decisions; edges name prerequisites, required results, or routing conditions.
Start only ready nodes, isolate conflicting writes, and pass the context and evidence each successor needs.
Use per-item pipelines and reserve full joins for consumers that require all branch results.
Keep pending work distinct from verified completion, and give feedback loops a progress signal and finite exit conditions.
Preserve valid work when replanning; do not rerun unaffected branches or assume more agents improve results.

Workgraph applies task and coordination graph principles, not a graph database or a graph of private reasoning.
It adds no graph runtime, durable recovery store, or framework dependency.

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
+-- LICENSE
+-- README.md
+-- THIRD_PARTY_NOTICES.md
+-- oxlint.config.ts
+-- oxfmt.config.ts
+-- package-lock.json
+-- package.json
```

## Design Sources

See `THIRD_PARTY_NOTICES.md` for research papers, official design references, and attributed prompt-guidance adaptations.
