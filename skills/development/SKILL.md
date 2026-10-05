---
name: development
description: Use when implementing, refactoring, debugging, or reviewing source code or maintained code examples.
---

# Development

Apply the target repository's rules and lint configuration before these defaults.
Read only matching language references unless their complete content is already loaded.

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
Preserve the project's declared runtime, toolchain, public contracts, and required failure behavior.
Prefer immutable values when mutation is not part of the contract.
Inline single-use values when clarity, evaluation order, cost, type resolution, and captured snapshots stay unchanged.
Keep function bodies free of blank lines and explanatory inline comments.
Keep blank lines between functions and tests.
Document public contracts at their declarations, using the language's documentation syntax.
Use multiline declaration documentation where that syntax supports it.
Minimize mid-function exits without deeper nesting or changes to validation, cleanup, or return behavior.
Use existing formatters, checkers, and test frameworks without introducing replacement tooling for these defaults.
