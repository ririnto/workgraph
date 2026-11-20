---
name: development
description: Use for source work, application runs, behavior reproduction, or acceptance evidence.
disable-model-invocation: true
---

# Development

Follow repository rules, lint, tools, and user choices within task authority, required checks, and host limits.
For source, build, or tool changes, read matching playbooks and language references unless loaded.
Read [Node.js](references/nodejs.md) for lint or dependency advisories.
Read [control flow](references/control-flow.md) for new or changed loops.
Read [Kotest](references/kotest.md) for specs or assertions.

## Development lifecycle

Identify contracts, consumers, exclusions, and acceptance evidence before editing.
Read [instruction design](references/instruction-design.md) for agent instructions.
Inspect affected code until evidence supports the smallest safe change.
Stay in scope.
Keep required checks.

| Outcome | Playbook |
| --- | --- |
| New or changed behavior | [Feature](playbooks/feature.md) |
| Reported defect | [Bug fix](playbooks/bug-fix.md) |
| Behavior-preserving structural change | [Refactoring](playbooks/refactoring.md) |
| Performance investigation or optimization | [Performance](playbooks/performance.md) |

Verify coherent units before dependent work.
Check the full diff for unsupported guards, dead compatibility paths, and unrelated edits before publishing.

| Language | Source | Reference |
| --- | --- | --- |
| Java | `.java` | [Java and Kotlin](references/java-kotlin.md) |
| Kotlin | `.kt`, `.kts` | [Java and Kotlin](references/java-kotlin.md) |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` | [JS/TS](references/js-ts.md) |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` | [JS/TS](references/js-ts.md) |
| Python | `.py` | [Python](references/python.md) |
| Go | `.go` | [Go](references/go.md) |
| Rust | `.rs`, Cargo manifests, Rust toolchain and lint configuration | [Rust](references/rust.md) |
| Shell | Scripts and maintained commands | [Shell](references/shell.md) |

## Shared code style

Exempt externally maintained files and configs (such as Gradle and Maven wrappers) from style defaults.
Limit style cleanup to the external contribution diff unless authorized to expand it.

Preserve declared runtime, toolchain, public contracts, and required failure behavior.
Keep required effects, resource lifetimes, and interfaces in transformations.
Test via production interfaces without exposing internals or adding test-only hooks.
Replace superseded code and consumers together.
Remove obsolete paths.
Revise or remove code rules at their source.
Add no opposing rules.
Avoid copying nearby workarounds.
Use suitable official SDK or framework properties directly.
Skip duplicate input checks when the operation's rejection meets the contract.
Prefer immutable bindings and minimal mutable state.
Subject to configured lint, inline single-use variables and keep single-use logic inline.
When inlining, preserve observable effects, resource lifetimes, evaluation contracts, and required interfaces.

Expand single-line control-flow bodies to a block on separate lines, even when the language permits the one-line form.
Apply this in every language and script, including PowerShell.
Indentation width follows the project's configured formatter or convention.

### Keep design proportional

Prefer existing interfaces, direct data flow, and native commands and help over wrappers or custom usage.
Keep required targets explicit.
Add abstractions, dependencies, or fallbacks only for concrete unmet needs.
Skip unrealistic edge cases in code and tests.
Revisit data and ownership before adding complexity.

### Extract regex matches

Prefer native named captures, backreferences, and replacement references if the engine and interface support them.
Use positional groups if required.
Use supported forms if names are unavailable.
Prefer a clearer existing parser or literal operation without needless wrappers.
Array indexing alone does not access regex captures.

## Documentation and comments

Follow project doc and comment norms.
Prefer explanatory names, types, and small functions.
Comment on contracts and reasons code cannot express.
Preserve declaration attachment, directives, licenses, and safety invariants.
Remove stale workaround comments in changed code.

## Side-effect boundaries

Verify preserved or accepted new behavior in authorized changes with targeted evidence.
Use prose when automation cannot preserve the contract.
Report material behavior changes and remaining uncertainty.

| Item | What to check |
| --- | --- |
| Comment changes | Directives, declaration attachment, tooling, public contracts, and safety information. |
| Explanatory logging | Runtime effects, cost, and information exposure. |
| Await instead of void | Scheduling, callback contracts, rejection handling, and cancellation. |
| Early-exit inversion | Functional requirements, cleanup, cost, and security checks. |
| Dependency changes | Resolution, runtime requirements, and supported APIs. |
| Rule rollout | Target-specific classification and behavior. |
| Structured validation identifiers | Keep observable diagnostics and error contracts, migrating consumers together if authorized. |

## Dependency versions

Prefer officially supported LTS releases.
Use stable releases if no LTS line exists.
Verify current support and runtime, toolchain, and dependent API compatibility.
Use native catalogs and lockfiles.
Keep compatible managed versions.
Skip unrelated upgrades.
Keep integrity checks, lockfile fields, signatures, and checksums.

## Automation

Fix recurring data ownership and interface defects first.
Use existing types, schemas, lint, or build checks for mechanical requirements.
Keep judgment in prose without duplicating executable checks.
Keep lint and formatter choices when adding guidance or filling config gaps.
Use project commands for routine local and CI work.
Keep supported automation declarative.
Use the project language only for substantial logic existing tools lack.

Read [lint rule guidance](references/lint-rules.md) for lint rules or fixes.

## Verification

Identify the target, trigger, input, and expected observable result.
Check the lowest public interface that exercises the failure.
Use process or app checks when direct calls cannot show the behavior.
Reuse checks that exercise the change.
Add or extend tests only for requested or required cases or realistic regressions the suite misses.
Reserve source-shape assertions for explicit structural contracts.
Exercise owned behavior, substituting external or nondeterministic boundaries only for controlled input.
Remove redundant or low-value tests, fixtures, and runs within scope, preserving relevant failure coverage.
Preserve security, external-input, and data-integrity coverage without test-count or coverage-percentage targets.
Use repeatable inputs for stateful failures.
Consider model checking when consequential transitions or interleavings remain untested by examples.
Stop when required checks and changed risks have sufficient evidence.
Wait for long-running checks in the tool's blocking mode.
Use `gh run watch --exit-status` for CI, `gh pr checks --watch` for PR checks, or the tool's wait flag when available.
Do not loop snapshot commands such as `gh run view` or `glab ci status` on a timer.
Record commands, setup, exit status, failures, and raw results apart from interpretation.
Compare visual changes at the intended size with the supplied reference or design.
Exercise interactive changes on the target surface and observe the result.
Keep traces or screenshots when needed.
Before optimizing slow checks, measure them and report conditions, durations, and preserved coverage.
Leave execution, formal proof, native activation, and model adherence unverified without direct evidence.
Report required checks blocked by the host.
Keep a feature map beside verification instructions only for recurring reporting or navigation needs, and update affected entries.
