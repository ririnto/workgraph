# Kotlin

## Declarations And Documentation

Document effective public and protected declarations with multiline KDoc.
Account for enclosing `internal` and `private` scopes when determining visibility.
Put `/**` and `*/` on separate lines, with meaningful sentences on `*` lines.
Give class, object, companion object, and private top-level properties explicit types.
Use `val` for bindings that do not require reassignment.
When a generic-producing call initializes a variable, prefer putting the explicit type on the variable declaration so the initializer can infer it.
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
For new ktlint configurations applying these defaults, set `ktlint_standard_no-wildcard-imports = disabled` in `.editorconfig`.
Keep qualified names when declarations, imports, aliases, same-package symbols, or existing unqualified uses make resolution uncertain.
Restrict syntax-only import rules to type references and leave expression receiver chains unchanged.
Verify resolution beyond the current file before accepting import fixes from rules without compiler symbol information.

## Expressions And Control Flow

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
Use no trailing commas in function and constructor arguments.
Use `=== null` and `!== null` for null checks when repository lint permits this style.
Prefer `requireNotNull` for required arguments and `checkNotNull` for required state, preserving exception and return behavior.

## Registered Components

Declare required dependency and configuration constructor parameters as non-null, without fallback defaults.
Treat missing required registration values as startup failures.
Keep configuration values in configuration sources.
Use `@ConfigurationProperties` and `application.yaml` for Spring Boot configuration binding when the project uses them.
Represent optional behavior through explicit strategies when composition requires distinct behavior.

## Strings And Paths

Use raw strings for regular expressions, JSON fixtures, and multiline code text.
Use `trimIndent()` for multiline code text only when its result matches the intended indentation and newline data.
Preserve indentation, newline data, interpolation, and trailing newlines when changing string form.
Prefer direct string helpers, then `String.toRegex()` when a regular expression is required.
Keep `java.nio.file.Path` as the path type and prefer supported `kotlin.io.path` operations.
Use the imported `div` operator for child paths when it preserves `resolve` semantics.
Preserve results, exceptions, filtering callbacks, options, and resource handling when replacing Java file operations.
Keep Java methods when no Kotlin equivalent satisfies the contract.

## Kotest Specs

Move reusable immutable declarations and functions from Spec superclass-constructor lambdas into a companion object when sharing preserves behavior.
Keep per-test state local and preserve initialization order, parallel isolation, and captured values.
A `val` binding alone does not make its referenced object immutable or safe to share.
Treat `RuleProvider` factories as potentially eager, and do not hoist them based only on syntax.
Expose injected dependencies through explicit parameters or appropriate extension functions.
Keep stateful rule instances scoped to their required lifecycle instead of sharing them unconditionally.
Allow one blank line between a local declaration and the following test block in a Kotest spec.

## Kotest Assertions

Use `assertSoftly(subject)` for consecutive assertions that share a subject, including service objects.
Use `assertSoftly { ... }` for consecutive independent assertions without a common receiver.
Allow nested `assertSoftly` blocks when they clarify groups with different subjects.
Do not use `assertSoftly` for a single assertion or add nested single-assertion wrappers.
Use an existing infix assertion when its explicit receiver is natural and the API supports it.
For example, `collection shouldHaveSize 1` keeps an existing collection receiver explicit.
Inside `assertSoftly(subject)`, use implicit-receiver calls such as `shouldHaveSize(1)`.
Do not add helpers or explicit `this` receivers only to create infix syntax.
Soft assertions intentionally aggregate supported failures and do not preserve fail-fast behavior.
Keep prerequisite assertions outside a soft group when later checks depend on their success.
Use only assertions documented as compatible with the project's Kotest version.
Unsupported Kotest assertions and third-party assertions can fail immediately and prevent later checks from running.
Keep mock verification outside a soft group unless a compatible wrapper preserves its intended behavior.
Preserve receiver binding in nested groups and qualify a receiver only when needed to avoid shadowing.
Keep assertions that depend on coroutine work inside the group after that work completes.
Await structured child work in the surrounding coroutine scope.
Verify assertion-context propagation for the project's Kotest version when assertions cross coroutine dispatchers or context boundaries.
Inline a single-use test value only when construction timing, side effects, readability, resource lifetime, and fixture isolation remain unchanged.
Inline a service used only as the `assertSoftly` subject when its construction or expression can move safely.
Preserve setup timing, evaluation order, resource lifetime, mock verification order, and fixture isolation.

## Automation

For authorized Kotlin lint automation, prefer ktlint built-in rules and use its supported custom-rule API when built-ins cannot express a safe requirement.
Verify compatibility with the project's ktlint version before implementing custom rules or fixes.
Check Kotlin, Gradle, JVM, ktlint engine, and plugin compatibility together before selecting versions.
Stay within Kotlin's officially supported Gradle range even when a newer stable Gradle release exists.
Attach custom rulesets to the consumer's actual ktlint runtime instead of relying on `buildSrc` visibility.
Verify native consumer lint reports a disposable violation before accepting a ruleset integration.
