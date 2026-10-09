# Java

Use Javadoc for effective public and protected declarations, including constructors, fields, and implicitly public interface members.
State contracts and constraints without restating names or signatures.

Use braces for control-flow blocks, including one-line branches.
Prefer imports over fully qualified type names when name resolution remains unchanged.
Preserve wildcard imports and keep qualified names when collisions or uncertain resolution require them.
Use lower camel case for values and upper camel case for types.
Preserve names required by overridden contracts and `_` for language-supported unnamed bindings.
Prefer final fields and local bindings when mutation is unnecessary.

Use the project's structured logger instead of `System.out` or `System.err` for application diagnostics.

Keep package names, module names, coordinates, source sets, and build tasks within the requested scope.
Introduce records, sealed types, pattern matching, or switch expressions only when the declared release supports them.
Prefer stable syntax over preview features.

## Automation

Preserve existing Java tooling, including Spotless with Palantir Java Format and Checkstyle when selected.
Map Kotlin rules only where Java syntax and the selected tool provide a safe equivalent.
Keep Kotlin-only constructs and Java's unsupported trailing commas out of Java rule translations.
Check formatter, checker, build-tool, and lint-runtime compatibility separately from the compilation target.

Review multiline Javadoc, meaningful documentation, and method-body spacing beyond the selected tools' proven coverage.
Do not treat lexical logging patterns as semantic checks because text blocks and shadowed names can produce false positives.
Keep import conversion and control-flow changes under semantic review instead of promising syntax-only automatic fixes.
