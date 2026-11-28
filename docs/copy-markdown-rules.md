---
metadata:
  reference:
    Markdownlint CLI2 custom rules:
      url: https://github.com/DavidAnson/markdownlint-cli2#markdownlint-cli2jsonc
    Markdownlint relative-links plugin:
      url: https://github.com/theoludwig/markdownlint-rule-relative-links
---

# Copy Markdownlint rules

## Prose formatting

Copy [the maintained rule](../rules/prose-format.ts) and its [MIT license](../rules/prose-format.LICENSE) into your repository's `rules/` directory.
Add `"rules/prose-format.ts"` to `customRules` in `.markdownlint-cli2.jsonc`.
If the configuration disables rules by default, set `"docs/prose-format": true` in `config`.
Use Markdownlint CLI2 with a Node.js runtime that can load TypeScript.
The rule has no runtime imports.

`docs/prose-format` checks headings and paragraphs, including list items, for multiple sentences on one source line and for common semicolon joins.
The rule uses English punctuation patterns and allows sentences to span multiple lines.
Some abbreviations followed by a capitalized word can match the sentence pattern.
Code, inline links, and tables are outside its checks.
The rule reports diagnostics without changing files under `--fix`.

From your repository root, run the configured loader against one sentence per line and then two sentences on one line.

```sh
printf '# Example\n\nStart the service.\nCheck its status.\n' | pnpm exec markdownlint-cli2 --no-globs -
printf '# Example\n\nStart the service. Check its status.\n' | pnpm exec markdownlint-cli2 --no-globs -
```

The first command exits with code 0.
The second command exits with code 1 and reports `docs/prose-format` on line 3.
In Workgraph, run `pnpm run check:markdownlint-cli2` and `pnpm run check:test` before replacing a rule with the same ID.

## Other Markdown checks

Keep `markdownlint-rule-relative-links` for local path and heading checks.
Keep skill-link and frontmatter checks tied to your repository's package layout.
See [Workgraph lint standards](lint-standards.md#markdown-native-tooling-and-validation) for this repository's other rules and their effective scopes.
