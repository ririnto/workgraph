# JavaScript

## Code style

Use `const` for bindings that do not change and `let` only when reassignment is required.
Use braces for control-flow bodies, including multi-statement branches.
Keep JSX expressions small and move non-trivial decisions into named functions or values.
Use semantic elements before adding ARIA roles.

## JavaScript runtime behavior

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

Use iterative traversal or an explicit work list when input depth can exceed the stack.

## Declaration documentation

Use [Development's shared comment guidance](../SKILL.md#documentation-and-comments) to decide whether a declaration needs prose.
Preserve type information carried by JSDoc, including information consumed by TypeScript checkJs.
Follow documented project API and tooling requirements for JSDoc, including required tags and formatting.

## Adopt the Oxlint groups

For a standalone project, copy the Node sample directory containing its [manifest](../assets/nodejs/package.json), [catalog](../assets/nodejs/pnpm-workspace.yaml), [lockfile](../assets/nodejs/pnpm-lock.yaml), [Oxlint config](../assets/nodejs/oxlint.config.ts), [Oxfmt config](../assets/nodejs/oxfmt.config.ts), and [TypeScript project config](../assets/nodejs/tsconfig.json).
Keep the [comment plugin](../assets/nodejs/plugins/comments.ts) in `plugins/` and the [JavaScript example](../assets/nodejs/src/render.mjs) and [TypeScript example](../assets/nodejs/src/session.ts) in `src/`.
Run the commands from the consumer root with the Node runtime the project supports.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm check:typescript
```

The root config enables type-aware linting through the catalog-owned Oxlint backend.
For an existing project, merge the selected `jsPlugins` entries and overrides into its root config.
Keep existing rules and formatter settings and adapt the source globs.
The comments check needs the local rule, and the indexed named capture check needs `eslint-plugin-regexp`.
Use the same project-owned `pnpm check` locally, in hooks, and in CI.
Let CI select pnpm from `packageManager` and provision Node where the project needs it.

## JavaScript body comments

Apply the comment override from the [shared Oxlint config](../assets/nodejs/oxlint.config.ts) to the project's `js`, `jsx`, `mjs`, and `cjs` paths when the project adopts it.
The rule flags standalone and trailing line comments and block comments in block-bodied functions, methods, and callbacks.
It preserves JSDoc attached to a supported declaration, recognized tool directives, and legal markers.
Comments outside block-bodied functions remain subject to the consumer's existing checks.
Use declaration documentation for genuine contracts and verify the consumer before moving or deleting a directive.
The rule supplies diagnostics without editing source.

Matching code in `render.mjs` has a loose block comment and a trailing workaround note.

```js
function render(label) {
  /* Restore the old rendering path if this fails. */
  return label.trim(); // Temporary fix.
}
```

The same file passes this rule with type information on the declaration and a coverage directive used by the project.

```js
/**
 * @param {string} label
 * @returns {string}
 */
function render(label) {
  /* c8 ignore next */
  return label.trim();
}
```

The rule checks placement and known syntax.
Review whether declaration documentation conveys a real contract and whether remaining comments in other locations describe live behavior.
