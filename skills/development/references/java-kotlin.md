# Java and Kotlin

## Shared style

Declare exactly one top-level type per file.
Use braces for every `if` and `else` branch, including one-line branches.
In Java, extend that rule to all control-flow blocks.

Prefer imports over fully qualified type names when name resolution remains unchanged.
Preserve wildcard imports and meaningful Kotlin aliases that resolve name collisions.
Keep qualified names when collisions or uncertain resolution require them.

## Declaration order

Order declarations by kind using the language's list below.
Within each kind, sort by visibility in public, protected, internal, and private order.
In Java, use package-private visibility between protected and private in place of internal.
Within each visibility group, put overridden members first.
Apply the same order recursively inside companion objects.
Kotlin data classes and Java records correspond at slot 8.

## Java

### Java declaration order

1. Static fields
2. Instance fields
3. Instance initializers
4. Constructors
5. Static methods
6. Instance methods
7. Nested interfaces
8. Records
9. Nested classes
10. Nested enums

### Java declarations and documentation

Use Javadoc for effective public and protected declarations, including constructors, fields, and implicitly public interface members.
State contracts and constraints without restating names or signatures.

Use lower camel case for values and upper camel case for types.
Preserve names required by overridden contracts and `_` for language-supported unnamed bindings.
Prefer final fields and local bindings when mutation is unnecessary.

Use the project's structured logger instead of `System.out` or `System.err` for application diagnostics.

Keep package names, module names, coordinates, source sets, and build tasks within the requested scope.
Introduce records, sealed types, pattern matching, or switch expressions only when the declared release supports them.
Prefer stable syntax over preview features.

### Java tooling

Preserve existing Java tooling, including Spotless with Palantir Java Format and Checkstyle when selected.
Check formatter, checker, build-tool, and lint-runtime compatibility separately from the compilation target.

Review multiline Javadoc, meaningful documentation, and method-body spacing beyond the selected tools' proven coverage.
Do not treat lexical logging patterns as semantic checks because text blocks and shadowed names can produce false positives.

## Kotlin

### Kotlin declaration order

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

### Kotlin declarations and documentation

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

### Kotlin imports

Import only type-level names and top-level functions.
Keep top-level function imports in the import list.
Do not import members.
Scope companion object and object members with `with(TypeName)` at the use site.

### Kotlin expressions and control flow

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

### Kotlin registered components

Declare required dependency and configuration constructor parameters as non-null, without fallback defaults.
Treat missing required registration values as startup failures.
Keep configuration values in configuration sources.
Use `@ConfigurationProperties` and `application.yaml` for Spring Boot configuration binding when the project uses them.
Represent optional behavior through explicit strategies when composition requires distinct behavior.

### Kotlin standard library

Prefer Kotlin standard-library types and convert only at the Java API boundary.
For example, pass `30.minutes.toJavaDuration()` to a Java API that takes a Java duration.

### Kotlin strings and paths

Use raw strings for regular expressions, JSON fixtures, and multiline code text.
Use `trimIndent()` for multiline code text only when its result matches the intended indentation and newline data.
Preserve indentation, newline data, interpolation, and trailing newlines when changing string form.
Prefer direct string helpers, then `String.toRegex()` when a regular expression is required.
Keep `java.nio.file.Path` as the path type and prefer supported `kotlin.io.path` operations.
Use the imported `div` operator for child paths when it preserves `resolve` semantics.
Preserve results, exceptions, filtering callbacks, options, and resource handling when replacing Java file operations.
Keep Java methods when no Kotlin equivalent satisfies the contract.

### Kotlin tooling

For authorized Kotlin lint automation, prefer ktlint built-in rules.
For unused imports and body comments, see the [adoptable Kotlin lint checks](lint-kotlin.md).
For that automation, use ktlint's supported custom-rule API when built-ins cannot express a safe requirement.
Verify compatibility with the project's ktlint version before implementing custom rules or fixes.
Check Kotlin, Gradle, JVM, ktlint engine, and plugin compatibility together before selecting versions.
Stay within Kotlin's officially supported Gradle range even when a newer stable Gradle release exists.
Attach custom rulesets to the consumer's actual ktlint runtime instead of relying on `buildSrc` visibility.
Verify native consumer lint reports a disposable violation before accepting a ruleset integration.

## Shared tooling

Map rules between languages only where the target syntax and selected tool support a safe equivalent.
Keep Kotlin-only constructs and unsupported trailing commas out of Java rule translations.
Restrict syntax-only import rules to type references and leave expression receiver chains unchanged.
Verify resolution beyond the current file before accepting import fixes from rules without compiler symbol information.
Review import conversion and control-flow changes for semantic equivalence.
