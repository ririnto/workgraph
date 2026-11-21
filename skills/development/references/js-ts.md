# JavaScript and TypeScript

## TypeScript project configuration

For each source extension already eligible in the project, use these four `include` patterns, replacing `E` with that extension.

- `**/*.E`
- `**/.*/**/*.E`
- `**/.*.E`
- `**/.*/**/.*.E`

The recursive dotfile pattern covers root dotfiles.
Keep the existing project roots and compiler boundaries.
Exclude only paths verified to contain non-source material for that project.
Check TypeScript's wildcard behavior with the project's compiler version.
The hidden-directory patterns explicitly match one hidden directory segment.
Check paths with multiple hidden directory segments separately when they are in scope.
Imports and references can bring files into the program even when the include patterns do not select them as roots.

Capture the compiler's root selection and actual program membership before and after each configuration change.
Use `tsc --showConfig` and `tsc --listFilesOnly` with the project's config and compiler version, or equivalent compiler evidence for that version.
Probe ordinary files and dotfiles at the root, under ordinary directories, and under hidden directories.
Include ordinary subdirectories of hidden directories and hidden directories below ordinary directories.
Check for newly selected generated files and metadata.
Account for every membership difference and preserve prior membership apart from intended new eligible inputs.

Keep the fewest configuration files that preserve the existing contracts.
Combine check and build settings only when verification establishes that both entry points retain their prior behavior.
Use `extends` for shared settings when toolchain or workspace entry points require separate configs.
Document the contract that requires each distinct profile.
Compare emitted files and their paths for each build entry point, including checks that must emit no files.
Run the existing hooks and CI checks without weakening test, security, or output guarantees.

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
For null cleanup, early-return inversion, and discarded-call replacement, meet functional requirements without preserving existing evaluation order for its own sake.

Remove unnecessary terminal `return undefined` statements when fallthrough preserves the return contract.
Keep required early exits and inferred or declared return types.
Preserve required exits, labels, `finally` behavior, loop effects, and async contracts.

Review single-condition early returns for condition inversion and apply it when functional requirements and readability are satisfied.
Keep guards where inversion would harm either.
Within the requested change, replace `void` used solely to discard a function call with an appropriate form such as `await`.
Preserve required callback return contracts, async signatures, and concurrency.
Propagate rejections to the caller or handle them explicitly without ignoring them, including in background work.
Preserve parallel execution when needed, using an explicit error-handling path such as a non-ignoring `catch`.
Do not use an empty `catch` or catch and ignore errors.

Prefer `await` to promise chaining for sequential work.
Prefer `await` with `try` and `catch` to `Promise.catch` when that structure preserves the required error boundary.

## Traversal

Use iterative traversal or an explicit work list when input depth can exceed the stack.
In TypeScript, use recursion only when the call bound is stack-safe and the recursive form is clearer.
Keep unknown-depth or unbounded traversal iterative.
