# Workgraph

Workgraph supplies engineering coordination, writing, and development instructions for coding agents.
Its Main Agent mode routes work to focused skills, lifecycle playbooks and host references.
Claude Code and supported Codex runtimes can load the selected Main or Worker role through native hooks.

Workgraph supplies instructions and a narrow Bash polling guard.
The host controls execution, model settings, permissions, and completion notifications.
The hook runtime uses Node built-ins and needs no npm dependencies.

## Install

The portable package shares the same skills across ChatGPT, Codex, GitHub Copilot, and Cursor.
Claude Code uses its dedicated manifest and the same skill files.
Hook execution requires Node.js 26.13.0 or later within major version 26.
Choose the adapter for your execution host.

| Host | Setup and usage |
| --- | --- |
| Claude Code | Follow the [Claude Code adapter](docs/harness/claude-code.md) for installation, development loading, invocation, and updates. |
| ChatGPT / Codex | Follow the [OpenAI adapter](docs/harness/codex.md) for marketplace installation, manual invocation, and supported hook activation. |
| GitHub Copilot | Follow the [Copilot adapter](docs/harness/copilot.md) for CLI marketplace installation and shared skill usage. |
| Cursor | Follow the [Cursor adapter](docs/harness/cursor.md) for repository installation, invocation, and distribution options. |

The adapters describe user-facing setup, not role policy.
[Main and Worker host references](docs/design.md#separate-the-audiences) remain the injected execution adapters.
The portable manifest and Claude descriptor declare the same release version through [Version Updates](#version-updates).

## Automatic instructions

The following events apply to the bundled Claude Code and Codex hook adapters.
Enable and trust plugin hooks through the host's supported controls before relying on automatic loading.
Use manual skill loading when the active host does not run these hooks.

| Event | Recipient | Loaded sources |
| --- | --- | --- |
| SessionStart | Main session | The hook loads [Main Agent mode](skills/main-agent-contract/SKILL.md) and its selected host reference. |
| SubagentStart | Dispatched agent | The hook loads the [Worker contract](skills/subagent-context/SKILL.md) and its selected host reference. |

SessionStart covers startup, resume, clear, compact, and fork events supported by the host.
Neither hook filters events with a matcher.
Each output identifies the execution host, actual source paths, and complete content already loaded.
All selected files load before context emission, so the injected role and host guidance need no additional reads.

Hooks do not inject contributor instructions, research, task skills, or playbooks.
Main and Worker keep their role contracts self-contained because they can load in separate sessions.
Main host references add orchestration and model selection guidance for each host.
Worker references own execution timing.
Parent history can still carry Main context into a forked Worker.

The [delivery design](docs/design.md#deliver-context) explains native loading formats, message-envelope differences, and Claude's inline-context limit.
Hook checks establish source delivery, not installed activation or model adherence.

## Bash polling guard

### Count repeated commands

Both host configurations register a synchronous `PreToolUse` command hook matching `Bash`.
The guard denies the third consecutive matching Bash call within the same host and session ID.
Matches can mix `tail` and `sleep`.
Further matching calls remain denied until a nonmatching Bash command resets the counter.
Other tools leave the counter unchanged.
The denial directs agents to end the turn and await an available completion callback.
For an existing command without a callback, it directs agents to use the host-native wait instead of polling.
Codex's `write_stdin` can collect completion for an existing unified execution session.
Installation changes no host enable settings or permission configuration.

### Recognize matching commands

The guard recognizes literal leading `tail` and `sleep` commands with ordinary arguments and simple pipelines.
Spaces, tabs, single quotes, double quotes without expansion, trailing comments, and one final newline are supported.
Occurrences in prose arguments, quoted executable names, and later pipeline commands do not match.
Paths, wrappers, expansions, redirections, compound commands, functions, and unsupported syntax do not match.
These excluded forms reset the counter because safe detection takes precedence over broad coverage.
The guard never executes or rewrites a command.

### Apply the counter

`tail -f`, `tail -F`, and `tail --follow` count like other `tail` calls.
The guard limits repeated tool invocations, including repeated follow commands.
A single inspection after completion remains allowed when fewer than two matching calls precede it.
Completion callbacks do not reset the counter.
Codex maps shell and unified execution calls to `Bash` with `tool_input.command` in its [hook interface](https://developers.openai.com/codex/hooks/).
Codex subagents share the parent session ID and therefore share its counter.

### Store state and handle failures

State uses private directories beneath the operating system's temporary directory.
Only a bounded counter and failure markers are stored, under hashed host and session identifiers.
The guard serializes concurrent counter changes with an exclusive lock and atomically replaces the counter file.
It rejects unsafe directories and counter symlinks.
State errors allow execution and disable further decisions for that session when the failure marker can be written.
The lock wait is bounded to approximately one second.
A crashed invocation's lock remains untouched, so later calls fail open rather than reclaiming another invocation's lock.
Temporary state remains until operating system cleanup, avoiding session-end deletion races with active delegated work.
The guard emits generic errors without commands, session identifiers, or private paths.
Enforcement requires POSIX user IDs and no-follow file opens, so Windows fails open.

## Goal-driven work

Start with a goal, its scope, and an observable completion condition.
For example, a bug-fix request can name the trigger and expected result without prescribing every stage.

```text
Fix the parser's escaped-quote bug, verify the original trigger, and publish a PR for review within the authorized scope.
```

The stable `main-agent-contract` skill is the Main Agent mode entry, not a wrapper around another mode.
Use your [host adapter](#install) to invoke it manually.
The [Main contract](skills/main-agent-contract/SKILL.md) owns scope, authority, orchestration, evidence acceptance, and reporting.
[Delivery](skills/delivery/SKILL.md) owns authorized repository publication, review, integration, and cleanup procedures.
Invocation does not grant new permissions or replace explicit user gates.
Workflow and writing procedures are defaults that adapt to explicit user requests, task risk, and supported host capabilities.
Review staffing, delegation, and delivery methods need no fixed ceremony when the task does not require one.
Repository scope follows the request without an activity threshold or archive-status exclusion.
Actual permissions, protected branches, security controls, and required acceptance checks still govern execution.

For Claude Code graph execution, [Workflow](skills/workflow/SKILL.md) adds native node mapping and result verification.
Its [authoring reference](skills/workflow/references/authoring.md) supplies script-specific guidance.
Its [delivery reference](skills/workflow/references/delivery.md) maps Delivery operations to node inputs and outputs without owning another delivery checklist.
Codex uses native delegation rather than Claude Code Workflow.
Workgraph bundles [delivery workflow samples](docs/workflow-samples.md) in simple and complex task variants.
Those samples use injectable prompt parts, optional per-phase model selectors, and explicit skip, failure, and bounded-recovery records.
For read-only design work, the Workflow skill provides design and verification guidance without bundling a specialist-agent graph.
All workflow sources launch through the native Workflow interface, and Workgraph supplies no replacement execution engine.

## Skill invocation

All skills remain user-invocable and model-invocable.
Hooks operate without skill invocation.
Conditional skills load only when their stated task scope matches and their complete content is not already present.

| Layer | Source | Audience and trigger |
| --- | --- | --- |
| Mode and Main role | [Main Agent Contract](skills/main-agent-contract/SKILL.md) | Main follows this contract for complete authorized outcomes. |
| Worker role | [Subagent Context](skills/subagent-context/SKILL.md) | Dispatched agents follow bounded assignments and return evidence. |
| Host reference | Each role's `references/claude-code.md` or `references/codex.md` | The hook selects the active role and host together. |
| Development router | [Development](skills/development/SKILL.md) | Source work selects the matching lifecycle playbook and language references. |
| Lifecycle playbook | Development's [playbooks](skills/development/playbooks/feature.md) | Features, bug fixes, refactoring, and performance work each load their matching procedure. |
| Scoped procedure | [Delivery](skills/delivery/SKILL.md) | Main loads repository delivery procedures before repository changes or delivery. |
| Scoped procedure | [Workflow](skills/workflow/SKILL.md) | Claude Main loads native Workflow procedures for the host reference's selection conditions. |
| Scoped procedure | [Writing](skills/writing/SKILL.md) | Prose, Markdown, and instruction work load writing and task-contract guidance. |
| Scoped procedure | [Memory Maintenance](skills/memory-maintenance/SKILL.md) | Authorized durable memory changes load existing-record review and reconciliation guidance. |
| Scoped procedure | [Codex Scoped Cleanup](skills/codex-scoped-cleanup/SKILL.md) | Codex resource retirement loads the bundled lifecycle and attachment procedures. |

[Development](skills/development/SKILL.md) names each playbook's read trigger and the supported language references.
Writing owns prose, agent-facing prompt contracts, and example separation.
Consumer links and required resources stay bundled, without another plugin dependency or required online research.

Manual role loading reads a matching bundled host reference when present and not already loaded.
Other hosts use their native tool descriptions with the shared role contract.
Manual invocation changes neither the session's role nor its dispatch authority.
The host adapters list invocation forms and host-specific availability.

### Application verification

The maintainer [verification map](docs/verification-map.md) connects Workgraph behavior to existing checks and their limits.
Passing source or hook checks does not establish installed activation, interactive invocation, or model adherence.

## Hook errors

Invalid hook arguments exit with code 2.
Missing, unreadable, or empty instruction files exit with code 1 and produce no context.
Missing or unclosed skill frontmatter and empty skill bodies also exit with code 1.
These failures do not prevent Claude Code from starting a session or subagent.
Inspect the hook error notice if instructions fail to load.

## Development

Use pnpm and the Node version range in `package.json` for development.
Development tools require Node.js 26.13.0 or later within major version 26.
Install the pnpm version declared in `package.json` before installing the pinned development tools.

```sh
pnpm install --frozen-lockfile
pnpm run check
```

Installation runs Husky through `prepare` and installs Git dispatchers in `.husky/_/`.
The real pre-commit and pre-push hooks run `pnpm run pre-commit` and `pnpm run pre-push`.
Each script runs the complete existing check gate and blocks its Git operation on failure.
`pnpm run check:production-audit` runs `pnpm audit --prod` to inspect production dependencies.
The manifest currently declares none.
It remains a forward-looking check when the project adds production dependencies.

Follow the auto-injected repository guidance for contributor conventions and validation commands.
Follow [CONTRIBUTING.md](CONTRIBUTING.md) for issue, commit, and pull request formats.
The [tooling design](docs/design.md#validation-and-tooling) explains lint ownership, supported prose diagnostics, validation gates, and CI coverage.
Executable rules and tooling configuration remain separate from consumer guidance.

The workspace scopes patched KaTeX to micromark-extension-math, whose declared range still permits only the affected series.
Remove that override when the parent supports a patched release directly, tracked in [Issue #79](https://github.com/ririnto/workgraph/issues/79).
The unpatched braces advisory remains in development dependencies, tracked in [Issue #78](https://github.com/ririnto/workgraph/issues/78).
These development dependencies are not required by the hook runtime.

The native behavioral suite requires Claude Code with Agent, Workflow, and Bash available.
Run it from a trusted checkout and inspect actual tool results before claiming completion.
Evaluation relocates `HOME` into its sandbox, which can break home-dependent Node version-manager shims.
Prepend the resolved Node binary directory to `PATH` for the evaluator and its isolated runs.

```sh
PATH="$(dirname "$(node -p process.execPath)"):$PATH" claude plugin eval ./ --runs 2 --ablation none --allow-tools Agent Workflow Bash --keep-temp --no-publish --output-dir ../workgraph-eval-results
```

Run each case at least twice for instruction-behavior evidence.
Report each case's individual run outcomes, including failures and incomplete runs, rather than only an aggregate score.
Use `--runs 1` only for a labeled packaging or invocation smoke check.
A smoke check does not satisfy instruction-behavior acceptance.
Keep source-check results separate from measured behavioral evidence.
Use the [verification map](docs/verification-map.md) for case-specific commands and evidence limits.

Keep reports outside the repository and retain traces until their actual completion results have been inspected.
Remove task-owned reports and retained evaluation sandboxes when checks, investigation, recovery, and retention no longer need them.
These runs establish bounded host and model behavior rather than universal adherence.

Read [the design](docs/design.md) for instruction ownership and hook mechanics.
Read [the research notes](docs/research.md) for source evidence and qualifications.
[Third-party notices](THIRD_PARTY_NOTICES.md) retain attribution.

## Version updates

Maintain one release number in the portable manifest and Claude descriptor.

| File | Field |
| --- | --- |
| `plugin.json` | `version` |
| `.claude-plugin/plugin.json` | `version` |

Use `year.monthday.sequence`, where `monthday` equals `month * 100 + day`.
Write numeric components without leading zeros, preserving valid Semantic Versioning syntax.
For example, October 30's fifth release is `2026.1030.5`, and January 8's first release is `2026.108.1`.
Start the sequence at `1` on a new date.
Increment the sequence for another release that day.
Update both fields together when publishing plugin changes.

Claude Code reads the plugin manifest version before an optional marketplace entry version.
Its marketplace-level version describes the catalog, not the plugin release.
Workgraph's catalogs omit release versions because the selected plugin manifest supplies them.
The private development package also needs no version.
See the [Claude marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference#plugin-entries) for these field definitions.

OpenAI, Copilot, and Cursor read the portable root manifest.
OpenAI hook settings live in its `extensions.com.openai` namespace.
The obsolete `.codex-plugin/plugin.json` descriptor has been replaced with this canonical source.
Use clients supporting Agent Plugins 1.0 for portable package installation.

1. Set the same new release number in the portable and Claude manifests.
2. Run the applicable checks from the auto-injected repository guidance, including strict Claude validation.
3. Inspect the complete diff and confirm metadata, versions, and marketplace paths match.
4. Commit the changes and versions together.
5. Push the authorized distribution branch and confirm the remote contains the commit.

A working-branch push reaches installed users only when their marketplace source tracks that branch.
Follow the authorized repository release process to update the distribution branch.
Use the matching [host adapter](#install) for installed-plugin updates and fresh-session checks.
