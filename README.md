# Workgraph

Workgraph is a Claude Code plugin for coordinating engineering work.
It delivers shared instructions and one agent role through native hooks.
The runtime uses Node built-ins and needs no npm dependencies.
Workgraph supplies instructions, not a scheduler or permission system.
The host controls task execution, model settings, and completion notifications.

## Install

Use Node.js 22 or 24 for hook execution.
Claude Code must support plugin command hooks and `additionalContext` for SessionStart and SubagentStart.

Add the marketplace and install the plugin.

```sh
claude plugin marketplace add ririnto/workgraph
claude plugin install workgraph@workgraph
```

For development, load the checkout in a new session.

```sh
claude --plugin-dir ./
```

Use `/hooks` to confirm that the SessionStart and SubagentStart handlers are active.
An installed marketplace copy and a development checkout can contain different versions.
Check the loaded plugin before evaluating changed instructions.

## Automatic Instructions

| Event | Recipient | Instructions |
| --- | --- | --- |
| SessionStart | Main session | The hook combines `skills/shared.md` with `skills/main-agent-contract/SKILL.md`. |
| SubagentStart | Dispatched agent | The hook combines `skills/shared.md` with `skills/subagent-context/SKILL.md`. |

SessionStart covers startup, resume, clear, compact, and fork events supported by the host.
Neither hook filters events with a matcher.
Each output contains the shared instructions once and one role body without YAML frontmatter.
Agents need no additional file reads for automatic delivery.
The hooks do not inject repository guidance or research documents.

The main-agent contract assigns planning, design, integration, and final reporting to the main session.
For substantial work, it directs the main agent to assign ready, bounded exploration, research, implementation, and check outcomes through Agent instead of doing them itself.
It directs independent review through Agent when risk or uncertainty justifies it.
An active dispatch does not authorize direct handling of another ready, substantial outcome.
It permits direct work on trivial one-step outcomes or when Agent is unavailable, honors explicit requests to avoid delegation, and follows host tool limits.
The contract sets no fixed agent count.
Workers complete bounded assignments within their authority.
The instructions cover model selection, English agent-to-agent communication, dependency tracking, verification, and native background completion.
The main agent uses Workflow only when the user authorizes orchestration and the host supports it.
Hosts without Workflow can use their available tools.

Read the [shared instructions](skills/shared.md) for rules that apply to both roles.
The role files in the table contain their work procedures.
These instructions guide agents but do not guarantee model adherence.

## User-Only Skills

Invoke a role skill to reload its instructions.

- Use `/workgraph:main-agent-contract` for the main session.
- Use `/workgraph:subagent-context` for a dispatched agent.

Both skills set `disable-model-invocation: true` and `user-invocable: true`.
Claude Code exposes them to users and prevents model invocation or automatic skill preloading.
The hooks operate without skill invocation.

Each skill references the shared instructions and directs the agent to read them if they are absent from context.
If that file is unavailable or empty, report the blocker instead of applying an incomplete contract.
Invocation does not change the session's role or grant permissions.

## Hook Errors

Invalid hook arguments exit with code 2.
Missing, unreadable, or empty instruction files exit with code 1 and produce no context.
Missing or unclosed skill frontmatter and empty skill bodies also exit with code 1.
These failures do not prevent Claude Code from starting a session or subagent.
Inspect the hook error notice if instructions fail to load.

## Development

Use npm and the Node version range in `package.json` for development.
Install the pinned development tools.

```sh
npm ci
```

Follow [AGENTS.md](AGENTS.md) for contributor conventions and validation commands.
It identifies the checks for prose, hook execution, and plugin configuration changes.
Read [the design](docs/design.md) for delivery mechanics, instruction ownership, and test coverage.
Read [the research notes](docs/research.md) for source evidence and its limits.
[Third-party notices](THIRD_PARTY_NOTICES.md) record attribution.
