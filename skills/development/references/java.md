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
