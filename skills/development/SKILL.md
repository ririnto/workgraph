---
name: development
description: Use for source work, application runs, behavior reproduction, or acceptance evidence.
---

# Development

Apply repository rules, lint configuration, and existing tools before these defaults.
Honor user choices within task authority, required checks, and host capabilities.
Read matching playbooks and references, skipping complete content already loaded.
For JavaScript or TypeScript, also read [shared Node guidance](references/nodejs.md).

## Development lifecycle

Record the behavior contract, affected consumers, exclusions, and acceptance evidence before editing.
Scale discovery, implementation, and verification to the request.
Inspect affected code and stop discovery when evidence supports the smallest safe change.
For bounded work, avoid optional review ceremony, speculative sweeps, and precautionary pauses.
Retain rigor for irreversible, high-risk, or complex work and all safety, authority, and project gates.
Prefer existing checks, adding focused verification for material uncertainty or required acceptance.
Report required checks blocked by the host.
Read the matching playbook before use.

| Outcome | Playbook |
| --- | --- |
| New or changed behavior | [Feature](playbooks/feature.md) |
| Reported defect | [Bug fix](playbooks/bug-fix.md) |
| Behavior-preserving structural change | [Refactoring](playbooks/refactoring.md) |
| Performance investigation or optimization | [Performance](playbooks/performance.md) |

Verify each coherent unit before dependent work.
Before publication, review the complete diff for unsupported guards, dead compatibility paths, and unrelated changes.
Main and Delivery retain review, integration, and cleanup authority.

Guidance alone authorizes no tooling or cross-project changes.

| Language | Source | Reference |
| --- | --- | --- |
| Java | `.java` | [Java](references/java.md) |
| Kotlin | `.kt`, `.kts` | [Kotlin](references/kotlin.md) |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` | [TypeScript](references/typescript.md) |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` | [JavaScript](references/javascript.md) |
| Python | `.py` | [Python](references/python.md) |
| Go | `.go` | [Go](references/go.md) |
| Rust | `.rs` | [Rust](references/rust.md) |
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
Reconsider data and ownership before adding complexity.

### Extract regex matches

Prefer native named regex captures, backreferences, and replacement references when the engine and interface support them.
Use positional groups when the interface or task requires them, and supported forms when named groups are unavailable.
Prefer an existing parser or literal operation when clearer, without unnecessary custom wrappers.
Do not treat ordinary array indexing as regex capture access.

## Documentation and comments

Follow project documentation and comment conventions.
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
Use native catalogs and lockfiles, preserving compatible managed versions.
Avoid unrelated upgrades.
Preserve integrity checks, including lockfile fields, signatures, and checksums.

## Automation

Use existing formatters, checkers, and test frameworks for ordinary changes.
Preserve lint and formatter choices when adding guidance or filling configuration gaps.

When selecting, developing, configuring, or assessing authorized lint tools, rules, or fixes, read [lint rule guidance](references/lint-rules.md).

## Verification

Identify the target, trigger, input, and observable expected outcome.
Use existing commands and supported entry points, preserving execution and import boundaries.
Test changed behavior and run the application when integration, state, or external behavior matters.
Extend the nearest meaningful check before adding a suite or helper.
For each new test, identify an uncovered realistic failure and derive expected results independently of the implementation.
Prefer consumer-visible outcomes, reserving source-shape assertions for explicit structural contracts.
Structural checks do not prove execution or model adherence.
Exercise real owned behavior, substituting external or nondeterministic boundaries only when controlled input is needed.
Remove redundant checks when retained coverage detects their relevant failures.
Do not invent test-count, code-size ratio, or coverage targets.
Stop expanding verification when required gates and changed risks have sufficient evidence, unless a concrete failure or requirement warrants more.
Collect traces, screenshots, results, or timings when tests do not show outcomes.
Record commands, setup, exit status, and raw results separately from interpretation.
Retain failures and unexpected output, reproducing reports against stated expectations.
Record measurement conditions for performance claims.
Leave formal proof, native activation, and model adherence unverified without direct evidence.
Create a focused feature map only for repeated reports or navigation needs, beside verification instructions, and update affected entries.
Fix defect causes in code or data architecture first.
A narrow guard may prevent new instances of a known bad pattern before separate debt cleanup.
Use existing static checks or meaningful regression checks next.
Update rules or skills to prevent recurrence, removing existing offending patterns where feasible.
Change human-only guides last.
