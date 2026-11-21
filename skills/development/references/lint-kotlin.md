# Kotlin body comments

Use the [local ktlint setup](lint-rules.md#ktlint) for `*.kt` and `*.kts`.
The `comments:no-body-comments` rule flags loose line, block, and unattached KDoc comments inside function bodies and lambdas.
It preserves KDoc attached to declarations and known IDE, formatter, region, ktlint, and legal markers.
The built-in `standard:no-unused-imports` rule checks a separate dead-source case.
Keep imports required for name resolution and review deletion suggestions from syntax-only checks.

Matching code in `Label.kt` has a block comment inside a lambda.

```kotlin
fun labels(names: List<String>) =
    names.map { name ->
        /* The old adapter used to trim here. */
        name.trim()
    }
```

The same file passes the comments rule with declared documentation and a raw string whose content resembles a comment.

```kotlin
/** Trims each input without changing its position in the list. */
fun labels(names: List<String>) = names.map(String::trim)

val example = """/* text */"""
```

The rule supplies diagnostics without moving or deleting code.
Review detached constraints and confirm their external caller before relocating them.
