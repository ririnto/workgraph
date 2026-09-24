# Workgraph

Workgraph is a Claude Code plugin for coordinating engineering work.
It delivers one agent role's complete instructions through native hooks.
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
| SessionStart | Main session | The hook injects the `skills/main-agent-contract/SKILL.md` body without frontmatter. |
| SubagentStart | Dispatched agent | The hook injects the `skills/subagent-context/SKILL.md` body without frontmatter. |

SessionStart covers startup, resume, clear, compact, and fork events supported by the host.
Neither hook filters events with a matcher.
Each output contains exactly one self-contained role body without YAML frontmatter.
Agents need no additional file reads for automatic delivery.
The hooks do not inject repository guidance or research documents.

The main-agent contract keeps planning, design decisions, publication, integration, and final reporting in the main session.
It uses a goal-dependent task graph when dependencies make coordination useful.
Each node names its operation, inputs, outputs, owner, authority, and completion evidence.
Edges represent result dependencies or conditions, not chronology.
The main agent starts ready independent work in parallel when writes do not conflict and serializes conflicting writes.
Exploration, planning, implementation, review, and integration are possible node types, not a required itinerary.
Workers complete bounded assignments within their authority.
For authorized delivery, the main agent publishes a working branch and PR/MR before one full independent review, then integrates after required checks and confirmed blockers are resolved.
The instructions also cover evidence reuse, bounded feedback loops, English handoffs, and native completion notifications.
The main agent selects native Workflow for authorized multi-stage work with result dependencies or conditional successors, even without a tool-specific request.
It uses host Agent for a single substantive stage, including independent parallel assignments.
It does not add display-only phases to justify Workflow.
An explicit Workflow request selects native Workflow whenever the host supports it, even for one stage.
If explicitly selected Workflow is unavailable, report that it did not run and do not silently substitute Agent.
For an implicit Workflow selection, report unavailability and use Agent only when it can safely deliver bounded outcomes.
Direct main work is limited to planning, design, publication, integration, final reporting, trivial outcomes when Workflow is not selected, explicit no-delegation requests, or cases where neither delegation tool is usable.
An explicit Workflow request overrides the trivial-outcome shortcut but does not expand the user's authority.
Resolve conflicting explicit execution-tool requests before dispatch.

Each role file in the table carries the common rules and that role's procedures in one self-contained body.
These instructions guide agents but do not guarantee model adherence.

## Goal-Driven Work

Use only the nodes and checks that serve the goal.
Reuse existing facts and plans, and skip exploration or planning when they already answer the relevant questions.
Keep the goal, scope, owners, authority, working branch, target branch, and acceptance evidence in main.

Request a goal through the Workflow entry point without prescribing an itinerary.

```text
/workgraph:workflow Fix the parser's escaped-quote bug, publish a PR for review, and integrate it into main.
```

An explicit Workflow request selects the native tool, and the main-agent contract also selects it for useful multi-stage dependencies.
Build dependencies from actual results or conditions, not progress-phase labels.
Pass predecessor results to successors, run ready independent outcomes in parallel, and serialize conflicting writes.
Keep planning, design decisions, publication, and integration in main.

For broad goals, split work into cohesive, independently verifiable, main-targeted delivery units with clear acceptance evidence and one accountable owner.
Keep tightly coupled work together when splitting it would prevent independent verification or mergeability.
Avoid tiny phases and stacked PRs that require repeated rebases.
Publish, review, and integrate each ready unit promptly instead of accumulating an oversized PR.

Before committing or publishing task changes, record the working branch and authorized target branch.
If they match, create a separate working branch from the target first.
Push only the working branch for PR delivery, and never push task changes directly to the target before PR review.
Use named branch references and the current PR diff, not fixed commit hashes.

For authorized delivery, delegate bounded implementation and checks.
Main inspects changed files and evidence, commits and pushes the working branch, then creates or updates a PR/MR targeting the authorized branch.
Reuse an existing PR/MR for the unit.
Treat publication as a review handoff, not as main integration.
Run one full independent review after publication, using the PR/MR and its current changes as input.
Use the consumer repository's review method.
Verify candidates against requirements, source, and checks, then classify confirmed findings.
Fix confirmed blockers before integration when they affect acceptance, required behavior, correctness, safety, or required checks.
Only confirmed blockers require code changes before integration.
After a blocker fix, update the same PR/MR and ask the same reviewer to re-review only affected changes.
Reuse unaffected passing checks.

Defer a nonblocking finding only when it is noncritical, does not affect required behavior, acceptance, correctness, or safety, and required checks pass.
Before integration, register each deferred bounded follow-up in the authorized long-term issue tracker with evidence, scope, acceptance criteria, a named owner, and a next action.
Reuse or update an existing tracker item when possible.
Defer follow-up implementation until after the target branch is updated.
If tracker access is not authorized or available, do not integrate with an untracked deferral.

Avoid repeated target syncs or rebases unless a conflict or invalidated evidence requires one.
Bound blocker-fix and scoped re-review rounds, and stop sooner on no progress or a concrete blocker.
Respect host and forge protections, then verify the target branch update.
Treat that verified update as the delivery finish condition, not PR creation.
Do not ask again for publication or integration already authorized by the goal.

Read-only, research-only, and review-only goals skip implementation, new branch publication, PR/MR creation, and integration.
Use an existing PR/MR as input when reviewing that artifact.
Inspection-only requests do not grant publication authority.

In the example goal, a parser-fix node and a separate regression-test node can start in parallel from the known reproduction and agreed behavior.
Their results gate parser checks, passing checks gate publication from a working branch to a PR/MR, and the published PR gates one full review.
Confirmed blockers gate same-branch fixes and scoped re-review, while passing checks and tracked deferrals gate main integration.

Claude Code supports dynamically composed workflows and reusable plugin Workflow scripts.
Workflow availability depends on the host version, plan, and configuration.
The host requires user opt-in to multi-agent orchestration before Workflow can run.
After that opt-in, Main can select Workflow without a separate tool-specific request.
The host controls Workflow launch and agent permission prompts.
By default, the host discovers reusable scripts from the plugin-root `workflows/` directory and exposes included scripts under namespaced commands.
Workgraph ships no reusable Workflow scripts.
The user-invocable `/workgraph:workflow` skill loads `workflow-authoring` guidance and calls native Workflow with a goal-specific graph.
Its description targets explicit Workflow requests and dependent multi-stage goals without routing implicit single-stage work.
It does not define a fixed itinerary or replace main-session planning, publication, or integration.
Workflow scripts cannot request design input midway through a run, but the host still enforces its agent permissions.
For dependent follow-up work, append a substantive phase to the saved script and resume with its `scriptPath` and prior `resumeFromRunId`.
Keep valid earlier agent prompts and options unchanged to reuse completed results.
Editing an earlier prompt reruns that call and subsequent calls.
Revalidate source files and check inputs before relying on cached results.

## Skill Invocation

Use the role skills to reload their instructions when needed.
Invoke Workflow when the user asks for it or substantive dependent stages make it the better execution path.

- Use `/workgraph:main-agent-contract` for the main session.
- Use `/workgraph:subagent-context` for a dispatched agent.
- Use `/workgraph:workflow` when explicitly requesting native Workflow for a goal.

The role-reload skills set `disable-model-invocation: true` and `user-invocable: true`.
The Workflow skill keeps `user-invocable: true` and remains model-invocable for explicit Workflow requests and multi-stage dependent work.
Its description avoids routing implicit single-stage tasks to Workflow.
The hooks operate without skill invocation.

Each skill body is self-contained, so manual invocation needs no additional file retrieval.
The Workflow skill carries the common rules with its own procedures and loads only the host's `workflow-authoring` guidance.
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
