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

The main-agent contract keeps planning, design decisions, integration, and final reporting in the main session.
It uses a goal-dependent task graph when dependencies make coordination useful.
Each node names its operation, inputs, outputs, owner, authority, and completion evidence.
Edges represent result dependencies or conditions, not chronology.
The main agent starts ready independent work in parallel when writes do not conflict and serializes conflicting writes.
Exploration, planning, implementation, review, and integration are possible node types, not a required itinerary.
Workers complete bounded assignments within their authority.
Before main integrates delegated changes, it requires relevant repository checks to pass and obtains independent review using that repository's method.
The instructions also cover model routing, evidence reuse, bounded feedback loops, English handoffs, and native completion notifications.
The main agent delegates each ready, bounded, substantial exploration, research, implementation, review, or check outcome through host Agent by default when the user has neither selected Workflow nor explicitly requested no delegation.
An explicit request for Workflow takes precedence over that default, and the main agent calls it when the host supports it without a subjective graph-size, node-count, or overhead test.
Without an explicit Workflow request, task complexity alone does not opt into Workflow.
If explicitly selected Workflow is unavailable, the main agent reports that it did not run and does not silently substitute Agent.
Direct main work is limited to planning, design, integration, final reporting, trivial outcomes when Workflow is not selected, explicit no-delegation requests, or cases where neither delegation tool is usable.
An explicit Workflow request overrides the trivial-outcome shortcut but does not expand the user's authority.
Resolve conflicting explicit execution-tool requests before dispatch.

Read the [shared instructions](skills/shared.md) for rules that apply to both roles.
The role files in the table contain their work procedures.
These instructions guide agents but do not guarantee model adherence.

## Goal-Driven Work

Most tasks need only the nodes and checks that serve their goal.
A typo fix can stay in the main session, while connected work can use a graph of bounded outcomes.

Request a goal through the Workflow entry point without prescribing an itinerary.

```text
/workgraph:workflow Fix the parser failure and integrate the reviewed changes into main.
```

An explicit request to use Workflow in ordinary conversation selects the same tool through the main-agent contract.

A request to implement a goal through main includes authorized, in-scope integration and relevant checks, so the agent must not ask for that approval again.
An inspection-only or review-only request does not authorize edits.
Do not require every goal to include exploration, planning, implementation, review, or integration as separate nodes.

Claude Code supports dynamically composed workflows and reusable plugin Workflow scripts.
Workflow availability depends on the host version, plan, and configuration.
The host controls Workflow launch and agent permission prompts.
By default, the host discovers reusable scripts from the plugin-root `workflows/` directory and exposes included scripts under namespaced commands.
Workgraph ships no reusable Workflow scripts.
The user-only `/workgraph:workflow` skill loads the `workflow-authoring` guidance and calls native Workflow with a goal-specific graph.
The skill does not define a fixed itinerary or replace main-session planning and integration.
Workflow scripts cannot request design input midway through a run, but the host still enforces its agent permissions.
A resumed workflow may reuse saved agent results, which do not prove that source files or check inputs remain unchanged.

## User-Only Skills

Invoke a user-only skill to load its instructions or explicitly select Workflow.

- Use `/workgraph:main-agent-contract` for the main session.
- Use `/workgraph:subagent-context` for a dispatched agent.
- Use `/workgraph:workflow` when explicitly requesting native Workflow for a goal.

All three skills set `disable-model-invocation: true` and `user-invocable: true`.
Claude Code exposes them to users and prevents model invocation or automatic skill preloading.
The hooks operate without skill invocation.

The role-reload skills reference the shared instructions and direct the agent to read them if they are absent from context.
The Workflow skill uses the shared instructions and main-agent contract already delivered by SessionStart.
It loads the host's `workflow-authoring` guidance without rereading Workgraph's contracts.
If a role-reload skill cannot load required shared instructions, report the blocker instead of applying an incomplete contract.
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
