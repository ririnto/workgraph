# TypeScript lint rule

## Function-body line comments

Use the [local copy setup](lint-rules.md#adopt-a-lint-asset) to enable `workgraph-comments/no-function-body-line-comments` for `**/*.ts`, `**/*.tsx`, `**/*.mts`, and `**/*.cts`.
Ultracite and Oxlint apply the consuming project's configured ignores.
The rule matches standalone `//` comments inside function bodies, including methods and block-bodied callbacks.
It leaves block comments, declaration comments outside function bodies, and recognized directives and license text to the existing checks.

Matching example in `rules/normalize.ts`:

```ts
const makeLabels = (lengthLimit = 6): string[] => {
  const names = [" North "];
  return names.map((value) => {
    // Normalize whitespace before truncating the label.
    const label = value.trim();
    return label.slice(0, lengthLimit);
  });
};

makeLabels();
```

Non-matching example in `rules/normalize.ts`:

```ts
/**
 * Truncate labels after trimming surrounding whitespace.
 */
const makeLabels = (lengthLimit = 6): string[] => {
  const names = [" North "];
  return names.map((value) => value.trim().slice(0, lengthLimit));
};

makeLabels();
```
