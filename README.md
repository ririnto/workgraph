# Workgraph

Workgraph is a dependency-free Claude Code plugin that injects advisory Main Agent and bounded node context contracts.

## Session Behavior

| Event | Injected context |
| --- | --- |
| `SessionStart: startup` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: clear` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: compact` | Full Main Agent contract from `skills/main-agent-contract/SKILL.md` |
| `SessionStart: resume` | Unregistered; no additional context |
| `SubagentStart` | Full bounded-node contract from `hooks/subagent-context.md` |

Native Claude Code Agent/Workflow lifecycle owns execution state.
The Main Agent is the orchestrator and terminal reporter, not an implementation worker.
One semantic phase uses direct Agent dispatch; independent work can dispatch in parallel.
Workflow requires at least two connected semantic phases plus a stronger reason, and an explicit request does not override that floor.

## Skills

- `main-agent-contract`: Main Agent contract for advisory orchestration and bounded node dispatch.

`hooks/subagent-context.md` is self-contained injected node context, not a Skill.
Each Skill is self-contained and does not load another Skill.

## Requirements

- POSIX sh.
- A Claude Code release that supports plugin-bundled synchronous `SessionStart` and `SubagentStart` command hooks with a POSIX sh runtime, the native Agent dispatch surface, and the native Workflow surface.

The runtime has no third-party package dependencies.
The plugin manifest owns the version: `.claude-plugin/plugin.json`.
The marketplace manifest does not contain a version.

Hook dispatch fails fast when POSIX sh is missing, the route is unknown, or the selected contract file is missing, unreadable, or empty.

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
|   +-- inject-context
|   +-- subagent-context.md
+-- skills/
|   +-- main-agent-contract/
|       +-- SKILL.md
+-- AGENTS.md
+-- CLAUDE.md
+-- LICENSE
+-- README.md
+-- THIRD_PARTY_NOTICES.md
```

## Design Sources

`THIRD_PARTY_NOTICES.md` is the authoritative attribution inventory.
The design names only Superpowers, Ponytail, and Giver Architecture.
