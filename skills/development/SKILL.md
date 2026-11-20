---
name: development
description: Use for source work, application runs, behavior reproduction, or acceptance evidence.
disable-model-invocation: true
---

# Development

Follow repository rules, lint, tools, and user choices within task authority, required checks, and host capabilities.
Read the matching playbook and language references for source, build, or tool changes unless already loaded.
For Node.js lint tooling or dependency advisories, read [Node.js](references/nodejs.md).
For new or changed loops, read [control flow](references/control-flow.md).
For Kotest specs or assertions, read [Kotest](references/kotest.md).

## Development lifecycle

Identify contracts, consumers, exclusions, and acceptance evidence before editing.
For agent instructions, read [instruction design](references/instruction-design.md).
Inspect affected code and stop discovery when evidence supports the smallest safe change.
Keep bounded work within scope and preserve required checks.

| Outcome | Playbook |
| --- | --- |
| New or changed behavior | [Feature](playbooks/feature.md) |
| Reported defect | [Bug fix](playbooks/bug-fix.md) |
| Behavior-preserving structural change | [Refactoring](playbooks/refactoring.md) |
| Performance investigation or optimization | [Performance](playbooks/performance.md) |

Verify each coherent unit before dependent work.
Before publication, review the complete diff for unsupported guards, dead compatibility paths, and unrelated changes.

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

Exclude externally maintained files and configurations, such as Gradle and Maven wrappers, from style defaults.
Limit external contribution style cleanup to the diff unless broader cleanup is authorized.

Preserve the declared runtime, toolchain, public contracts, and required failure behavior.
Meet required effects, resource lifetimes, and interfaces during transformations.
Adapt tests to production interfaces without exposing internals or adding test-only hooks.
Replace superseded implementations and consumers together, removing obsolete paths.
Revise or remove code rules at their source rather than adding opposite rules.
Avoid copying nearby workarounds as precedent.
Use suitable official SDK or framework properties directly.
Do not duplicate input checks when an operation's rejection meets the contract.
Prefer immutable bindings and minimal mutable state.

### Keep design proportional

Prefer existing interfaces, direct data flow, and tool commands and help over wrappers or custom usage output.
Keep required targets explicit.
Add abstractions, dependencies, or fallbacks only for concrete unmet needs.
Do not implement or test unrealistic edge cases.
Reconsider data and ownership before adding complexity.

### Extract regex matches

Prefer native named regex captures, backreferences, and replacement references when the engine and interface support them.
Use positional groups when required, and supported forms when named groups are unavailable.
Prefer an existing parser or literal operation when clearer, without unnecessary wrappers.
Ordinary array indexing is not regex capture access.

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
| Early-exit inversion | Check functional requirements, cleanup, cost, and security checks. |
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

For lint rules or fixes, read [lint rule guidance](references/lint-rules.md).

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
