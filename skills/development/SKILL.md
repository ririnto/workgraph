---
name: development
description: Use for source work, application runs, behavior reproduction, or acceptance evidence.
disable-model-invocation: true
---

# Development

Apply repository rules, lint configuration, and existing tools before these defaults.
Honor user choices within task authority, required checks, and host capabilities.
Read matching playbooks and references before use unless fully loaded.
For JavaScript or TypeScript, also read [shared Node guidance](references/nodejs.md).

## Development lifecycle

Before editing, identify the contract, consumers, exclusions, and acceptance evidence.
Inspect affected code and stop discovery when evidence supports the smallest safe change.
For bounded work, avoid optional review ceremony, speculative sweeps, and precautionary pauses.
Preserve rigor for consequential work and all safety, authority, and project gates.

| Outcome | Playbook |
| --- | --- |
| New or changed behavior | [Feature](playbooks/feature.md) |
| Reported defect | [Bug fix](playbooks/bug-fix.md) |
| Behavior-preserving structural change | [Refactoring](playbooks/refactoring.md) |
| Performance investigation or optimization | [Performance](playbooks/performance.md) |

Verify each coherent unit before dependent work.
Before publication, review the complete diff for unsupported guards, dead compatibility paths, and unrelated changes.

Guidance alone authorizes no tooling or cross-project changes.

| Language | Source | Reference |
| --- | --- | --- |
| Java | `.java` | [Java](references/java.md) |
| Kotlin | `.kt`, `.kts` | [Kotlin](references/kotlin.md) |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` | [TypeScript](references/typescript.md) |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` | [JavaScript](references/javascript.md) |
| Python | `.py` | [Python](references/python.md) |
| Go | `.go` | [Go](references/go.md) |
| Rust | `.rs`, Cargo manifests, Rust toolchain and lint configuration | [Rust](references/rust.md) |
| Shell | Scripts and maintained commands | [Shell](references/shell.md) |

## Shared code style

Exclude externally maintained files and configurations, such as Gradle and Maven wrappers, from style defaults.
Limit external contribution style cleanup to the diff unless broader cleanup is authorized.

Preserve the declared runtime, toolchain, public contracts, and required failure behavior.
During transformations, preserve evaluation order, effects, resource lifetimes, and required interfaces.
Adapt tests to production interfaces without exposing internals or adding test-only hooks.
Replace superseded implementations with their consumers and remove obsolete paths together.
Avoid copying nearby workarounds as precedent.
Use official SDK or framework properties directly when they satisfy the requirement.
Do not duplicate an operation's input checks when its rejection already meets the contract.
Prefer immutable bindings and minimize mutable state.

### Keep design proportional

Prefer existing interfaces, direct data flow, and tool commands and help over wrappers or custom usage output.
Keep required targets explicit, without invented defaults.
Add abstractions, dependencies, or fallbacks only for concrete unmet needs.
Do not implement or test handling for edge cases that cannot realistically occur.
Reconsider data and ownership before adding complexity.

### Extract regex matches

Prefer native named regex captures, backreferences, and replacement references when the engine and interface support them.
Use positional groups when the interface or task requires them, and supported forms when named groups are unavailable.
Prefer an existing parser or literal operation when clearer, without unnecessary custom wrappers.
Do not treat ordinary array indexing as regex capture access.

## Documentation and comments

Follow project documentation and comment conventions.
Prefer names, types, and small functions that explain the code.
Keep comments for contracts and rationale the code cannot express.
Preserve declaration attachment, directives, licenses, and safety invariants.
Remove obsolete workaround comments with affected code changes.

## Side-effect boundaries

Make these changes when authorized and targeted evidence covers preserved or accepted new behavior.
Keep guidance as policy text when automation cannot preserve the contract.
Report material behavior changes and remaining uncertainty.

| Item | Validation concern |
| --- | --- |
| Comment changes | Check directives, declaration attachment, tooling, public contracts, and safety information. |
| Explanatory logging | Check runtime effects, cost, and information exposure. |
| Await instead of void | Check scheduling, callback contracts, rejection handling, and cancellation. |
| Early-exit inversion | Check evaluation order, cleanup, cost, and security checks. |
| Dependency changes | Check resolution, runtime requirements, and supported APIs. |
| Rule rollout | Validate target-specific classification and behavior. |
| Structured validation identifiers | Preserve observable diagnostics and error contracts, migrating consumers together when authorized. |

## Dependency versions

Prefer officially supported LTS dependency releases, or stable releases when no LTS line exists.
Verify current support and compatibility with the runtime, toolchain, and dependent APIs.
Use native catalogs and lockfiles, preserving compatible managed versions and avoiding unrelated upgrades.
Preserve integrity checks, including lockfile fields, signatures, and checksums.

## Automation

Fix recurring defects in data ownership and interfaces first.
Use existing types, schemas, lint, or build checks for mechanical requirements.
Keep judgment in instructions without duplicating executable checks.
Preserve lint and formatter choices when adding guidance or filling configuration gaps.
Use the project's established commands for routine local and CI work.
Keep supported automation declarative, using the project's implementation language only for substantial logic existing tools cannot provide.

When configuring or assessing builds, tools, dependencies, checks, or lint rules and fixes, read [tooling guidance](references/tooling.md).

## Verification

Identify the target, trigger, input, and observable expected outcome.
Use existing public interfaces at the lowest layer that exercises the failure.
Use process or application checks for behavior that direct calls cannot establish.
Extend the nearest check for uncovered requirements or realistic failures, using expectations independent of the implementation.
Reserve source-shape assertions for explicit structural contracts.
Exercise owned behavior, substituting external or nondeterministic boundaries only for controlled input.
Test owned changes and integration risks, not unchanged upstream behavior without a concrete requirement or defect.
Remove duplicate assertions, fixtures, and runs when retained checks catch the same failures.
Within scope, inspect and remove tests with no real requirement or realistic failure.
Preserve security, external-input, and data-integrity coverage without test-count or coverage-percentage targets.
Use repeatable inputs for stateful failures.
Consider model checking when consequential transitions or interleavings remain untested by examples.
Stop when required gates and changed risks have sufficient evidence, unless a concrete failure requires more.
Record commands, setup, exit status, failures, and raw results separately from interpretation.
Retain traces or screenshots when needed.
Before optimizing slow checks, measure them and report conditions, durations, and preserved coverage.
Leave execution, formal proof, native activation, and model adherence unverified without direct evidence.
Report required checks blocked by the host.
Keep a feature map beside verification instructions only for recurring reporting or navigation needs, and update affected entries.
