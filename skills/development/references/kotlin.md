# Kotlin

## Declarations And Documentation

Document effective public and protected declarations with multiline KDoc.
Account for enclosing `internal` and `private` scopes when determining visibility.
Put `/**` and `*/` on separate lines, with meaningful sentences on `*` lines.
Give class, object, companion object, and private top-level properties explicit types.
Use `val` for bindings that do not require reassignment.
Name lambda parameters for their roles, using `_` only for unused parameters.

## Expressions And Control Flow

Use expression bodies when return types, `Unit` behavior, nullability, and API semantics stay unchanged.
Prefer callable references when types, overload selection, receiver binding, and evaluation stay unchanged.
Split pure independent predicates into chained `filter` or nullable `takeIf` calls when behavior stays unchanged.
Preserve condition order, smart casts, nullability, effects, exceptions, allocations, and required performance.
Keep negative or mixed-polarity predicates together when splitting would change their logic.
Use sequences only when lazy evaluation matches the contract.
Use `?.let` with a named non-null parameter for optional nullable work.
Use the captured parameter instead of rereading a nullable property.
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
