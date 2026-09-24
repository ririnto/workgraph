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

Use only the nodes and checks that serve the goal.
Reuse existing facts and plans, and skip exploration or planning when they already answer the relevant questions.
Keep the goal, scope, owners, authority, integration branch, and acceptance evidence in main.

Request a goal through the Workflow entry point without prescribing an itinerary.

```text
/workgraph:workflow Fix the parser's escaped-quote bug, publish a PR for review, and integrate it into main.
```

An explicit request to use Workflow in ordinary conversation selects the same tool through the main-agent contract.
Build dependencies from actual results or conditions, not progress-phase labels.
Pass predecessor results to successors, run ready independent outcomes in parallel, and serialize conflicting writes.
Keep planning, design decisions, publication, and integration in main.

For authorized engineering delivery, delegate bounded implementation and checks.
Main inspects changed files and evidence, commits and pushes the working branch, then creates or updates a PR/MR targeting the authorized branch.
Reuse an existing PR/MR for the goal.
Branch and PR/MR publication requests review and does not integrate changes.
Start independent review only after publication, using the PR/MR and its current changes as input.
Use the consumer repository's review method.
Verify review candidates before routing confirmed blockers to bounded fixes on the same branch.
Publish fixes and review affected changes again, while reusing unaffected passing evidence.
Bound review/fix rounds and stop sooner on no progress or a concrete blocker.
Integrate only after required checks pass and confirmed review blockers are resolved.
Respect host and forge protections, then verify the target branch update.
Do not ask again for publication or integration already authorized by the goal.

Read-only, research-only, and review-only goals skip implementation, new branch publication, PR/MR creation, and integration.
Use an existing PR/MR as the input for reviewing that artifact.
Inspection-only requests do not grant publication authority.

In the example goal, a parser-fix node and a separate regression-test node can start in parallel from the known reproduction and agreed behavior.
Their results gate parser checks, passing checks gate branch publication and PR creation, and the published PR's current changes gate independent review.
Confirmed blockers gate same-branch fixes, while resolved blockers and passing checks gate main integration.

Claude Code supports dynamically composed workflows and reusable plugin Workflow scripts.
Workflow availability depends on the host version, plan, and configuration.
The host controls Workflow launch and agent permission prompts.
By default, the host discovers reusable scripts from the plugin-root `workflows/` directory and exposes included scripts under namespaced commands.
Workgraph ships no reusable Workflow scripts.
The user-only `/workgraph:workflow` skill loads the `workflow-authoring` guidance and calls native Workflow with a goal-specific graph.
The skill does not define a fixed itinerary or replace main-session planning, publication, or integration.
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
