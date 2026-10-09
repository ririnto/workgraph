# TypeScript

Document exported declarations, types, re-exports, default exports, and effective public or protected class members with multiline TSDoc.
Include constructors and implicitly public members, accounting for enclosing visibility.
State the public contract instead of restating the declaration's name.
Put `/**` and `*/` on separate lines, with meaningful sentences on `*` lines.
Use `@param` and `@returns` only when they clarify meaning beyond identifiers and types.

Use braces for every `if` and `else` branch, including guard returns.
Use no trailing commas.
Use `const` for bindings that do not require reassignment.
Use `readonly` for properties and arrays that must not change.

Preserve the binding's TypeScript type when inlining values.

Use recursion only when the call bound is stack-safe and the recursive form is clearer.
Keep unknown-depth or unbounded traversal iterative.
