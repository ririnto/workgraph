# Workgraph

Workgraph supplies engineering coordination and development instructions for coding agents.
Its Main Agent mode routes work to focused skills, lifecycle playbooks and host references.
Claude Code and supported Codex runtimes can load the selected Main or Worker role through native hooks.

The host controls execution, model settings, permissions, and completion notifications.
The hook runtime uses Node built-ins and needs no npm dependencies.

## Install

Native host manifests share the same skills across ChatGPT, Codex, Claude Code, GitHub Copilot, and Cursor.
Codex and Claude Code select their own hook configurations explicitly.
Hook execution requires Node.js 24.22.3 or later within major version 24.
Choose the adapter for your execution host.

| Host | Setup and usage |
| --- | --- |
| Claude Code | Follow the [Claude Code adapter](docs/harness/claude-code.md) for installation, development loading, invocation, and updates. |
| ChatGPT / Codex | Follow the [OpenAI adapter](docs/harness/codex.md) for marketplace installation, manual invocation, and supported hook activation. |
| GitHub Copilot | Follow the [Copilot adapter](docs/harness/copilot.md) for CLI marketplace installation and shared skill usage. |
| Cursor | Follow the [Cursor adapter](docs/harness/cursor.md) for repository installation, invocation, and distribution options. |

The adapters describe user-facing setup, not role policy.
[Main and Worker host references](docs/design.md#separate-the-audiences) remain the injected execution adapters.
All host manifests declare the same release version through [Version Updates](#version-updates).

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
Both context hooks have a 30-second timeout to allow Node startup under contention.
The timeout is a ceiling, not an added delay.
Each output identifies the execution host, actual source paths, and complete content already loaded.
It starts with the host's native skill-content format, followed by source labels and the selected host reference.
All selected files load before context emission, so the injected role and host guidance need no additional reads.

Hooks do not inject contributor instructions, research, task skills, or playbooks.
Main and Worker keep their role contracts self-contained because they can load in separate sessions.
Main host references add orchestration and model selection guidance for each host.
Worker references own execution timing.
Parent history can still carry Main context into a forked Worker.

The [delivery design](docs/design.md#deliver-context) explains native loading formats, message-envelope differences, and Claude's inline-context limit.
Hook checks establish source delivery, not installed activation or model adherence.

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
PR readiness completes a publication request without authorizing a merge into its target branch.
User-requested merging, automatic merging, and merge-queue enrollment follow [Delivery's merge authority](skills/delivery/SKILL.md#establish-merge-authority).
Invocation does not grant new permissions or replace explicit user gates.
The [execution criteria](skills/main-agent-contract/SKILL.md#select-an-execution-path) scale planning, delegation, review, and verification to the work.
Small, understood changes use direct execution and relevant checks, while broader or uncertain work receives the coordination and evidence its risks require.
A change with serious consequences can need deeper verification even when it touches one line.
The approach adjusts as evidence changes, while preserving the complete requested outcome and required gates.
Repository scope follows the request without an activity threshold or archive-status exclusion.
Actual permissions, protected branches, security controls, and required acceptance checks still govern execution.

For Claude Code Main, [Workflow](skills/workflow/SKILL.md) contains host and role admission and the execution procedure.
Main's [Claude reference](skills/main-agent-contract/references/claude-code.md) owns tool selection.
The conditional authoring and delivery references stay behind that admission boundary.
Codex uses native delegation rather than Claude Code Workflow.
Workgraph bundles one [adaptive delivery workflow](docs/workflow-samples.md), that can finish at Explore or Plan when the evidence shows no change is needed, or publish and review the requested change.
Those samples use injectable prompt parts, optional per-phase model and effort selectors, and explicit skip, failure, and bounded-recovery records.
The admitted Claude Main procedure also covers read-only design without bundling a specialist-agent graph.
All workflow sources launch through the native Workflow interface, and Workgraph supplies no replacement execution engine.

## Skill invocation

All skills remain user-invocable and block model invocation, following [pstack](https://github.com/cursor/plugins/tree/main/pstack)'s skill boundary.
Roles and procedures link each bundled `SKILL.md`, so models read the linked file instead of invoking the skill.
Users keep the explicit forms, such as `/workgraph:workflow` in Claude Code or `$workgraph:development` in Codex.
Claude Code, Cursor, and Copilot read `disable-model-invocation: true`, and Codex reads each skill's `agents/openai.yaml` policy.
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
| Scoped procedure | [Workflow](skills/workflow/SKILL.md) | Claude Main reads native Workflow procedures directly for the host reference's selection conditions. |
| Scoped procedure | [Memory Maintenance](skills/memory-maintenance/SKILL.md) | Authorized durable memory changes load existing-record review and reconciliation guidance. |
| Scoped procedure | [Codex Scoped Cleanup](skills/codex-scoped-cleanup/SKILL.md) | Codex resource retirement loads its complete owner-mediated lifecycle procedure. |

Each skill body contains the procedures required whenever that skill is used.
References hold detail selected by a task, host, language, or operation.

| Conditional detail | Source | Read trigger |
| --- | --- | --- |
| Assigned fix queues | Delivery's [fix queue guidance](skills/delivery/references/fix-queues.md) | Handling or assessing an assigned queue requires this reference. |
| Build and tooling | Development's [language references](skills/development/SKILL.md#development-lifecycle) and [lint rule guidance](skills/development/SKILL.md#select-and-adopt-lint-checks) | Language references include their tooling conventions, while shared lint guidance covers rule selection and fixes. |
| Kotest | Kotlin's [Kotest guidance](skills/development/references/kotlin.md#kotest) | Creating or changing Kotest specs or assertions requires this reference. |
| Installed plugin updates | Delivery's [plugin update guidance](skills/delivery/references/plugin-updates.md) | An authorized update selects the account release or marketplace installation and verifies the result at that destination. |
| Worktree connections | Cleanup's [native attachment guidance](skills/codex-scoped-cleanup/references/native-attachments.md) | Changing Worktree Artifact connections requires this reference. |
| Worktrees and caches | Cleanup's [worktree and cache guidance](skills/codex-scoped-cleanup/references/worktrees-caches.md) | Archiving, restoring, or removing worktrees or caches requires this reference. |

[Development](skills/development/SKILL.md) names each playbook's read trigger and the supported language references.
Development owns [agent instruction design](skills/development/references/instruction-design.md).
General human-facing prose style is outside Workgraph's scope.
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
For missing Codex hooks or update-time trust errors, follow [Confirm hook activation](docs/harness/codex.md#confirm-hook-activation).

## Development

Use pnpm and the Node version range in `package.json` for development.
The managed development runtime uses the exact Node.js version in `devEngines.runtime`.
The supported Node.js range remains in `engines.node`.
Install the pnpm version declared in `package.json` before installing the pinned development tools.
Install ShellCheck for shell scripts and GitHub Actions workflow checks.
Use the Go version in the [golangci-lint tool module](tools/golangci-lint/go.mod).
The repository's [other Go tools](tools/go.mod) pin NilAway, actionlint, and shfmt separately from the analyzer and its runnable example.
Use JDK 21 or later and the bundled Gradle wrapper to lint the Kotlin build logic and check a fresh sample with the custom ruleset.
Linux CI provisions the runtimes and ShellCheck, then runs the same `pnpm run check` command.

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run validate:claude
```

The Claude validation command uses the pinned CLI to check both the package directory and the native manifest.

Installation runs Husky through `prepare` and installs Git dispatchers in `.husky/_/`.
The pre-commit hook checks the staged diff for whitespace errors and conflict markers.
It runs the repository's Markdown, TypeScript, lint, and metadata validators, then selects native linters and tests based on staged paths.
The pre-push hook runs the full repository check before publication.
`pnpm run check:ultracite` checks formatting and runs lint rules, including type-aware rules on JavaScript and TypeScript files.
Type-aware lint excludes generated files and the host workflow DSL.
`pnpm run check:typescript` checks the configured JavaScript and TypeScript files with TypeScript and JSDoc.
TypeScript uses the includes and exclusions in `tsconfig.json`, while Ultracite also applies its preset and Git ignores.
`pnpm run check:production-audit` runs `pnpm audit --prod` to inspect production dependencies.
The manifest currently declares none.
It remains a forward-looking check when the project adds production dependencies.

Follow the auto-injected repository guidance for contributor conventions and validation commands.
Follow [CONTRIBUTING.md](CONTRIBUTING.md) for issue, commit, and pull request formats.
The [tooling design](docs/design.md#validation-and-tooling) explains lint ownership, supported prose diagnostics, validation gates, and CI coverage.
The [lint standards map](docs/lint-standards.md) lists the effective checks and the behavior they cover.
Executable rules and tooling configuration remain separate from consumer guidance.

The workspace scopes patched KaTeX to micromark-extension-math, whose declared range still permits only the affected series.
Remove that override when the parent supports a patched release directly, tracked in [Issue #79](https://github.com/ririnto/workgraph/issues/79).
The unpatched braces advisory remains in development dependencies, tracked in [Issue #78](https://github.com/ririnto/workgraph/issues/78).
These development dependencies are not required by the hook runtime.

For a change that needs native behavioral evidence, select the case that exercises the affected decision and enable the tools it uses.
Run it from a trusted checkout and inspect actual tool results before claiming completion.
Evaluation relocates `HOME` into its sandbox, which can break home-dependent Node version-manager shims.
Prepend the resolved Node binary directory to `PATH` for the evaluator and its isolated runs.

```sh
PATH="$(dirname "$(node -p process.execPath)"):$PATH" claude plugin eval ./ --case delivery-completion-evidence --runs 1 --ablation none --allow-tools Workflow --keep-temp --no-publish --output-dir ../workgraph-eval-results
```

The example exercises Workflow delivery.
One run checks invocation and the observed outcome.
Use `--runs 2` or more on the selected case when assessing repeatability or comparing instruction changes.
Report individual outcomes, including failures and incomplete runs.
Keep source-check results separate from measured behavioral evidence.
Use the [verification map](docs/verification-map.md) for case-specific commands and evidence limits.

Keep reports outside the repository and retain traces until their actual completion results have been inspected.
Remove task-owned reports and retained evaluation sandboxes when checks, investigation, recovery, and retention no longer need them.
These runs establish bounded host and model behavior rather than universal adherence.

Read [the design](docs/design.md) for instruction ownership and hook mechanics.
Read [the research notes](docs/research.md) for source evidence and qualifications.
[Third-party notices](THIRD_PARTY_NOTICES.md) retain attribution.

## Version updates

Maintain one release number across all four native host manifests.

| File | Field |
| --- | --- |
| `.codex-plugin/plugin.json` | `version` |
| `.claude-plugin/plugin.json` | `version` |
| `.cursor-plugin/plugin.json` | `version` |
| `.plugin/plugin.json` | `version` |

Use `yyyy.MM.dd.seq`, with a four-digit year and two-digit month and day.
Write sequences `01` through `99` with two digits, then use `100` and higher without extra leading zeros.
For example, October 30's sixth release is `2026.10.30.06`, and January 8's first release is `2026.01.08.01`.
Start the sequence at `01` on a new date.
Increment the sequence for another release that day.
Update all four fields together when publishing plugin changes.

This calendar version is the project's release contract.

Claude Code reads the plugin manifest version before an optional marketplace entry version.
Its marketplace-level version describes the catalog, not the plugin release.
Workgraph's catalogs omit release versions because the selected plugin manifest supplies them.
The private development package also needs no version.
See the [Claude marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference#plugin-entries) for these field definitions.

Codex reads `.codex-plugin/plugin.json`, Claude Code reads its own descriptor, Cursor reads `.cursor-plugin/plugin.json`, and Copilot reads the OpenPlugin descriptor at `.plugin/plugin.json`.
The shared `skills/` tree remains the only copy of the instructions.
Root `plugin.json` is intentionally absent because the reviewed Codex loader prioritizes that portable manifest and skips its hooks.
The [source review](docs/research.md#codex-native-hook-discovery-and-trust) records this compatibility requirement and the separate hook-trust boundary.

1. Set the same new release number in all four host manifests.
2. Run the applicable checks from the auto-injected repository guidance, including strict Claude validation.
3. Inspect the complete diff and confirm metadata, versions, and marketplace paths match.
4. Commit the changes and versions together.
5. Push the authorized distribution branch and confirm the remote contains the commit.

A working-branch push reaches installed users only when their marketplace source tracks that branch.
Follow the authorized repository release process to update the distribution branch.
Use the matching [host adapter](#install) for installed-plugin updates and fresh-session checks.
