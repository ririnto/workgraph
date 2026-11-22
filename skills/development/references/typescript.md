# TypeScript

## Project configuration

For a new Node project with TypeScript, copy the [TypeScript config example](../assets/typescript/tsconfig.json) over the `tsconfig.json` in the [shared Node lint project](javascript.md#adopt-the-oxlint-groups).
It extends the catalog-owned Node LTS preset and includes TypeScript files anywhere in the project, including dotfiles and files in dot directories.
Use `pnpm run check:typescript` for the separate type check and `pnpm run check` for type-aware linting of the sample's `src`.
For an existing project, merge the relevant include patterns and keep its compiler options.

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

## Code style

Use `const` for bindings that do not change and `let` only when reassignment is required.
Use braces for every `if` and `else` branch, including guard returns.
Use `readonly` for TypeScript properties and arrays that must not change.
Preserve the binding's TypeScript type when inlining values.
Keep JSX expressions small and move non-trivial decisions into named functions or values.
Use semantic elements before adding ARIA roles.

For values, exits, promises, and error boundaries, follow [JavaScript runtime behavior](javascript.md#javascript-runtime-behavior) and preserve TypeScript types.
Use recursion only when the call bound is stack-safe and the recursive form is clearer.
Keep unknown-depth or unbounded traversal iterative.

## Declaration documentation

Use [Development's shared comment guidance](../SKILL.md#documentation-and-comments) to decide whether a declaration needs prose.
Follow documented project API and tooling requirements for TSDoc, including required tags and formatting.

## Body comments

When the project adopts body-comment checks, apply the comment override from the [shared Oxlint config](../assets/nodejs/oxlint.config.ts) to its `ts`, `tsx`, `mts`, and `cts` paths.
Use the [frozen Ultracite example](javascript.md#adopt-the-oxlint-groups) to check both languages with one local installation.
The [JavaScript placement and exceptions](javascript.md#javascript-body-comments) also apply to TypeScript.
The rule recognizes TSDoc attached to local TypeScript declarations and existing TypeScript directives.
Keep the project's independent rules for TSDoc quality and suppressions.

Matching code in `session.ts` has an unattached block comment before a return statement.

```ts
function read(): string {
  /** Keep this until the session layout changes. */
  return "active";
}
```

The same file passes this rule with a contract on a declaration.

```ts
function read(): string {
  /** Persisted status accepted by version one of the protocol. */
  const status = "active";
  return status;
}
```

## Adopt a regexp result rule for JavaScript and TypeScript

Use named fields in parser APIs and follow [Development's regex guidance](../SKILL.md#extract-regex-matches) when reading captures directly.
When the project opts into checking remaining indexed access, install a compatible version of `eslint-plugin-regexp` as a development dependency.
Oxlint [tests this package for compatibility](https://oxc.rs/docs/guide/usage/linter/js-plugins.html#known-supported-eslint-plugins).
Verify the selected plugin version with the project's Node and Oxlint versions.
Merge the regexp plugin and its override from the [shared Oxlint config](../assets/nodejs/oxlint.config.ts) and adapt the override to the intended paths and exceptions.

Use the consumer's read-only lint entry point, such as `pnpm exec ultracite check --type-aware`, on a matching and a passing case in each language.
The [rule](https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-result-array-groups.html) reports `[1]` in this example because it resolves the index to the named capture `id`.

```js
export const id = /item=(?<id>\d+)/u.exec("item=42")?.[1];
```

Use `.groups` for named captures.
Index `[0]` holds the full regexp match and passes this rule, as does an ordinary array lookup.
For a pattern you own, an outer named capture can expose the entire match as a named field.

```js
export const id = /item=(?<id>\d+)/u.exec("item=42")?.groups?.id;
export const item = /(?<item>item=\d+)/u.exec("item=42")?.groups?.item;
```

Before adding a capture to an existing pattern, check numeric backreferences, positional consumers, and any API that exposes the match array.
