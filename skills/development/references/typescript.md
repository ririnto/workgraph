# TypeScript lint

For source and compiler conventions, read the [shared JavaScript and TypeScript guidance](js-ts.md).

## Body comments

When the project adopts `comments/no-body-comments`, use the [local Oxlint setup](lint-rules.md#oxlint) for `**/*.ts`, `**/*.tsx`, `**/*.mts`, and `**/*.cts`.
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
Merge the [scoped regexp config](../assets/typescript/oxlint-regexp.json) into the project's Oxlint config and adapt the override to the intended paths and exceptions.

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
