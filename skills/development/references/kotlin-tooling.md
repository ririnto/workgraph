# Kotlin tooling

For authorized Kotlin lint automation, prefer ktlint built-in rules.
For that automation, use ktlint's supported custom-rule API when built-ins cannot express a safe requirement.
Verify compatibility with the project's ktlint version before implementing custom rules or fixes.
Check Kotlin, Gradle, JVM, ktlint engine, and plugin compatibility together before selecting versions.
Stay within Kotlin's officially supported Gradle range even when a newer stable Gradle release exists.
Attach custom rulesets to the consumer's actual ktlint runtime instead of relying on `buildSrc` visibility.
Verify native consumer lint reports a disposable violation before accepting a ruleset integration.

Restrict syntax-only import rules to type references and leave expression receiver chains unchanged.
Verify resolution beyond the current file before accepting import fixes from rules without compiler symbol information.
