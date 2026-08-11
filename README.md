# Workgraph

Workgraph is a dependency-free Claude Code plugin and single-plugin marketplace.
It keeps common session behavior small and loads Graph mechanics only when a task needs them.

## Session Behavior

| Event | Injected context |
| --- | --- |
| `SessionStart: startup` | Full `WORKGRAPH_MAIN_V1` contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: clear` | Full `WORKGRAPH_MAIN_V1` contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: compact` | Main-contract reload check from `hooks/compact-context.md` |
| `SessionStart: resume` | No additional context |
| `SubagentStart` | Full `WORKGRAPH_SUBAGENT_V1` bounded-node contract from `hooks/subagent-context.md` |

The Main Agent performs integration and terminal reporting.
Orchestration owns Graph construction and the rules for dependencies, readiness, concurrency,
resources, edge state, integration, and completion.
Graph records are internal control-plane state and are not routine user output.
Skills are authoritative for runtime mechanics.
Workflow is for connected multi-phase Graphs; single-phase work uses direct nodes.

## Skills

- `main-agent-contract`: Use when a compacted session lacks `WORKGRAPH_MAIN_V1` to restore the Workgraph Main Agent session invariants.
- `orchestration`: Use for every Workgraph node dispatch and for dependency, ownership, concurrency, join, or terminal result synthesis decisions.
- `recovery`: Use when a Workgraph node has interrupted or ambiguous identity, activity, ownership, or terminal state.

Each Skill is self-contained.
A Skill does not load another Skill.

The orchestration Skill has one direct reference:

- `payload-contracts.md`: Load before dispatching a node or accepting its terminal result.

## Requirements

- Node.js 22 or newer.
- A Claude Code release that supports plugin-bundled `SessionStart` and `SubagentStart` command hooks.

The runtime has no third-party package dependencies.
The plugin manifest owns the version: `.claude-plugin/plugin.json`.
The marketplace manifest does not contain a version.

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
Restart Claude Code or run `/reload-plugins` after hook or manifest changes.

## Layout

```text
workgraph/
+-- .claude-plugin/
|   +-- marketplace.json
|   +-- plugin.json
+-- hooks/
|   +-- hooks.json
|   +-- compact-context.md
|   +-- inject-context.mjs
|   +-- subagent-context.md
+-- skills/
|   +-- main-agent-contract/
|   |   +-- SKILL.md
|   +-- orchestration/
|   |   +-- SKILL.md
|   |   +-- references/
|   |       +-- payload-contracts.md
|   +-- recovery/
|       +-- SKILL.md
+-- AGENTS.md
+-- CLAUDE.md
+-- LICENSE
+-- README.md
+-- THIRD_PARTY_NOTICES.md
```

## Design Sources

The design is an original synthesis of the Agent Skills specification, Claude Code plugin guidance, and the supplied Claude Opus 5 and GPT-5.6 prompting guides.
Pinned upstream versions are recorded in `THIRD_PARTY_NOTICES.md`.
