# Kotlin

Declare exactly one top-level type per file.
Use braces for every `if` and `else` branch, including one-line branches.
Prefer imports over fully qualified types when name resolution remains unchanged.
Keep wildcard imports and retain qualified names when collisions or uncertain resolution require them.

Preserve aliases that resolve name collisions.

## Declaration order

Within each kind, order declarations by public, protected, internal, and private visibility.
Put overridden members first within each visibility group.
Apply this order recursively inside companion objects.

1. Companion object declaration
2. Instance properties
3. Init blocks
4. Constructors
5. Member functions
6. Non-companion object declarations
7. Nested interfaces
8. Data classes
9. Nested classes, including value classes
10. Nested enums

Put all static members, including constants and factory functions, inside the companion object.
Count the companion object declaration as a whole at slot 1.

## Declarations and documentation

Document effective public and protected declarations with multiline KDoc.
Account for enclosing `internal` and `private` scopes when determining visibility.
Put `/**` and `*/` on separate lines, with meaningful sentences on `*` lines.
Move top-level `val` and `fun` declarations into a class or object.
Give class, object, and companion object properties explicit types.
Use `val` for bindings that do not require reassignment.
Minimize `var` and `Mutable*` types.
Scope necessary mutation to `buildList`, `buildSet`, and `buildMap` builders.
Leave no blank lines in function bodies except between test components or where configured lint requires them.
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

Import only type-level names and top-level functions.
Keep top-level function imports in the import list.
Do not import members.
Scope companion object and object members with `with(TypeName)` at the use site.

## Expressions and control flow

Use expression bodies when return types, `Unit` behavior, nullability, and API semantics stay unchanged.
Use callable or property references for simple delegation or access lambdas when types, overload selection, and receivers stay unchanged.
Meet functional requirements for receiver evaluation, captures, nullability, and lambda adaptation.
Split pure independent predicates into chained `filter` or nullable `takeIf` calls when functional requirements are met.
Meet functional requirements for smart casts, nullability, effects, exceptions, allocations, and performance.
Keep negative or mixed-polarity predicates together when splitting would change their logic.
Use sequences only when lazy evaluation matches the contract.
Use `?.let` or an equivalent safe call for null-present work when functional requirements are met.
Meet functional requirements for stable values, getter evaluation, smart casts, nullable-result and Elvis behavior, captures, and non-local returns.
Use the captured non-null value instead of rereading a nullable property when it meets functional requirements.
Keep required validation and failure behavior explicit.
Rewrite an else-terminated `if` chain as `when` when every branch yields a value.
Prefer subject-based `when` and map branches to value comparisons where they apply.
Treat `when (expression) { true -> … else -> … }` as a valid subject form.
When a branch would consist only of `return` or `Unit`, the chain is not value-terminated.
Keep or roll back to `if` without that branch.
Use `=== null` and `!== null` for null checks when repository lint permits this style.
Prefer `requireNotNull` for required arguments and `checkNotNull` for required state, preserving exception and return behavior.

## Registered components

Declare required dependency and configuration constructor parameters as non-null, without fallback defaults.
Treat missing required registration values as startup failures.
Keep configuration values in configuration sources.
Use `@ConfigurationProperties` and `application.yaml` for Spring Boot configuration binding when the project uses them.
Represent optional behavior through explicit strategies when composition requires distinct behavior.

## Standard library

Prefer Kotlin standard-library types and convert only at the Java API boundary.
For example, pass `30.minutes.toJavaDuration()` to a Java API that takes a Java duration.

## Strings and paths

Use raw strings for regular expressions, JSON fixtures, and multiline code text.
Use `trimIndent()` for multiline code text only when its result matches the intended indentation and newline data.
Preserve indentation, newline data, interpolation, and trailing newlines when changing string form.
Prefer direct string helpers, then `String.toRegex()` when a regular expression is required.
Keep `java.nio.file.Path` as the path type and prefer supported `kotlin.io.path` operations.
Use the imported `div` operator for child paths when it preserves `resolve` semantics.
Preserve results, exceptions, filtering callbacks, options, and resource handling when replacing Java file operations.
Keep Java methods when no Kotlin equivalent satisfies the contract.

## Tooling

For authorized Kotlin lint automation, prefer ktlint built-in rules.
For unused imports and body comments, see the [adoptable Kotlin lint checks](#kotlin-body-comments).
For that automation, use ktlint's supported custom-rule API when built-ins cannot express a safe requirement.
Verify compatibility with the project's ktlint version before implementing custom rules or fixes.
Check Kotlin, Gradle, JVM, ktlint engine, and plugin compatibility together before selecting versions.
Stay within Kotlin's officially supported Gradle range even when a newer stable Gradle release exists.
Attach custom rulesets to the consumer's actual ktlint runtime instead of relying on `buildSrc` visibility.
Verify native consumer lint reports a disposable violation before accepting a ruleset integration.

Restrict syntax-only import rules to type references and leave expression receiver chains unchanged.
Verify resolution beyond the current file before accepting import fixes from rules without compiler symbol information.
Review import conversion and control-flow changes for semantic equivalence.

### Adopt ktlint checks

For a fresh project, copy the bundled [Kotlin .editorconfig](../assets/gradle/.editorconfig) to the consumer root.
The standard ktlint rules can run independently.
For an existing project, merge only the selected entries into its Kotlin section and retain its other rules and formatter settings.
The [ktlint 1.8.0 documentation](https://github.com/ktlint/ktlint/blob/1.8.0/documentation/release-latest/docs/install/cli.md#rule-configuration-editorconfig) describes normal EditorConfig lookup.

For a standalone project, copy the whole Kotlin sample from the directory containing its [root build](../assets/gradle/build.gradle.kts).
Include the [wrapper](../assets/gradle/gradlew), the [default catalog](../assets/gradle/gradle/libs.versions.toml), the [buildSrc build](../assets/gradle/buildSrc/build.gradle.kts), and its complete sources and [provider registration](../assets/gradle/buildSrc/src/main/resources/META-INF/services/com.pinterest.ktlint.cli.ruleset.core.api.RuleSetProviderV3).
Keep the bundled [MIT notice](../assets/gradle/LICENSE), [Apache-2.0 license](../assets/gradle/LICENSE-APACHE), and [attribution](../assets/gradle/NOTICE).
Use JDK 21 or later.

```sh
./gradlew ktlintCheck
```

Gradle builds `buildSrc` before the sample and the root build adds its managed output to ktlint's worker classpath via `ktlintRuleset`.
When merging into an existing Gradle project, keep its own catalog and settings, merge only the needed entries from the sample, and attach the ruleset via the existing plugin configuration.
Compare the selected engine version with the ruleset's compile-only API dependencies.
Run the consumer's normal lint command on conforming and violating sources.

## Kotlin body comments

The `comments:no-body-comments` rule flags loose line, block, and unattached KDoc comments inside function bodies and lambdas.
It preserves KDoc attached to declarations and known IDE, formatter, region, ktlint, and legal markers.
The built-in `standard:no-unused-imports` rule checks a separate dead-source case.
Keep imports required for name resolution and review deletion suggestions from syntax-only checks.

Matching code in `Label.kt` has a block comment inside a lambda.

```kotlin
object Labels {
    fun trim(names: List<String>): List<String> =
        names.map { name ->
            /* The old adapter used to trim here. */
            name.trim()
        }
}
```

The same file passes the comments rule with declared documentation and a raw string whose content resembles a comment.

```kotlin
object Labels {
    /** Trims each input without changing its position in the list. */
    fun trim(names: List<String>): List<String> = names.map(String::trim)

    val example: String = """/* text */"""
}
```

The rule supplies diagnostics without moving or deleting code.
Review detached constraints and confirm their external caller before relocating them.

## Kotest

### Specs

Share immutable fixtures only when reuse is required and sharing preserves behavior.
Keep per-test state local and preserve initialization order, parallel isolation, and captured values.
A `val` binding alone does not make its referenced object immutable or safe to share.
Expose injected dependencies through explicit parameters or appropriate extension functions.
Keep stateful fixtures scoped to their required lifecycle.

### Assertions

Use `shouldNotBeNull()` and `shouldBeTrue()` for null and Boolean assertions in place of `requireNotNull`, `checkNotNull`, `require`, `check`, or safe-call substitutes.
Use `shouldBeTypeOf` or `shouldBeInstanceOf` in place of `as` casts.

Wrap only the smallest expression under test in broad exception assertions such as `shouldThrowAny` and `shouldNotThrowAny`.
Keep whole test bodies and larger blocks outside these assertions.
For example, `shouldNotThrowAny { parser.parse(input) }` shows that parsing must complete without throwing.

Use soft assertions when the test requires aggregated failures rather than fail-fast behavior.
For soft assertions with a shared subject, use `assertSoftly(subject)`.
Use `assertSoftly { ... }` when the group has no common receiver.
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
Inline single-use values, including an `assertSoftly` subject, only when readability, setup timing, effects, evaluation order, resource lifetime, mock verification order, and fixture isolation remain unchanged.

This example uses the consumer's Kotest runner and assertions dependencies.

```kotlin
import io.kotest.assertions.assertSoftly
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class LabelsSpec : FunSpec({
    test("trims a label without dropping it") {
        assertSoftly(listOf(" desk ".trim())) {
            shouldHaveSize(1)
            first() shouldBe "desk"
        }
    }
})
```
