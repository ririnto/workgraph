# Java tooling

Preserve existing Java tooling, including Spotless with Palantir Java Format and Checkstyle when selected.
Map Kotlin rules only where Java syntax and the selected tool provide a safe equivalent.
Keep Kotlin-only constructs and Java's unsupported trailing commas out of Java rule translations.
Check formatter, checker, build-tool, and lint-runtime compatibility separately from the compilation target.

Review multiline Javadoc, meaningful documentation, and method-body spacing beyond the selected tools' proven coverage.
Do not treat lexical logging patterns as semantic checks because text blocks and shadowed names can produce false positives.
Keep import conversion and control-flow changes under semantic review instead of promising syntax-only automatic fixes.
