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
Read [Kotlin's Kotest guidance](references/kotlin.md#kotest) for specs or assertions.

## Side-effect boundaries

Verify preserved or approved new behavior with targeted evidence.
Use prose when automation cannot preserve the contract.
Report material behavior changes and remaining uncertainty.

- For comments, check directives, declaration attachment, tooling, public contracts, and safety information.
- For logging, check effects, cost, and information exposure.
- For async changes, check scheduling, callback contracts, rejections, and cancellation.
- For exit changes, check behavior, cleanup, cost, and security.
- For dependencies, check resolution, runtime requirements, and supported APIs.
- For lint rules, check classification and behavior in each target.
- For diagnostics, preserve observable identifiers and error contracts or migrate consumers together.

## Development lifecycle

Identify contracts, consumers, exclusions, and acceptance evidence.
Read [instruction design](references/instruction-design.md) for agent instructions.
Use source evidence to choose the smallest safe change and keep required checks.

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
| Java | `.java` | [Java](references/java.md) |
| Kotlin | `.kt`, `.kts` | [Kotlin](references/kotlin.md) |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` | [TypeScript](references/typescript.md) |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` | [JavaScript](references/javascript.md) |
| Markdown | `.md` | [Markdown](references/markdown.md) |
| Python | `.py` | [Python](references/python.md) |
| Go | `.go` | [Go](references/go.md) |
| Rust | `.rs`, Cargo manifests, Rust toolchain and lint configuration | [Rust](references/rust.md) |
| Shell | Scripts and maintained commands | [Shell](references/shell.md) |

## Shared code style

Exempt externally maintained files, such as Gradle wrappers, from style defaults.
Limit style cleanup to the contribution diff unless authorized to expand it.

Preserve declared runtimes, toolchains, interfaces, failure behavior, effects, and resource lifetimes.
Test through production interfaces without exposing internals.

Use ecosystem paths outside production for tests, stories, and other non-production code.
Move misplaced files in their original task and consult official guidance for unclear paths.
Use `compose.yaml` for Docker Compose.

Replace superseded code and consumers together and remove obsolete paths.
Revise or remove code rules at their source without adding opposing rules.
Avoid copying workarounds.
Use suitable official SDK or framework properties.
Skip duplicate checks when the operation rejects input as required.
Prefer immutable bindings and minimal mutable state.
Inline single-use bindings and logic when lint permits and effects, lifetimes, evaluation, and interfaces hold.

Expand single-line control-flow bodies to blocks on separate lines in all languages and scripts.
Use the configured indentation.

### Keep design proportional

Prefer existing interfaces, direct data flow, native commands, and built-in help.
Keep required targets explicit and focus on realistic cases.
Revisit data and ownership before adding abstractions, dependencies, or fallbacks.

### Extract regex matches

Use named captures, backreferences, and replacements where supported, including for full matches.
Use positional groups when required by the engine or interface.
Prefer clearer parsers or literal operations.

## Documentation and comments

Follow project comment norms and document contracts or reasons the code cannot express.
Preserve required API and tool documentation, declaration attachment, directives, licenses, and safety invariants.
Remove commented-out code, obsolete instructions, and comments that justify a workaround in changed files.
Fix the cause or record an unresolved external constraint with its owner and evidence.
When a correction applies only to the current case, keep its scope local.

## Dependency versions

Prefer supported LTS releases or stable releases where LTS is unavailable.
Check runtime, toolchain, and API compatibility.
Keep compatible managed versions, native catalogs, lockfiles, and integrity checks.
Skip unrelated upgrades.

## Automation

Fix recurring ownership and interface defects, then enforce mechanical requirements with existing types, schemas, lint, or builds.
Keep judgment in prose and existing lint and formatter choices in configuration.
Use the same project commands locally and in CI.
Prefer declarative automation and reserve project code for logic the tools lack.

Read [React and Electron boundaries](references/react-electron.md) for effects, timers, or process imports.

### Select and adopt lint checks

Choose compatible built-in rules before custom rules.
Scope a custom rule to the recurring syntax or path it checks.
Name the violation and its fix in the diagnostic.
When the project adopts a rule, copy its linked assets into the consumer with their [MIT license notice](../../LICENSE) and any additional license and attribution.
Register consumer-relative paths and merge the settings with existing checks and formatters.
Use the consumer's own versions and read-only commands to verify matching and preserved cases.
For scoped rules, check a violation inside the boundary and an allowed use outside it.
Offer fixes only when they preserve behavior, effects, and directives.
Verify repeated formatting and fixes converge.

## Verification

Identify the target, trigger, input, and expected result.
Use existing checks at the lowest public interface that shows the behavior.
Use a representative fixture and process or app checks when direct calls cannot show it.
Fix observed in-scope failures and rerun the affected checks.
Add tests or extend coverage only for requests, requirements, or realistic uncovered regressions.
Reserve source-shape assertions for explicit structural contracts.
Exercise owned behavior and substitute external or nondeterministic boundaries for controlled input.
Remove redundant checks within scope while preserving security, external-input, data-integrity, and failure coverage.
Use repeatable inputs for stateful failures.
Consider model checking when consequential transitions or interleavings remain untested by examples.
Stop when evidence covers required checks and changed risks.
Wait in blocking mode.
Use `gh run watch --exit-status`, `gh pr checks --watch`, or the tool's wait flag when available.
Do not poll snapshots such as `gh run view` or `glab ci status`.
Record commands, setup, exit codes, failures, and raw results apart from analysis.
Measure slow checks before optimization and report timing, conditions, and preserved coverage.
Require direct evidence for execution, formal proof, native activation, and model adherence.
Report blocked required checks.
Read [runtime and formal evidence](references/runtime-formal-evidence.md) for visual work, user flows, feature maps, invariants, or release checks.
