# Java

Declare exactly one top-level type per file.
Use braces for every `if` and `else` branch, including one-line branches.
Prefer imports over fully qualified types when name resolution remains unchanged.
Keep wildcard imports and retain qualified names when collisions or uncertain resolution require them.

Use braces for all control-flow blocks.

## Declaration order

Within each kind, order declarations by public, protected, package-private, and private visibility.
Put overridden members first within each visibility group.

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

## Declarations and documentation

Use Javadoc for effective public and protected declarations, including constructors, fields, and implicitly public interface members.
State contracts and constraints without restating names or signatures.

Use lower camel case for values and upper camel case for types.
Preserve names required by overridden contracts and `_` for language-supported unnamed bindings.
Prefer final fields and local bindings when mutation is unnecessary.

Use the project's structured logger instead of `System.out` or `System.err` for application diagnostics.

Keep package names, module names, coordinates, source sets, and build tasks within the requested scope.
Introduce records, sealed types, pattern matching, or switch expressions only when the declared release supports them.
Prefer stable syntax over preview features.

## Tooling

Preserve existing Java tooling, including Spotless with Palantir Java Format and Checkstyle when selected.
Check formatter, checker, build-tool, and lint-runtime compatibility separately from the compilation target.

Review multiline Javadoc, meaningful documentation, and method-body spacing beyond the selected tools' proven coverage.
Do not treat lexical logging patterns as semantic checks because text blocks and shadowed names can produce false positives.

Restrict syntax-only import rules to type references and leave expression receiver chains unchanged.
Verify resolution beyond the current file before accepting import fixes from rules without compiler symbol information.
Review import conversion and control-flow changes for semantic equivalence.
When translating Kotlin rules, omit Kotlin-only syntax and unsupported trailing commas.
