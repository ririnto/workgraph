---
name: development
description: Use for source work, running applications, reproducing behavior, or gathering acceptance evidence.
---

# Development

Apply the target repository's rules, lint configuration, and existing tools before these defaults.
Follow explicit user choices within the task's authority, required checks, and supported host capabilities.
Read only matching playbooks and language references unless their complete content is already loaded.
For JavaScript or TypeScript, also read [shared JavaScript and TypeScript guidance](references/nodejs.md) unless already loaded completely.

## Development lifecycle

Choose the lifecycle from the requested outcome before editing.
Record the behavior contract, affected consumers, exclusions, and observable acceptance evidence.
Scale exploration, implementation, and verification to the request.
For a simple, bounded request, use minimal discovery and make the smallest direct change.
Prefer the target's existing checks, adding focused verification when it resolves material uncertainty or required acceptance.
Report any required check left unrun because of host constraints.
Do not add optional review ceremony, speculative sweeps, or precautionary pauses for simple bounded work.
Keep full rigor for irreversible, high-risk, or genuinely complex work while preserving mandatory safety, authority, and target gates.
Inspect the affected implementation and stop discovery once evidence supports the smallest safe change.
Select only the matching playbook and read it before applying its steps unless its complete content is already loaded.

| Outcome | Playbook |
| --- | --- |
| New or changed behavior | [Feature](playbooks/feature.md) |
| Reported defect | [Bug fix](playbooks/bug-fix.md) |
| Behavior-preserving structural change | [Refactoring](playbooks/refactoring.md) |
| Performance investigation or optimization | [Performance](playbooks/performance.md) |

Verify each coherent unit before building dependent work on it.
Review the complete diff for unsupported guards, dead compatibility paths, and unrelated changes before publication.
Main and Delivery retain review, integration, and cleanup authority.

Guidance alone does not authorize tooling changes or changes across consumer projects.

| Language | Source | Reference |
| --- | --- | --- |
| Java | `.java` | [Java](references/java.md) |
| Kotlin | `.kt`, `.kts` | [Kotlin](references/kotlin.md) |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` | [TypeScript](references/typescript.md) |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` | [JavaScript](references/javascript.md) |
| Python | `.py` | [Python](references/python.md) |
| Go | `.go` | [Go](references/go.md) |
| Rust | `.rs` | [Rust](references/rust.md) |
| Shell | Shell scripts and maintained shell commands | [Shell](references/shell.md) |

## Shared code style

Exclude externally maintained files and configurations from these code-style defaults.
Examples include Gradle's `gradlew` and `gradlew.bat`, and Maven's `mvnw` and `mvnw.cmd`.
For external contributions, keep style cleanup within the contribution diff unless the user authorizes broader cleanup.

Preserve the project's declared runtime, toolchain, public contracts, and required failure behavior.
Preserve evaluation order, side effects, resource lifetimes, failure behavior, and required interfaces when transforming code.
Adapt tests to production interfaces without exposing internals or adding hooks solely for tests.
Replace superseded implementations and their consumers together, removing obsolete paths in the same change.
Avoid copying neighboring workarounds because agents copy nearby code as precedent.
Fix recurring causes in code or data architecture first.
Use official SDK or framework properties directly when they satisfy the required behavior.
Prefer immutable bindings and minimize mutable state.

### Extract regex matches

Prefer named regex capture groups, backreferences, and replacement references when the engine and existing interface support them.
Use positional groups when the supported interface or explicit task requires them.
Prefer an existing parser or literal operation when it expresses the requirement more clearly.
Use the language or platform's native named-group facilities instead of adding unnecessary custom wrappers.
Keep the engine's supported form when named groups are unavailable.
Do not treat ordinary array indexing as regex capture access.

## Documentation and comments

Follow the project's documentation and comment conventions.
Preserve declaration attachment, directives, licenses, and safety invariants when changing documentation or comments.
Remove obsolete workaround comments when changing affected code.

## Side-effect boundaries

Treat the following changes as behavior-sensitive work rather than automatic style cleanup.
Implement them when the task authorizes the change and targeted evidence covers preserved behavior or an accepted behavior change.
Keep guidance as policy text when automation cannot preserve the relevant contract.
Record material behavior changes and remaining uncertainty in the task report.

| Item | Validation concern |
| --- | --- |
| Comment removal or relocation | Removing directives or changing documentation attachment can alter tooling, public contracts, or safety information. |
| Explanatory logging | Added runtime calls change effects, cost, and possible information exposure. |
| Await instead of void | Awaiting can change scheduling, callback contracts, rejection handling, and cancellation. |
| Early-exit inversion | Rewriting branches can change evaluation order, cleanup, cost, or security checks. |
| Dependency style and LTS selection | Manifest restructuring or upgrades can change resolution, runtime requirements, and supported APIs. |
| Rule rollout | New diagnostics and fixes can misclassify source or change behavior before target-specific validation. |
| Structured validation identifiers | Replacing exported string diagnostics or bare errors changes observable validator contracts. |
| | - Migrate affected consumers together when the task authorizes that change. |

## Dependency versions

When selecting dependency versions, prefer officially supported LTS releases, or stable releases when no LTS line exists.
Verify current support status and compatibility with the project's runtime, toolchain, and dependent APIs.
Use existing native dependency catalogs and lockfiles, preserving compatible managed versions.
Avoid unrelated upgrades.
Preserve existing integrity checks, including lockfile integrity fields and signature or checksum verification.

## Automation

Use the project's existing formatters, checkers, and test frameworks for ordinary development changes.
Preserve existing lint and formatter choices when adding guidance or filling configuration gaps.

When selecting, developing, configuring, or assessing authorized lint tools, rules, or automatic fixes, read [lint rule guidance](references/lint-rules.md) unless its complete content is already loaded.

## Verification

Identify the target, trigger, input, and observable expected outcome before checking behavior.
Use existing commands and supported entry points, and preserve the project's execution and import boundaries.
Choose tests that exercise the changed behavior and run the application when integration, state, or external behavior matters.
Collect traces, screenshots, results, or timings when tests do not show the outcome.
Record the command, setup, exit status, and raw result separately from interpretation.
Retain failures and unexpected output, and reproduce reports against their stated expectations.
Record measurement conditions for performance claims.
Treat formal proof, native activation, and model adherence as unverified without direct evidence.
Create a focused feature map only when repeated reports or navigation needs warrant one.
Keep the map beside project verification instructions and update affected entries.
When correcting a defect, fix its cause in code or data architecture first.
When needed, a narrow guard may stop new instances of a known bad pattern before separate cleanup of existing debt.
Next, use existing static checks or add meaningful regression checks.
Update rules or skills only when they prevent recurrence, pairing prevention with removal of existing offending patterns where feasible.
Change human-only guides last.
