---
name: development
description: Use for source work, application runs, behavior reproduction, or acceptance evidence.
disable-model-invocation: true
---

# Development

Apply repository rules, lint configuration, and existing tools before these defaults.
Honor user choices within task authority, required checks, and host capabilities.
Read matching playbooks and references before use, skipping complete content already loaded.
For JavaScript or TypeScript, also read [shared Node guidance](references/nodejs.md).

## Development lifecycle

Before editing, identify the behavior contract, affected consumers, exclusions, and acceptance evidence in context or an existing task record.
Inspect affected code and stop discovery when evidence supports the smallest safe change.
For bounded work, avoid optional review ceremony, speculative sweeps, and precautionary pauses.
Retain rigor for irreversible, high-risk, or complex work and all safety, authority, and project gates.

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
Prefer immutable bindings and minimize mutable state.

### Keep design proportional

Prefer existing interfaces, direct data flow, and the smallest coherent required change.
Add layers, helpers, options, dependencies, or fallbacks for concrete needs the existing design cannot handle simply.
Avoid speculative extension points and parallel implementations for hypothetical needs.
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
Use existing types, schemas, lint rules, or build checks for mechanical requirements.
Keep judgment-dependent decisions in concise instructions instead of duplicating executable checks.
Preserve lint and formatter choices when adding guidance or filling configuration gaps.

When selecting, developing, configuring, or assessing authorized lint tools, rules, or fixes, read [lint rule guidance](references/lint-rules.md).

## Verification

Identify the target, trigger, input, and observable expected outcome.
Use existing public interfaces at the lowest layer that exercises the failure.
Keep process and application checks for execution, integration, state, or external behavior that direct calls cannot establish.
Extend the nearest meaningful check for an uncovered requirement or realistic failure, with expectations independent of the implementation.
Reserve source-shape assertions for explicit structural contracts.
Exercise real owned behavior, substituting external or nondeterministic boundaries only when controlled input is needed.
Remove duplicate assertions, fixtures, and runs when retained checks catch the same failures.
Preserve security, external-input, and data-integrity coverage without test-count or coverage-percentage targets.
Use repeatable inputs for stateful failures.
Consider model checking when consequential transitions or interleavings remain untested by examples.
Stop when required gates and changed risks have sufficient evidence, unless a concrete failure requires more.
Record commands, setup, exit status, failures, and raw results separately from interpretation, using traces or screenshots when needed.
Measure slow checks before authorized optimization and report durations, conditions, and preserved coverage.
Leave execution, formal proof, native activation, and model adherence unverified without direct evidence.
Report required checks blocked by the host.
Create a focused feature map only for repeated reports or navigation needs, beside verification instructions, and update affected entries.
