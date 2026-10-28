# Workgraph

Workgraph supplies engineering coordination, writing, and development instructions for Claude Code and Codex.
Its Main Agent mode routes work to focused skills, lifecycle playbooks, principles, and host references.
Native hooks load the selected Main or Worker role before execution.

Workgraph supplies instructions, not a scheduler or permission system.
The host controls execution, model settings, permissions, and completion notifications.
The hook runtime uses Node built-ins and needs no npm dependencies.

## Install

Use Node.js 18 or later for hook execution.
Choose the adapter for your execution host.

| Host | Setup and usage |
| --- | --- |
| Claude Code | Follow the [Claude Code adapter](docs/harness/claude-code.md) for installation, development loading, invocation, and updates. |
| Codex | Follow the [Codex adapter](docs/harness/codex.md) for supported plugin activation, invocation, and evidence limits. |

The adapters describe user-facing setup, not role policy.
[Main and Worker host references](docs/design.md#separate-the-audiences) remain the injected execution adapters.
Both host descriptors declare the same release version through [Version Updates](#version-updates).

## Automatic Instructions

| Event | Recipient | Loaded sources |
| --- | --- | --- |
| SessionStart | Main session | The hook loads [Main Agent mode](skills/main-agent-contract/SKILL.md) and its selected host reference. |
| SubagentStart | Dispatched agent | The hook loads the [Worker contract](skills/subagent-context/SKILL.md) and its selected host reference. |

SessionStart covers startup, resume, clear, compact, and fork events supported by the host.
Neither hook filters events with a matcher.
Each output identifies the execution host, actual source paths, and complete content already loaded.
All selected files load before context emission, so the injected role and host guidance need no additional reads.

Hooks do not inject contributor instructions, research, task skills, playbooks, or principle skills.
Main and Worker keep their role contracts self-contained because they can load in separate sessions.
Main host references own orchestration and model guidance, while Worker references own execution timing only.
Parent history can still carry Main context into a forked Worker.

The [delivery design](docs/design.md#deliver-context) explains native loading formats, message-envelope differences, and Claude's inline-context limit.
Hook checks establish source delivery, not installed activation or model adherence.

## Goal-Driven Work

Start with a goal, its scope, and an observable completion condition.
For example, a bug-fix request can name the trigger and expected result without prescribing every stage.

```text
Fix the parser's escaped-quote bug, verify the original trigger, and publish a PR for review within the authorized scope.
```

The stable `main-agent-contract` skill is the Main Agent mode entry, not a wrapper around another mode.
Use the host adapter's [Claude Code](docs/harness/claude-code.md#manual-invocation) or [Codex](docs/harness/codex.md#manual-invocation) syntax to invoke it manually.
The [Main contract](skills/main-agent-contract/SKILL.md) owns scope, authority, orchestration, evidence acceptance, and reporting.
[Delivery](skills/delivery/SKILL.md) owns authorized repository publication, review, integration, and cleanup procedures.
Invocation does not grant new permissions or replace explicit user gates.

For Claude Code graph execution, [Workflow](skills/workflow/SKILL.md) adds native node mapping and result verification.
Its [authoring reference](skills/workflow/references/authoring.md) supplies script-specific guidance.
Its [delivery reference](skills/workflow/references/delivery.md) maps Delivery operations to node inputs and outputs without owning another delivery checklist.
Codex uses native delegation rather than Claude Code Workflow.
Its [caller contract](skills/workflow/references/authoring.md#use-the-bundled-source) distinguishes inline execution, named discovery, skill selection, and installed activation.
Workgraph bundles [delivery workflow samples](docs/workflow-samples.md) in simple and complex task variants.
Those samples use injectable prompt parts, per-phase model defaults, and explicit skip, failure, and bounded-recovery records.
It also includes an [agent-authored design workflow](workflows/design.js) with runtime model inputs and independent verification.
All workflow sources launch through the native Workflow interface, and Workgraph supplies no replacement execution engine.

## Skill Invocation

All skills remain user-invocable and model-invocable.
Hooks operate without skill invocation.
Conditional skills load only when their stated task scope matches and their complete content is not already present.

| Layer | Source | Audience and trigger |
| --- | --- | --- |
| Mode and Main role | [Main Agent Contract](skills/main-agent-contract/SKILL.md) | Main follows this contract for complete authorized outcomes. |
| Worker role | [Subagent Context](skills/subagent-context/SKILL.md) | Dispatched agents follow bounded assignments and return evidence. |
| Host reference | Each role's `references/claude.md` or `references/codex.md` | The hook selects the active role and host together. |
| Development router | [Development](skills/development/SKILL.md) | Source work selects the matching lifecycle playbook and language references. |
| Lifecycle playbook | Development's [playbooks](skills/development/playbooks/feature.md) | Features, bug fixes, refactoring, and performance work each load their matching procedure. |
| Behavior principle | [Preserve Behavior](skills/principle-preserve-behavior/SKILL.md) | Behavior-preserving transformations load semantic, evaluation-order, and side-effect guidance. |
| Interface principle | [Production Interfaces](skills/principle-production-interfaces/SKILL.md) | Interface, abstraction, helper, or test-design decisions load production-contract guidance. |
| Scoped procedure | [Delivery](skills/delivery/SKILL.md) | Main loads repository delivery procedures before repository changes or delivery. |
| Scoped procedure | [Fix-Queue Delivery](skills/fix-queue-delivery/SKILL.md) | Queue owners deliver an assigned repository queue with serialized integration and acceptance-based closure. |
| Scoped procedure | [Astra Dual Review](skills/astra-dual-review/SKILL.md) | Explicit dual-host assignments end with independently verified findings, issue readbacks, and separate resolution handoffs. |
| Scoped procedure | [Workflow](skills/workflow/SKILL.md) | Claude Main loads native Workflow procedures for the host reference's selection conditions. |
| Scoped procedure | [Writing](skills/writing/SKILL.md) | Prose and Markdown work loads writing guidance. |
| Scoped procedure | [Instruction Authoring](skills/instruction-authoring/SKILL.md) | Instruction work loads task-contract design, source separation, and loading-boundary guidance. |
| Scoped procedure | [Verification](skills/verification/SKILL.md) | Behavior changes, performance claims, and reproductions load runtime evidence guidance. |
| Scoped procedure | [Memory Maintenance](skills/memory-maintenance/SKILL.md) | Authorized durable memory changes load existing-record review and reconciliation guidance. |
| Scoped procedure | [Codex Scoped Cleanup](skills/codex-scoped-cleanup/SKILL.md) | Codex resource retirement loads the bundled lifecycle and attachment procedures. |

[Development](skills/development/SKILL.md) names each playbook's read trigger and the supported language references.
The principle skills own existing engineering constraints rather than adding lint enforcement.
Writing owns prose, while Instruction Authoring owns agent-facing prompt contracts and example separation.
Consumer links and required resources stay bundled, without another plugin dependency or required online research.

Manual role loading also loads the active host reference unless its complete content is already present.
Manual invocation changes neither the session's role nor its dispatch authority.
The host adapters list invocation forms and host-specific availability.

### Application Verification

The conditional [Verification skill](skills/verification/SKILL.md) owns runtime reproduction and acceptance evidence selection.
The maintainer [verification map](docs/verification-map.md) connects Workgraph behavior to existing checks and their limits.
Passing source or hook checks does not establish installed activation, interactive invocation, or model adherence.

## Hook Errors

Invalid hook arguments exit with code 2.
Missing, unreadable, or empty instruction files exit with code 1 and produce no context.
Missing or unclosed skill frontmatter and empty skill bodies also exit with code 1.
These failures do not prevent Claude Code from starting a session or subagent.
Inspect the hook error notice if instructions fail to load.

## Development

Use pnpm and the Node version range in `package.json` for development.
Development tools require Node.js 24.15 or later within major version 24.
This requirement is separate from the Node.js 18 minimum for hook execution.
Install the pnpm version declared by `packageManager` before installing the pinned development tools.

```sh
pnpm install --frozen-lockfile
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
Both declarations are required for an explicit matching release across hosts.

1. Set the same new release number in both host descriptors.
2. Run the applicable checks from the auto-injected repository guidance, including both plugin validators.
3. Inspect the complete diff and confirm both version fields match.
4. Commit the changes and versions together.
5. Push the authorized distribution branch and confirm the remote contains the commit.

A working-branch push reaches installed users only when their marketplace source tracks that branch.
Follow the authorized repository release process to update the distribution branch.
Use the [Claude Code](docs/harness/claude-code.md#updates) or [Codex](docs/harness/codex.md#updates) adapter for installed-plugin updates and fresh-session checks.
