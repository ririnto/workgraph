# Kotlin

## Declarations and documentation

Document effective public and protected declarations with multiline KDoc.
Account for enclosing `internal` and `private` scopes when determining visibility.
Put `/**` and `*/` on separate lines, with meaningful sentences on `*` lines.
Give class, object, companion object, and private top-level properties explicit types.
Use `val` for bindings that do not require reassignment.
When a generic-producing call initializes a variable, prefer an explicit type on the variable declaration.
This lets the initializer infer it.
For example, prefer `val captured: CapturingSlot<String> = slot()` to `val captured = slot<String>()`.
Preserve the exact type, nullability, variance, overload selection, and inference.
Keep generic arguments when reified or uninferable parameters require them.
Do not add casts as inference workarounds.
When safe single-use inlining removes the variable, do not introduce one solely to relocate type arguments.
Name lambda parameters for their roles, using `_` only for unused parameters.
Avoid leading underscores in declaration names while preserving `override`, `open`, `abstract`, and interface contracts.

## Imports

Prefer imports over fully qualified type names when name resolution remains unchanged.
Preserve wildcard imports and meaningful aliases that resolve name collisions.
Keep qualified names when declarations, imports, aliases, same-package symbols, or existing unqualified uses make resolution uncertain.

## Expressions and control flow

Use expression bodies when return types, `Unit` behavior, nullability, and API semantics stay unchanged.
Use callable or property references for simple delegation or access lambdas when types, overload selection, and receivers stay unchanged.
Preserve receiver evaluation timing, captures, nullability, and required lambda adaptation.
Split pure independent predicates into chained `filter` or nullable `takeIf` calls when behavior stays unchanged.
Preserve condition order, smart casts, nullability, effects, exceptions, allocations, and required performance.
Keep negative or mixed-polarity predicates together when splitting would change their logic.
Use sequences only when lazy evaluation matches the contract.
Use `?.let` or an equivalent safe call for null-present work when behavior stays unchanged.
Preserve stable-value semantics, getter evaluation count, smart casts, nullable-result and Elvis behavior, captures, and non-local returns.
Use the captured non-null value instead of rereading a nullable property when access timing and getter evaluation stay equivalent.
Keep required validation and failure behavior explicit.
Use subject-based `when` for complete comparisons of one stable subject when semantics match.
Use braces for every `if` and `else` branch.
Use `=== null` and `!== null` for null checks when repository lint permits this style.
Prefer `requireNotNull` for required arguments and `checkNotNull` for required state, preserving exception and return behavior.

## Registered components

Declare required dependency and configuration constructor parameters as non-null, without fallback defaults.
Treat missing required registration values as startup failures.
Keep configuration values in configuration sources.
Use `@ConfigurationProperties` and `application.yaml` for Spring Boot configuration binding when the project uses them.
Represent optional behavior through explicit strategies when composition requires distinct behavior.

## Strings and paths

Use raw strings for regular expressions, JSON fixtures, and multiline code text.
Use `trimIndent()` for multiline code text only when its result matches the intended indentation and newline data.
Preserve indentation, newline data, interpolation, and trailing newlines when changing string form.
Prefer direct string helpers, then `String.toRegex()` when a regular expression is required.
Keep `java.nio.file.Path` as the path type and prefer supported `kotlin.io.path` operations.
Use the imported `div` operator for child paths when it preserves `resolve` semantics.
Preserve results, exceptions, filtering callbacks, options, and resource handling when replacing Java file operations.
Keep Java methods when no Kotlin equivalent satisfies the contract.

## Kotest

When creating or changing Kotest specs or assertions, read [Kotest guidance](kotest.md) unless fully loaded.

## Tooling

For authorized Kotlin lint automation, prefer ktlint built-in rules.
For that automation, use ktlint's supported custom-rule API when built-ins cannot express a safe requirement.
Verify compatibility with the project's ktlint version before implementing custom rules or fixes.
Check Kotlin, Gradle, JVM, ktlint engine, and plugin compatibility together before selecting versions.
Stay within Kotlin's officially supported Gradle range even when a newer stable Gradle release exists.
Attach custom rulesets to the consumer's actual ktlint runtime instead of relying on `buildSrc` visibility.
Verify native consumer lint reports a disposable violation before accepting a ruleset integration.

Restrict syntax-only import rules to type references and leave expression receiver chains unchanged.
Verify resolution beyond the current file before accepting import fixes from rules without compiler symbol information.
