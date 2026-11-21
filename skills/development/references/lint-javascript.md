# JavaScript body comments

Use the [local Oxlint setup](lint-rules.md#oxlint) to enable `comments/no-body-comments` for `**/*.js`, `**/*.jsx`, `**/*.mjs`, and `**/*.cjs`.
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

The same file passes this rule with documentation on a declaration and a coverage directive used by the project.

```js
/** Returns the label without surrounding whitespace. */
function render(label) {
  /* c8 ignore next */
  return label.trim();
}
```

The rule checks placement and known syntax.
Review whether declaration documentation conveys a real contract and whether remaining comments in other locations describe live behavior.
