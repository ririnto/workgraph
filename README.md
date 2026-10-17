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
Check the loaded plugin version and actual source paths before evaluating changed instructions.

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

For repository changes or delivery, Main reads the conditional Delivery skill before starting changes.
Claude hook contexts stay within its 10,000-character inline limit, including tested path and line-ending variations.
The hooks do not inject repository guidance or research documents.

The main-agent contract keeps planning, design decisions, publication, integration, and final reporting in the main session.
It uses a goal-dependent task graph when dependencies make coordination useful.
Each node names its operation, inputs, outputs, owner, authority, and completion evidence.
Edges represent result dependencies or conditions, not chronology.
The main agent starts ready independent work in parallel when writes do not conflict and serializes conflicting writes.
Exploration, planning, implementation, review, and integration are possible node types, not a required itinerary.
Workers complete bounded assignments within their authority.

The Main contract owns orchestration, authority, request-origin communication, and evidence freshness.
The Worker contract owns bounded assignments and handbacks.
Both keep their role procedures self-contained, and these instructions do not guarantee model adherence.

Main carries authorized outcomes through review, integration, named-base readback, and owned cleanup without routine phase approvals.
Main and Worker read Memory Maintenance before durable memory changes.
That conditional procedure requires the complete selected memory index and existing records before edits.
It preserves valid facts, resolves supersession within authority, and keeps unresolved conflicts explicit.
Private memory remains outside published project material.

Claude Code uses native Workflow when a follow-up may depend on an accepted earlier result, including conditional follow-ups, or when explicitly requested.
Its [Main host reference](skills/main-agent-contract/references/claude.md#orchestration) routes to Workflow for selection and fallback rules.
The Workflow skill owns graph preparation, execution, and result verification.
Codex uses native delegation under its [Main host reference](skills/main-agent-contract/references/codex.md), without native Claude Code Workflow.

The active Main host reference supplies defaults for each model or effort setting unspecified by the user or configuration.
Main applies the Main Agent Contract's model and effort policy to authorized delegations, including native Workflow calls.
Each Main hook loads only its host's execution, orchestration, and model guidance.
Worker hooks load their own execution references without Main orchestration or model policy.
Forked workers can inherit Main's host guidance through parent history.
Detailed model support, benchmarks, and workload reports remain in [maintainer research](docs/research.md#model-effort-and-cost).

Claude guidance defaults to Opus planning, Haiku read-only scans, and Sonnet edits, with active user and configuration settings taking precedence.
Each edit agent uses an isolated worktree and returns its diff to Main.
Ultracode remains an authorized host choice rather than a setting changed by installing this guidance.
For a new Claude session using this model split, the operator can choose the following startup command.

```sh
claude --model opus --effort ultracode
```

The ultracode launch flag also selects `xhigh` effort, while active host and user overrides retain precedence.
Main requires independent finding verification before confirmed reporting and stops fix loops after two consecutive rounds without measurable progress.
Productive rounds reset that count, which remains separate from native retries and inference sampling.
Unavailable verification remains explicit as unverified.

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
Native Workflow runs a JavaScript script, not Main's abstract graph.
Use the native `script` input first, then its returned `scriptPath` for an authorized continuation.
Pass structured `args` and `resumeFromRunId` only as the current tool supports them.
Read [Workflow script authoring](skills/workflow/references/authoring.md) before authoring or resuming a script.

Follow the delivery skill for branch selection, exposure scans, independent review, tracked deferrals, integration, and branch cleanup.
Exposure scans cover user environment details and secrets only.
Commit author and committer names and email addresses are contributor information, excluded from exposure findings, rewrites, and publication blocks.
Selecting a base branch does not grant publication, integration, or cleanup authority.
Read-only goals retain their inspection scope.
Each [role contract](#automatic-instructions) governs evidence retention, replay validation, and owned resource cleanup.

The [host Workflow documentation](https://code.claude.com/docs/en/workflows) defines availability, permissions, script discovery, and continuation.
Workgraph ships no reusable Workflow scripts.
Read Workflow for graph procedures and explicit-tool handling.
Workers complete relayed bounded assignments without starting another Workflow.

Explicit diff-first requests preserve approval before any edits, including edits in isolated copies.
Use separate proposal and edit runs when sign-off is required because native Workflow cannot request mid-run operator input.
Already authorized work proceeds within its scope without invented stage approvals.
Native script control flow handles deterministic routing without JEV or a replacement engine.
The [source-adoption record](docs/research.md#native-workflow-stage-adoption) maps these choices and their evidence limits.

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
| `/workgraph:memory-maintenance` | `$workgraph:memory-maintenance` | Review existing memory context and reconcile authorized durable records. |
| `/workgraph:development` | `$workgraph:development` | Load coding guidance and matching language references. |
| `/workgraph:verification` | `$workgraph:verification` | Reproduce behavior and collect evidence with the project's existing tools. |
| Not applicable | `$workgraph:codex-scoped-cleanup` | Clean retired Codex resources and stale Worktree Artifact connections. |

All skills remain user-invocable and model-invocable.
Invocation does not change the current session's role or dispatch authority.
The hooks operate without skill invocation.

Automatic delivery includes each role's required environment reference.
Hooks do not inject conditional task skills.
Main selects Delivery by skill name.
Main and Worker select Writing, Instruction Authoring, and Development by skill name.
Read each conditional skill only when its task scope matches and its complete content is not already loaded.
Workgraph has no dependency on another plugin's skills or installation.

Codex Main and Worker references conditionally load Codex Scoped Cleanup before retiring its covered resources.
The cleanup procedure and native attachment reference stay bundled rather than requiring a separate user-level skill.
Cleanup compares individual session and worktree activity and preserves required changes through retained Git references.
Its [app-server reference](skills/codex-scoped-cleanup/references/app-server.md) covers native inventory, writer ownership, lifecycle effects, and exact readback.
Permanent deletion requires explicit human authority for the affected scope and preserves tool-specific action-time confirmation.
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

### Application Verification

Read Verification for behavior changes, performance claims, or report reproduction, and Development for lifecycle selection, correction order, user preferences, and side-effect boundaries.
Instruction Authoring routes instruction behavior changes to Verification.
These skills stay conditional and outside hook context.

The maintainer [verification map](docs/verification-map.md) links Workgraph behavior to existing commands and evidence limits.
Passing source or hook checks does not establish installed host activation or model adherence.

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

Use pnpm and the Node version range in `package.json` for development.
The development tools require Node.js 24.15 or later within major version 24.
This development requirement is separate from the Node.js 18 minimum for hook execution.

Plugin evaluation relocates `HOME` into its sandbox.
If a Node version-manager shim fails there, prepend the installed Node binary's directory to the evaluator's `PATH`.

Install the pnpm version declared by `packageManager` before installing the pinned development tools.

```sh
pnpm install --frozen-lockfile
```

Installation runs Husky through `prepare` and installs Git dispatchers in `.husky/_/`.
The real pre-commit and pre-push hooks run `pnpm run pre-commit` and `pnpm run pre-push`.
Each script runs the complete existing check gate and blocks the Git operation on failure.
The aggregate gate requires `pnpm audit --prod` to pass.
Ultracite owns source lint and formatting, including the adopted Sinon source-style plugins.
The root configs use the official Ultracite 8 presets and preserve their ignore patterns.
Oxfmt additionally excludes Markdown and uses `trailingComma: "none"`.
The local style and TSDoc plugins retain mandatory function-body spacing, declaration-comment, and exported TypeScript documentation checks.
These additions follow the [Sinon tooling examples](https://github.com/ririnto/sinon/tree/main/plugins/harness/tooling/pnpm).
JavaScript parameter and return annotations and type imports follow the official preset defaults.
Markdownlint also checks sentence boundaries and table separators using the adopted Harness rules.

The sentence rule checks English prose in paragraphs, lists, alert quotes, and individual table cells.
It recognizes ASCII sentence terminators and ASCII or fullwidth semicolons between recognizable independent clauses.
Capitalized enumeration labels alone do not establish a clause.
Known company, clock, honorific, initial, example, and decimal forms use bounded context to distinguish sentence boundaries.
Inline code, links, images, autolinks, and quoted interiors remain protected.
Ordinary block quotes, fenced and indented code, HTML blocks, frontmatter, licenses, and generated documents retain their exemptions.
Escaped and entity-encoded punctuation uses rendered text while diagnostics retain original UTF-16 source columns and complete punctuation token spans.
Unfinished prose followed by a continuation on the next physical line also reports, including capitalized and opaque inline starts.
The heuristic cannot resolve every English abbreviation, proper name, fragment, or unlisted clause form.
Other languages and Unicode sentence terminators remain outside its supported scope.

The pnpm workspace overrides markdownlint-cli2's pinned smol-toml with a patched release in the same major version.
Remove that scoped override when markdownlint-cli2 supports the patched parser directly.
The workspace also scopes patched KaTeX to micromark-extension-math, whose declared range still permits only the affected series.
Remove that override when the parent supports a patched release directly, tracked in [Issue #79](https://github.com/ririnto/workgraph/issues/79).
The unpatched braces advisory remains in development dependencies, tracked in [Issue #78](https://github.com/ririnto/workgraph/issues/78).
These development dependencies are not required by the hook runtime.

Follow [AGENTS.md](AGENTS.md) for contributor conventions and validation commands.
It identifies the checks for prose, hook execution, and plugin configuration changes.
Development validation gates live in `test/validation/`, with their Node tests in `test/validation.test.mjs`.
The Markdown gate checks relative links.
The issue-form gate validates the YAML fields used by templates inside `.github`.
The aggregate gate also validates matching release versions and runs positive and negative validation tests.
CI runs the aggregate gate on Linux and dependency-free hook tests on macOS and Node.js 18.
The native behavioral suite requires Claude Code with Agent, Workflow, and Bash available.
Run it from a trusted checkout and retain local traces until their actual completion results have been inspected.
Put the resolved Node binary directory on `PATH` so each isolated run can execute Node without a home-dependent version-manager shim.

```sh
PATH="$(dirname "$(node -p process.execPath)"):$PATH" claude plugin eval ./ --runs 1 --ablation none --allow-tools Agent Workflow Bash --keep-temp --no-publish --output-dir ../workgraph-eval-results
```

Remove task-owned reports and retained evaluation sandboxes after recording the results when they are no longer needed.
These runs establish bounded host and model behavior rather than universal model adherence.
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

Run `/reload-plugins` to make downloaded files available to new plugin loads, or start a new session.
Reloading does not prove that previously injected instructions were replaced in the current context.
Use a fresh session and confirm its plugin version and source paths when evaluating changed instructions.
Local development directories load current files on reload or session startup without requiring a version change.
See the [Claude loading reference](https://code.claude.com/docs/en/plugins/loading#versions-and-updates) for cache and update behavior.
For Codex, use the host's plugin update controls and start a new session after updating.
