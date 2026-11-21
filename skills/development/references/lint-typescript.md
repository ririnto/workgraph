# TypeScript lint rule

## Function-body line comments

`workgraph-comments/no-function-body-line-comments` applies to `**/*.ts`, `**/*.tsx`, `**/*.mts`, and `**/*.cts` in Workgraph through Ultracite.
Ultracite and Oxlint apply the configured ignores.
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
