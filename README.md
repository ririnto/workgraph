# Workgraph

Workgraph is a Claude Code plugin for coordinating engineering work.
It injects shared behavior and role-specific instructions through native hooks.
The hook runtime uses Node built-ins and needs no npm dependencies.

## Install

Add the marketplace and install the plugin:

```sh
claude plugin marketplace add ririnto/workgraph
claude plugin install workgraph@workgraph
```

For development, load the checkout in a new session:

```sh
claude --plugin-dir ./
```

Use `/hooks` to confirm that the SessionStart and SubagentStart handlers are active.
An installed marketplace copy and a development checkout can contain different versions.
Check the loaded plugin before evaluating changed instructions.

## Instruction Boundaries

Contributors follow `AGENTS.md` when changing this repository.
It contains writing conventions, implementation constraints, and validation commands.
The plugin does not inject that file into another repository's session.

Consumer sessions receive instructions from `hooks/context/`.
The injector combines the shared rules with the current role.
Users can reload either role through a user-only skill.

| Event | Injected files | Recipient |
| --- | --- | --- |
| SessionStart | `common.md` and `main.md` | Main session |
| SubagentStart | `common.md` and `worker.md` | Dispatched agent |

SessionStart covers startup, resume, clear, compact, and fork events supported by the host.
The configuration uses no matcher filter for either hook.
Each output includes the common rules once and one role.
The injector reads neither repository guidance nor research documents.

## User-Only Skills

Invoke a role skill when you want to reload its instructions:

- Use `/workgraph:main-agent-contract` for the main session.
- Use `/workgraph:subagent-context` for a bounded dispatch node.

Both skills retain their role names and set `disable-model-invocation: true` with `user-invocable: true`.
Claude Code exposes them to users and prevents model invocation or automatic skill preloading.
The automatic hooks remain active without invoking either skill.

Each skill directs the agent to read `common.md` and its role file through `${CLAUDE_PLUGIN_ROOT}` references.
These are the same files that the hooks inject, so maintainers update each rule in one place.
Explicit invocation does not change a session's role or grant permissions.
Skill links require file reads, so report unavailable files instead of applying an incomplete contract.

## Session Behavior

The main agent owns the plan, integration decisions, and final report.
It handles small or tightly coupled work and delegates independent tasks when coordination adds value.
It honors requests to work without delegation.
A worker completes the assigned task within its resource and permission limits.

Agents honor the user's model choice within host limits.
They name `haiku` by default and choose `sonnet` for work beyond its capability.
They use `opus` only after a `sonnet` attempt fails because of capability limits.
Other models, including `fable`, require user authorization for the task.
A fork inherits its parent model, so agents use it only when that model satisfies the routing requirement.
These instructions guide dispatch choices without changing host model settings.

Agent-to-agent communication uses English, including dispatches, corrections, handoffs, and results.
User-facing explanations and deliverables follow the requested language.
The instructions call for complete sentences and sentence-level source line breaks in Markdown prose.

The native Workflow tool is available in hosts that expose it.
The main agent uses it when the user authorizes orchestration and connected tasks justify it.
Workgraph follows the tool's opt-in requirements.
A host without Workflow can still load the plugin and run tasks through its available tools.

For background Agent, Workflow, Bash, and other asynchronous tools, agents continue independent work while results are pending.
They end the current turn once no independent work remains and resume on the native completion notification.
They leave the task open without repeated waiting messages, thinking, polling, or sleep calls.
They use completion results and acceptance checks before reporting success.

For connected tasks, agents track prerequisites, resource ownership, and acceptance evidence in the existing plan.
They parallelize ready work, serialize conflicting writes, and limit retries through explicit progress and exit conditions.
The host owns execution state and completion delivery.
Workgraph supplies instructions and does not enforce model adherence or provide a scheduler.

## Requirements And Errors

Use Node.js 22 or 24 for hook execution.
Development uses npm and the Node version range in `package.json`.
Claude Code must support plugin command hooks and `additionalContext` for SessionStart and SubagentStart.

The injector accepts one event name, either `SessionStart` or `SubagentStart`.
It resolves context files from its own location and emits one JSON object on success.
Invalid arguments exit with code 2.
Missing, unreadable, or empty context files exit with code 1 and produce no context.
These hook failures do not prevent Claude Code from starting a session or subagent.
Inspect the hook error notice if instructions fail to load.

## Development

Install the pinned development tools:

```sh
npm ci
```

Run the repository checks and validate the plugin directory and manifest:

```sh
npm run check
claude plugin validate ./
claude plugin validate .claude-plugin/plugin.json
```

The check command runs Markdown lint, ultracite, and Node hook tests.
The tests cover context composition, role separation, portable paths, error handling, and user-only skill metadata and references.
They verify delivery rather than model behavior.
The only version source is `.claude-plugin/plugin.json`.

## Design And Sources

Read [the design](docs/design.md) for file ownership and hook behavior.
Read [the research notes](docs/research.md) for the evidence behind instruction choices and its limits.
[Third-party notices](THIRD_PARTY_NOTICES.md) retain attribution for source projects and writing guidance.
