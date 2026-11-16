# JavaScript and TypeScript

When writing or changing loops, read [loop control flow guidance](control-flow.md) unless fully loaded.

## Declaration documentation

For JavaScript, use multiline JSDoc for exported declarations, re-exports, default exports, and public class members, including constructors.
Treat class members as public unless their privacy is established by language syntax or the documented API contract.
For TypeScript, use multiline TSDoc for exported declarations, types, re-exports, default exports, and effective public or protected class members.
Include constructors and implicitly public members, accounting for enclosing visibility.
For TypeScript, state the public contract instead of restating the declaration's name.
Put `/**` and `*/` on separate lines, with meaningful sentences on `*` lines.
For JavaScript, use `@param` and `@returns` only when they clarify accepted inputs or returned values.
For TypeScript, use them only when they clarify meaning beyond identifiers and types.

## Code style

Use `const` for bindings that do not change and `let` only when reassignment is required.
In JavaScript, use braces for multi-statement control-flow branches.
In TypeScript, use braces for every `if` and `else` branch, including guard returns.
Use `readonly` for TypeScript properties and arrays that must not change.
Preserve the binding's TypeScript type when inlining values.
Keep JSX expressions small and move non-trivial decisions into named functions or values.
Use semantic elements before adding ARIA roles.

Minimize `undefined` in new or changed code and prefer `null` when a value is needed.
Do not require bulk conversion of existing `undefined` uses.
Review behavior before changing constructs that depend on `undefined`, including default parameters and optional chaining.

Review single-condition early returns for condition inversion and apply it when semantics and readability are preserved.
Keep guards where inversion would harm either.
Review `void` used solely to discard a function call and replace it with an appropriate call, such as `await`, when the call contract permits.
Preserve rejection handling, concurrency, callback return contracts, async signatures, execution order, and intentional background work.
For intentional background work, preserve its existing error-handling policy without forcing callers to wait.
This is guidance, not a lint requirement or automatic rewrite.

## Traversal

Use iterative traversal or an explicit work list when input depth can exceed the stack.
In TypeScript, use recursion only when the call bound is stack-safe and the recursive form is clearer.
Keep unknown-depth or unbounded traversal iterative.
