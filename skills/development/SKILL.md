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
For shared rules, read the [engineering rule map](references/engineering-rule-map.md).
Use evidence from affected code to choose the smallest safe change within scope.
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

Use standard ecosystem paths outside production for tests, Storybook stories, and other non-production code.
Move misplaced files in their original task.
For unclear paths, use official guidance and note why.
Use `compose.yaml` for Docker Compose.

Replace superseded code and consumers together and remove obsolete paths.
Revise or remove code rules at their source without adding opposing rules.
Avoid copying workarounds.
Use suitable official SDK or framework properties.
Skip duplicate checks when the operation rejects input as required.
Prefer immutable bindings and minimal mutable state.
Subject to configured lint, inline single-use variables and keep single-use logic inline.
When inlining, preserve observable effects, resource lifetimes, evaluation contracts, and required interfaces.

Expand single-line control-flow bodies to a block on separate lines, even when the language permits the one-line form.
Apply this in every language and script, including PowerShell.
Indentation width follows the project's configured formatter or convention.

### Keep design proportional

Prefer existing interfaces, direct data flow, native commands, and built-in help.
Keep required targets explicit.
Add abstractions, dependencies, or fallbacks only for unmet needs.
Skip unrealistic edge cases in code and tests.
Revisit data and ownership before adding complexity.

### Extract regex matches

Prefer native named captures, backreferences, and replacement references if the engine and interface support them.
Use positional groups if required.
Use supported forms if names are unavailable.
Prefer a clearer parser or literal operation without needless wrappers.
Array indexing alone does not access regex captures.

## Documentation and comments

Follow project doc and comment norms.
Prefer explanatory names, types, and small functions.
Comment on contracts and reasons code cannot express.
Preserve declaration attachment, directives, licenses, and safety invariants.
Remove commented-out code, obsolete instructions, and comments that justify a workaround in changed files.
Fix the cause or record an unresolved external constraint with its owner and evidence.
When a correction applies only to the current case, keep its scope local.

## Side-effect boundaries

Verify preserved or approved new behavior with targeted evidence.
Use prose when automation cannot preserve the contract.
Report material behavior changes and remaining uncertainty.

Read [effect checks](references/side-effects.md) for changes to execution, directives, dependencies, or diagnostics.

## Dependency versions

Prefer officially supported LTS releases.
Use stable releases if no LTS line exists.
Verify current support and runtime, toolchain, and dependent API compatibility.
Use native catalogs and lockfiles.
Keep compatible managed versions.
Skip unrelated upgrades.
Keep integrity checks, lockfile fields, signatures, and checksums.

## Automation

Fix recurring ownership and interface defects first.
Use existing types, schemas, lint, or build checks for mechanical requirements.
Keep judgment in prose without duplicating executable checks.
Keep lint and formatter choices when adding guidance or filling config gaps.
Use project commands for routine local and CI work.
Use declarative automation where supported.
Use the project language only for substantial logic existing tools lack.
For recurring corrections, improve the design first and enforce what tools can check.

Read [lint rule guidance](references/lint-rules.md) for lint rules or fixes.
Read [React and Electron boundaries](references/react-electron.md) for effects, timers, or process imports.

## Verification

Identify the target, trigger, input, and expected observable result.
Check the lowest public interface that exercises the failure.
Use process or app checks when direct calls cannot show behavior.
Reuse existing checks that exercise the change.
Use representative inputs or an isolated local fixture when needed to observe the result.
Fix observed in-scope failures and rerun the affected checks.
Add tests or extend coverage only for requests, requirements, or realistic uncovered regressions.
Reserve source-shape assertions for explicit structural contracts.
Exercise owned behavior, substituting external or nondeterministic boundaries only for controlled input.
Remove redundant or low-value tests, fixtures, and runs within scope, preserving relevant failure coverage.
Preserve security, external-input, and data-integrity coverage without count or percentage targets.
Use repeatable inputs for stateful failures.
Consider model checking when consequential transitions or interleavings remain untested by examples.
Stop when evidence covers required checks and changed risks.
Wait in blocking mode.
Use `gh run watch --exit-status`, `gh pr checks --watch`, or the tool's wait flag when available.
Do not poll snapshots such as `gh run view` or `glab ci status`.
Record commands, setup, exit codes, failures, and raw results apart from analysis.
Measure slow checks before optimization and report conditions, durations, and preserved coverage.
Require direct evidence for execution, formal proof, native activation, and model adherence claims.
Report required checks blocked by the host.
Read [runtime and formal evidence](references/runtime-formal-evidence.md) for visual work, user flows, invariants, or release checks.
