---
name: development
description: Use when implementing, refactoring, debugging, or reviewing source code or maintained code examples.
---

# Development

Apply the target repository's rules and lint configuration before these defaults.
Read only matching language references unless their complete content is already loaded.
For JavaScript or TypeScript, also read [shared JavaScript and TypeScript guidance](references/nodejs.md) unless already loaded completely.

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
Avoid unnecessary helpers, abstractions, and custom configuration layers.
Use official SDK or framework properties directly when they satisfy the required behavior.
Prefer immutable bindings and minimize mutable state.

Inline single-use local values only when readability, evaluation order, side effects, lifetime, exceptions, and lazy execution stay unchanged.
Also preserve cost, inferred types, overload selection, and captured snapshots.

Prefer condition inversion to reduce mid-function `return`, `continue`, or `break` statements when equivalent behavior stays intact without deeper nesting.

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

Use no explanatory inline comments.
Preserve required semantic comments, including build directives, licenses, suppressions, and safety invariants.
For necessary catch or ignore explanations, use the existing logger's safe debug or trace level when appropriate.
Keep log arguments free of side effects.
Do not add filler logs, expose sensitive values, or change exception propagation, recovery, or control flow.

## Dependency Versions

When selecting dependency versions, prefer officially supported LTS releases, or stable releases when no LTS line exists.
Verify current support status and compatibility with the project's runtime, toolchain, and dependent APIs.
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

If a rule cannot detect violations safely, do not add it.
If only its automatic fix is unsafe, omit the fix and retain only a proven safe diagnostic.
Do not promise automatic fixes that replace `void` with `await`, restructure control flow, or hoist state across lifecycle boundaries.
Adding instructions alone does not authorize lint implementations or changes across consumer repositories.
