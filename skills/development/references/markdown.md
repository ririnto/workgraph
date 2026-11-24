# Markdown

## Markdown hidden notes

When the project adopts these checks, use the [Markdownlint CLI2 setup](#adopt-markdownlint-cli2-checks) for `**/*.md`.
The `comments/no-hidden-notes` rule flags parsed block and inline HTML comments in Markdown, including comments nested in Markdown lists and quotes.
It ignores fenced and inline code, recognized Markdownlint and Prettier directives, and legal markers.
For a template or generated marker with an actual consumer, set `allowed` to the exact comment body in that directory's lint config.
Keep markdownlint's existing ignores for generated or vendored paths.
HTML nested inside a raw HTML element, rendered descriptions, and scope decisions require review.

The built-in `link-image-reference-definitions` rule reports unused or duplicate link definitions.
An empty `ignored_definitions` list also checks the hidden reference form `[//]: # (note)`.
Retain other consumer settings where they serve a documented interface.

Matching content contains a hidden workaround.

```markdown
<!-- Keep this workaround until the next refactor. -->
```

Non-matching content uses a legal marker and displays a comment as a code example.

```markdown
<!-- SPDX-License-Identifier: MIT -->

Use `<!-- sample -->` as the marker in examples.
```

## Adopt Markdownlint CLI2 checks

Copy the directory containing the [sample config](../assets/markdown/.markdownlint-cli2.jsonc), [manifest](../assets/markdown/package.json), [catalog](../assets/markdown/pnpm-workspace.yaml), [lockfile](../assets/markdown/pnpm-lock.yaml), and [custom rule](../assets/markdown/rules/comments.ts).
Use a Node runtime that supports type stripping.

```sh
pnpm install --frozen-lockfile
pnpm run check
```

The sample checks hidden HTML notes and unused or duplicate link definitions.
In an existing project, merge the selected `config` entries and preserve existing globs, ignores, and directives.
If adopting the hidden-note check, copy `rules/comments.ts` and add its path to `customRules`.
Check conforming and violating Markdown with the consumer's normal read-only command.

## Reuse a Markdownlint rule

When the project adopts an external rule, use [Markdownlint CLI2 custom rules](https://github.com/DavidAnson/markdownlint-cli2#markdownlint-cli2jsonc) to load it from the project's development dependencies.
For example, [markdownlint-rule-relative-links](https://github.com/theoludwig/markdownlint-rule-relative-links) checks local paths and Markdown heading links.
Install it with the project's package manager and merge this fragment into the intended directory's `.markdownlint-cli2.jsonc`.

```json
{
  "customRules": ["markdownlint-rule-relative-links"],
  "config": {
    "relative-links": true
  }
}
```

Run the project's normal read-only Markdownlint CLI2 command against Markdown that links to a present file and Markdown that links to a missing file.
Keep the rest of the project's enabled rules and file selection.
Check compatibility with the project's Node runtime and Markdownlint CLI2.
The package checks Markdown links and images, not equivalent raw HTML.
An existing path is not proof that a skill link points inside the distributed plugin.

| Policy | Workgraph decision |
| --- | --- |
| Relative link resolution | Adopt the external rule where the project needs local file and heading checks. |
| ASCII tree markers | Already covered by the repository's diagnostic-only search-replace rule. |
| Hidden reference definitions | Already covered by the asset's `link-image-reference-definitions` setting. |
| Hidden notes nested in raw HTML | Review in context rather than searching text that might not be a note. |
| Skill-package link boundaries and authored table separators | Keep project-specific checks for bundled destinations and table delimiters. |
