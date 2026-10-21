---
name: development
description: Use when implementing, refactoring, debugging, or reviewing source code or maintained code examples.
---

# Development

Apply the target repository's rules and lint configuration before these defaults.
Read only matching playbooks and language references unless their complete content is already loaded.
For JavaScript or TypeScript, also read [shared JavaScript and TypeScript guidance](references/nodejs.md) unless already loaded completely.
Use `.yaml` for YAML files unless the consuming platform requires another exact filename.

## Development Lifecycle

Choose the lifecycle from the requested outcome before editing.
Record the behavior contract, affected consumers, exclusions, and observable acceptance evidence.
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

These procedures guide the user's agent session.
Workgraph carries the user's engineering preferences independently of other plugins.
Keep those preferences self-contained here and in the matching bundled language references.
Apply the target project's rules and existing tools without requiring a Harness installation.
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

## Shared Code Style

Exclude externally maintained files and configurations from these code-style defaults.
Examples include Gradle's `gradlew` and `gradlew.bat`, and Maven's `mvnw` and `mvnw.cmd`.
For external contributions, restrict style cleanup to lines already included in the user's contribution diff.

Preserve the project's declared runtime, toolchain, public contracts, and required failure behavior.
Replace superseded implementations and their consumers together, removing obsolete paths in the same change.
Agents copy nearby code as precedent, so avoid copying neighboring workarounds and fix recurring causes in code or data architecture first.
Use official SDK or framework properties directly when they satisfy the required behavior.
Prefer immutable bindings and minimize mutable state.

Use named regex capture groups and name-based access for extracted matches and subgroups, including the full match.
Use named backreferences and replacement references instead of positional references.
Prefer an existing parser or literal operation when it expresses the requirement more clearly.
Use the language or platform's native named-group facilities instead of adding unnecessary custom wrappers.
If the engine lacks named groups, report that limit.
Do not treat ordinary array indexing as regex capture access.

Before source work, read [Preserve Behavior](../principle-preserve-behavior/SKILL.md) unless its complete content is already loaded.
Before source work, read [Production Interfaces](../principle-production-interfaces/SKILL.md) unless its complete content is already loaded.

## Spacing

Remove blank lines inside functions, except where lint requires them or line breaks carry meaning, including string literals.
Keep exactly one blank line between functions and between sibling test or lifecycle-hook blocks.
Apply that separation inside test callbacks, including `beforeTest`, `afterTest`, `beforeEach`, `afterEach`, and `it` blocks.
The sibling-block separation takes precedence over removing blank lines inside functions.
Do not insert blank lines between object-literal methods or function-valued properties.
This object-literal rule takes precedence over separation between functions.
Preserve required formatter output and meaningful line breaks when these spacing defaults conflict.

## Documentation And Comments

Document effective public, protected, and exported declarations using the language's declaration documentation syntax.
Check implicit visibility, enclosing scopes, re-exports, and default exports when identifying these declarations.
Use multiline declaration documentation where that syntax supports it.
Format documentation comments and docstrings as multiline, even for one sentence, wherever language syntax supports them.
Preserve their text, indentation, declaration attachment, and language-native semantics when formatting or moving them.
Documentation for other declarations is optional unless tooling or a safety contract requires it.

Remove obsolete workaround comments when changing affected code.
General comments are banned.
Use declaration documentation comments when an explanation is needed, rather than general comments.
Preserve required directives, licenses, existing suppressions, and safety invariants expressed as documentation.
Do not add runtime logging calls to preserve an explanation.

## Side-Effect Boundaries

Keep risky preferences as policy text only.
Do not add a lint rule, autofix, or behavior change for an item with side-effect risk.
Record the affected item and reason in the task report.

| Item | Reason to keep it as policy text |
| --- | --- |
| Comment removal or relocation | Removing directives or changing documentation attachment can alter tooling, public contracts, or safety information. |
| Explanatory logging | Added runtime calls change effects, cost, and possible information exposure. |
| Await instead of void | Awaiting can change scheduling, callback contracts, rejection handling, and cancellation. |
| Early-exit inversion | Rewriting branches can change evaluation order, cleanup, cost, or admission and security checks. |
| Dependency style and LTS selection | Manifest restructuring or upgrades can change resolution, runtime requirements, and supported APIs. |
| Rule rollout | New diagnostics and fixes can misclassify source or change behavior before target-specific validation. |
| Structured validation identifiers | Replacing exported string diagnostics or bare errors changes observable validator contracts, so keep migration as policy until those consumers can be migrated safely. |

## Dependency Versions

When selecting dependency versions, prefer officially supported LTS releases, or stable releases when no LTS line exists.
Verify current support status and compatibility with the project's runtime, toolchain, and dependent APIs.
Use existing native dependency catalogs and lockfiles, preserving compatible managed versions.
Avoid unrelated upgrades.
Do not add commit-hash or image-digest pinning as part of version selection.
Preserve existing integrity checks, including lockfile integrity fields and signature or checksum verification.

## Automation

Use the project's existing formatters, checkers, and test frameworks for ordinary development changes.
Preserve existing lint and formatter choices when adding guidance or filling configuration gaps.

For authorized lint setup in projects without an existing lint configuration, use these defaults.

| Language | Default |
| --- | --- |
| Python | Ruff |
| JavaScript and TypeScript | Ultracite, invoking Oxlint and Oxfmt through Ultracite |
| Kotlin | ktlint |
| Go | golangci-lint |

When lint automation is authorized, prefer built-in rules and supported configuration before custom rules.
Use the Kotlin and Node.js tooling guidance in the matching language references.
For other languages, use their existing standard tools.
Verify tool-version support and edge cases before adding a custom rule.
Make rules AST-aware and preserve literals, comments, and automatic semicolon insertion where applicable.

Provide positive and negative fixtures covering intended matches and cases that must remain unchanged.
Offer automatic fixes only when evaluation, side effects, and program behavior remain unchanged.
Verify formatter idempotence and convergence between rule fixes and formatting.
Stage separately authorized rules on representative source before enabling them across the project.
Start with read-only checks and review their reports before any safe-fix rollout.
Do not add suppressions, disable rules, or weaken checks to make a rollout pass.

If a rule cannot detect violations safely, do not add it.
If only its automatic fix is unsafe, omit the fix and retain only a proven safe diagnostic.
Do not promise automatic fixes that replace `void` with `await`, restructure control flow, or hoist state across lifecycle boundaries.
Adding instructions alone does not authorize lint implementations or changes across consumer repositories.

## Verification Routing

For behavioral changes, performance claims, or report reproduction, read Verification unless its complete content is already loaded.
When correcting a defect, fix its cause in code or data architecture first.
When needed, a narrow guard may stop new instances of a known bad pattern before separate cleanup of existing debt.
Next, use existing static checks or add meaningful regression checks.
Update rules or skills only when they prevent recurrence, pairing prevention with removal of existing offending patterns where feasible.
Change human-only guides last.
