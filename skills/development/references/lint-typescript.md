# TypeScript body comments

Use the [local Oxlint setup](lint-rules.md#oxlint) to enable `comments/no-body-comments` for `**/*.ts`, `**/*.tsx`, `**/*.mts`, and `**/*.cts`.
The [JavaScript placement and exceptions](lint-javascript.md) also apply to TypeScript.
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
