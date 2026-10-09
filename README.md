# Workgraph

Workgraph supplies engineering coordination, writing, and development skills with hooks for Claude Code and Codex.
It delivers the selected agent role and host-specific orchestration and model guidance through native hooks.

The runtime uses Node built-ins and needs no npm dependencies.
Workgraph supplies instructions, not a scheduler or permission system.
The host controls task execution, model settings, and completion notifications.

## Install

Use Node.js 18 or later for hook execution.
Claude Code must support plugin command hooks and `additionalContext` for SessionStart and SubagentStart.

For Claude Code, add the marketplace and install the plugin.

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

For Codex, install or enable the repository through a host that supports native plugin lifecycle hooks.
Codex selects `.codex-plugin/plugin.json`, which declares `hooks/codex-hooks.json` and the shared skills directory.
The Codex handlers use `PLUGIN_ROOT` and disable context spill with `additionalContextLimit: 0`.
Use the host's normal plugin activation and trust controls.
The inspected Codex source supports this configuration, while activation in the installed desktop host remains unverified.

Both host descriptors declare the same release version.
Each host reads its own descriptor, so neither version declaration replaces the other.
Follow [Version Updates](#version-updates) when publishing changes.

## Automatic Instructions

| Event | Recipient | Instructions |
| --- | --- | --- |
| SessionStart | Main session | The hook injects the Main role and its matching host reference, with their actual source paths. |
| SubagentStart | Dispatched agent | The hook injects the Worker role and its matching execution reference, with their actual source paths. |

SessionStart covers startup, resume, clear, compact, and fork events supported by the host.
Neither hook filters events with a matcher.
Each output identifies the selected skill source and states which complete content is already loaded.
Each hook names the execution host so agents can distinguish it from the selected model family.
Each role receives its selected host reference with its source path.
Worker references contain execution timing without Main orchestration or model guidance.

Claude Code receives the native Skill text with its base directory and frontmatter-stripped body, preserving trailing whitespace.
Claude body delivery removes leading whitespace to match native Skill loading.
Codex receives the native `<skill>` text with its qualified name, source path, and complete file, including YAML frontmatter.
Claude references use native Read line numbering, while Codex references preserve raw file text.

Separate metadata identifies complete content already loaded by the hook.
These text fragments match native loading, but the host still delivers them through its hook message envelope.
Agents need no additional file reads for the injected role and host guidance.

For repository changes or delivery, Main reads the conditional [Delivery skill](skills/delivery/SKILL.md) before starting changes.
Claude hook contexts stay within its 10,000-character inline limit, including tested path and line-ending variations.
The hooks do not inject repository guidance or research documents.

The main-agent contract keeps planning, design decisions, publication, integration, and final reporting in the main session.
It uses a goal-dependent task graph when dependencies make coordination useful.
Each node names its operation, inputs, outputs, owner, authority, and completion evidence.
Edges represent result dependencies or conditions, not chronology.
The main agent starts ready independent work in parallel when writes do not conflict and serializes conflicting writes.
Exploration, planning, implementation, review, and integration are possible node types, not a required itinerary.
Workers complete bounded assignments within their authority.

For maintainers, Main requests independent review after PR/MR creation.
For other contributors, Main requests that review before PR/MR creation.
Main integrates after required checks pass and confirmed blockers are resolved.
The instructions also cover evidence freshness, bounded feedback, English handoffs, and ownership-safe cleanup.
The host supplies tool usage, model controls, and background execution mechanics.

In Claude Code, the main agent selects native Workflow when a delegated agent depends on another agent's result or outcome.
One stage qualifies when its result may trigger an identified in-scope follow-up agent.
Claude Main uses host Agent for independent assessments that it combines in its own final report.
A possible future task alone does not qualify.
An explicit Workflow request selects native Workflow even for one stage because user instructions override these routing defaults.
Main does not add display-only phases to justify implicit Workflow selection.
If explicitly selected Workflow is unavailable, Main reports the failure without silently substituting Agent.
For an implicit Workflow selection, Main reports unavailability and uses Agent only when it can safely deliver bounded outcomes.
These Workflow selection rules apply to Claude Code.

Codex uses its available native delegation tools for independent and dependent assignments.
Codex Main coordinates dependencies and passes verified predecessor results to successors.
Codex does not provide Claude Code's native Workflow tool.
For an explicit Workflow request in Codex, Main reports that it did not run and preserves the requested tool choice.

Direct main work covers planning, design, publication, integration, final reporting, trivial outcomes without an explicit delegation-tool choice, explicit no-delegation requests, or unavailable delegation tools.
Resolve conflicting explicit execution-tool requests before dispatch.

Each role file in the table carries the common rules and that role's procedures in one self-contained body.
These instructions guide agents but do not guarantee model adherence.

Main's [Codex reference](skills/main-agent-contract/references/codex.md) covers Luna, Sol, and Astra.
Codex assigns clear tasks to Luna, including multistep work, with Sol for stronger judgment.
Luna uses xhigh for coding, max for harder coding tasks, and low for simple exploration or extraction.
Its [Claude Code reference](skills/main-agent-contract/references/claude.md) covers Haiku, Sonnet, Opus, and Fable.
Both references order families from routine work to more complex work and assign effort by model and workload.
Astra and Fable require the user's explicit request.

Assignments record requested settings and report resolved settings only when the host supplies them.
Each Main hook loads only its host's execution, orchestration, and model guidance.
Worker hooks load their own execution references without Main orchestration or model policy.
Forked workers can inherit Main's host guidance through parent history.
The references supply task defaults and escalation conditions without requiring session-level model comparisons or benchmark evaluations.
Detailed model support, benchmarks, and workload reports remain in [maintainer research](docs/research.md#model-effort-and-cost).

## Goal-Driven Work

Use only the nodes and checks that serve the goal.
Reuse existing facts and plans, and skip exploration or planning when they already answer the relevant questions.
Keep the goal, scope, owners, authority, working branch, base branch, and acceptance evidence in Main.

In Claude Code, request a goal through the Workflow entry point without prescribing an itinerary.

```text
/workgraph:workflow Fix the parser's escaped-quote bug, publish a PR for review, and integrate it into the base branch.
```

Build dependencies from actual results or conditions, not progress-phase labels.
Pass predecessor results to successors, run ready independent outcomes in parallel, and serialize conflicting writes.
Keep planning, design decisions, publication, and integration in Main.

The [Delivery skill](skills/delivery/SKILL.md) defines branch selection, publication, review, deferral, integration, and branch cleanup.
Main uses the user's specified base branch, otherwise retains the recorded base or uses the current branch.
Without a base, Main confirms the active development branch before starting changes.
Main records the base before creating a working branch and retains it through delivery.

Before each branch push, an exploration agent scans the diff for exposed user environment details.
Main resolves any exposure before pushing.
Main requests one full independent review after PR/MR creation for maintainers, and before creation for other contributors.
Main fixes confirmed blockers and records permitted deferrals before integrating into the authorized base.

Selecting a base branch does not grant publication, integration, or cleanup authority.
Read-only goals retain their inspection scope.

Main records concise validation summaries in authorized PR/MR descriptions or comments.
Local evidence stays temporary and excludes dependency trees, build caches, and redundant logs.
Main and Worker delete task-owned evidence after recording required results when no active work or retention requirement needs it.
They retain evidence needed for active checks, unresolved failures, recovery, or explicit retention requirements.
They confirm cleanup ownership before deleting shared evidence.
Before handback, both roles inspect owned background processes and descendants, stop unused processes, and verify termination.

The [host Workflow documentation](https://code.claude.com/docs/en/workflows) defines availability, permissions, script discovery, and continuation.
Workgraph ships no reusable Workflow scripts.
The `/workgraph:workflow` skill selects Claude Code's native Workflow for explicit requests or suitable dependency graphs.
Its description targets dependent stages and identified follow-up stages without imposing an itinerary.
Workers complete relayed bounded assignments without starting another Workflow.

Main validates relevant behavior, inputs, configuration, and toolchain before relying on replayed results.
Main and Worker compare named references and task-relevant changes without pinning file or branch hashes.
Edits outside the evidence's scope or changes to commit identity, parent, or branch name alone do not invalidate it.

## Skill Invocation

Use the role skills to reload their instructions when needed.
In Claude Code, invoke Workflow for user requests, dependent stages, or an identified in-scope follow-up.

Claude Code uses slash commands, while Codex uses dollar-prefixed skill names.

| Claude Code | Codex | Purpose |
| --- | --- | --- |
| `/workgraph:main-agent-contract` | `$workgraph:main-agent-contract` | Load the main session's role. |
| `/workgraph:subagent-context` | `$workgraph:subagent-context` | Load a dispatched agent's role. |
| `/workgraph:delivery` | `$workgraph:delivery` | Load repository delivery procedures in Main. |
| `/workgraph:workflow` | Unavailable | Request native Workflow in Claude Code. |
| `/workgraph:writing` | `$workgraph:writing` | Load prose and Markdown guidance. |
| `/workgraph:instruction-authoring` | `$workgraph:instruction-authoring` | Load reusable instruction design guidance. |
| `/workgraph:development` | `$workgraph:development` | Load coding guidance and matching language references. |
| Not applicable | `$workgraph:codex-scoped-cleanup` | Clean retired Codex resources and stale Worktree Artifact connections. |

All skills remain user-invocable and model-invocable.
Invocation does not change the current session's role or dispatch authority.
The hooks operate without skill invocation.

Automatic delivery includes each role's required environment reference.
Hooks do not inject conditional task skills.
Main resolves Delivery from its loaded role source directory.
Main and Worker resolve Writing, Instruction Authoring, and Development from their own loaded role directories.
Read each conditional skill only when its task scope matches and its complete content is not already loaded.
Workgraph has no dependency on another plugin's skills or installation.

Codex Main and Worker references conditionally load [Codex Scoped Cleanup](skills/codex-scoped-cleanup/SKILL.md) before retiring its covered resources.
The cleanup procedure and native attachment reference stay bundled rather than requiring a separate user-level skill.
Cleanup compares individual session and worktree activity and preserves required changes through retained Git references.
It separates physical retirement from Worktree Artifact removal and preserves active work and unique content outside Git.
Claude hooks do not load this procedure, and invoking it in Claude does not authorize Codex cleanup.

Manual Main loading reads the active host's reference before dispatch unless the hook already supplied its complete content.
Manual Worker loading reads its active host reference unless the hook already supplied its complete content.
The dispatch supplies any authorized subdelegation settings.

The Workflow skill reports unavailability and stops when invoked in Codex.
The Workflow skill keeps its core rules inline.
For authorized engineering delivery, it also reads its focused `references/delivery.md` before building the delivery graph.
Read-only Workflow goals do not need that reference.
The plugin includes no output assets or bundled helper scripts because its skills produce neither reusable files nor repeated script logic.

Workgraph bundles coordination, delivery, writing, instruction authoring, and development guidance in one plugin.
Writing owns prose and Markdown rules, while Instruction Authoring loads Writing before its design procedure.
Development selects matching language references and excludes externally maintained files from its code-style defaults.
Gradle and Maven wrappers are examples of that exception.

## Hook Errors

Invalid hook arguments exit with code 2.
Missing, unreadable, or empty instruction files exit with code 1 and produce no context.
Missing or unclosed skill frontmatter and empty skill bodies also exit with code 1.
These failures do not prevent Claude Code from starting a session or subagent.
Inspect the hook error notice if instructions fail to load.

## Development

Use npm and the Node version range in `package.json` for development.
The development tools require Node.js 24.15 or later within major version 24.
This development requirement is separate from the Node.js 18 minimum for hook execution.

Plugin evaluation relocates `HOME` into its sandbox.
If a Node version-manager shim fails there, prepend the installed Node binary's directory to the evaluator's `PATH`.

Install the pinned development tools.

```sh
npm ci
```

Follow [AGENTS.md](AGENTS.md) for contributor conventions and validation commands.
It identifies the checks for prose, hook execution, and plugin configuration changes.
Read [the design](docs/design.md) for delivery mechanics, instruction ownership, and test coverage.
Read [the research notes](docs/research.md) for source evidence and its limits.
[Third-party notices](THIRD_PARTY_NOTICES.md) record attribution.

## Version Updates

Maintain one release number in both host descriptors.

| File | Field |
| --- | --- |
| `.claude-plugin/plugin.json` | `version` |
| `.codex-plugin/plugin.json` | `version` |

Use `yyyy.mm.dd.seq`, with `01` for the first release of a day.
Increment the sequence for another release that day.
Update both fields together when publishing plugin changes.

Claude Code reads the plugin manifest version before an optional marketplace entry version.
Its marketplace-level version describes the catalog, not the plugin release.
Workgraph omits both marketplace version fields because its plugin manifest supplies the release number.
The private development package also needs no version.
See the [Claude marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference#plugin-entries) for these field definitions.

Codex selects its own descriptor instead of the Claude descriptor.
It does not inherit the Claude version when its selected descriptor omits one.
Both declarations are therefore required for the same explicit release number across these hosts.

1. Set the same new release number in both host descriptors.
2. Run the applicable checks from [AGENTS.md](AGENTS.md), including both plugin validators.
3. Inspect the complete diff and confirm both version fields match.
4. Commit the changes and versions together.
5. Push the authorized distribution branch and confirm the remote contains the commit.

A working-branch push reaches installed users only when their marketplace source tracks that branch.
Follow the authorized repository release process to update the distribution branch.

For an installed Claude marketplace copy, update the plugin after publication.

```sh
claude plugin update workgraph@workgraph
```

Run `/reload-plugins` or start a new session to load the downloaded version.
Local development directories load current files on reload or session startup without requiring a version change.
See the [Claude loading reference](https://code.claude.com/docs/en/plugins/loading#versions-and-updates) for cache and update behavior.
For Codex, use the host's plugin update controls and start a new session after updating.
