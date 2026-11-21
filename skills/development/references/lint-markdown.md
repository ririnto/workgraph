# Markdown hidden notes

Use the [local markdownlint-cli2 setup](lint-rules.md#markdownlint-cli2) for `**/*.md`.
The `comments/no-hidden-notes` rule flags parsed block and inline HTML comments in Markdown, including comments nested in Markdown lists and quotes.
It ignores fenced and inline code, recognized Markdownlint and Prettier directives, and legal markers.
For a template or generated marker with an actual consumer, set `allowed` to the exact comment body in that directory's lint config.
Keep markdownlint's existing ignores for generated or vendored paths.
HTML nested inside a raw HTML element, rendered descriptions, and scope decisions require review.

The built-in `MD053` rule reports unused or duplicate link definitions.
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
