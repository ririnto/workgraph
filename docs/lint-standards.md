# Workgraph lint standards

This map covers standards selected from the [repository instructions](../AGENTS.md) and [Development guidance](../skills/development/SKILL.md).
The pillars describe the purpose of each standard.
The checks below describe their enforceable scope.

## JavaScript and TypeScript

[`check:ultracite`](../package.json) runs lint and formatter checks through Ultracite with type-aware lint enabled.
The [lint configuration](../oxlint.config.ts) extends Ultracite core, adds local rules, and excludes the host workflow DSL from lint.
The [formatter configuration](../oxfmt.config.ts) extends its own Ultracite preset, excludes Markdown, and sets `trailingComma` to `none`.
The formatter still checks the workflow DSL.
Both retain the preset ignore patterns.

| Standard | Pillars | Effective check and scope |
| --- | --- | --- |
| Use blocks for control-flow bodies and `const` for stable bindings | Stability, consistency | Core `curly` and `prefer-const` report supported source forms. |
| Name regex captures and access them by name | Stability, maintainability | Core `prefer-named-capture-group` checks capture declarations. Named access, including access to the full match, remains a review requirement. |
| Avoid repeated copying when growing an accumulator | Performance, maintainability | `oxc/no-accumulating-spread` reports growing an accumulator by spreading it in supported forms such as `reduce`. |
| Observe promise rejections and use explicit type imports | Stability, consistency | `typescript/no-floating-promises` checks discarded promises even with `void`. `typescript/consistent-type-imports` requires separate type imports. |
| Document exported API contracts | Stability, maintainability | `tsdoc/require-export-tsdoc` checks multiline delimiters on supported TypeScript exports and effective class members. The JavaScript override requires parameter and return tags where applicable to existing JSDoc. Contract quality and uncovered declarations remain review requirements. |
| Keep comments attached to declarations and preserve recognized directives | Stability, maintainability | `comments/no-body-comments` checks loose comments in source files and function bodies. Core `no-inline-comments` also covers trailing comments. |
| Keep function bodies compact and separate sibling tests | Consistency, maintainability | `test-style/no-blank-lines-in-functions` skips blank lines in tokens, comments, recognized directive prologues, and recognized sibling test gaps. `test-style/sibling-test-spacing` checks adjacent named `node:test` registrations resolved from their imports. |
| Keep formatting consistent and omit trailing commas | Consistency | `check:ultracite` checks the files selected by the formatter's preset and repository override. |
| Keep source compatible with the project compiler | Stability | `check:typescript` runs `tsc --noEmit` with [repository includes and exclusions](../tsconfig.json), including the configured JavaScript files and JSDoc. |

The TSDoc rule covers class declarations and class expressions resolved through local export lists.
A class expression written directly in an exported variable initializer or as a parenthesized default export can still have undocumented members.
The regex rule can accept an indexed access to a named capture.
Review changes to directives, literals, and evaluation order even when the formatter accepts them.
The preset sorts value imports, so applying its fixes can change initialization order when an imported module has top-level effects.

## Markdown, native tooling, and validation

| Standard | Pillars | Effective check and scope |
| --- | --- | --- |
| Keep Markdown source readable and use ASCII tree markers | Consistency, maintainability | [`check:markdownlint-cli2`](../.markdownlint-cli2.jsonc) honors Git ignores for `**/*.md`. It applies `docs/prose-format`, `docs/no-em-dash`, `docs/table-separators`, and the `no-box-drawing` search-replace rule. The latter includes code blocks and reports the first box-drawing character per line. |
| Keep links resolvable and skill metadata loadable | Stability, maintainability | `relative-links` checks relative link targets and headings. `docs/no-relative-skill-links` checks that relative skill links target bundled skills. `docs/skill-frontmatter` checks bundled frontmatter structure. `check:skill-metadata` validates invocation policy and host prompt limits. |
| Keep shell hooks portable and formatted | Stability, consistency | `check:shell` runs ShellCheck and compares shfmt output for the tracked Husky hooks and tracked shell scripts. Runtime gating and exit propagation are separate checks. |
| Validate the bundled Go and Kotlin source | Performance, stability, consistency | `check:go` runs the [.golangci.yaml profile](../.golangci.yaml) and NilAway on the bundled Go module. `check:kotlin` runs ktlint on Kotlin under `skills/`. The distributed custom Go and Kotlin comment rules need consumer setup. |
| Validate workflows, issue forms, and plugin metadata | Stability, maintainability | `check:workflows` uses actionlint. `check:issue-forms` validates the supported issue-form subset. `check:plugin-version` checks release parity, package paths, and host metadata. |
| Check production dependencies for known advisories | Stability | `check:production-audit` runs `pnpm audit --prod`. The package currently declares no production dependencies. |

The [tooling tests](../test/tooling.test.mjs) exercise representative accepted and rejected inputs through the lint tools and cover Git hook arguments and status propagation.
The distributed Markdown hidden-note rule has a test for its standalone consumer setup.
The root Markdown configuration does not load that rule.

## Local and hosted gates

| Entry point | Pillars | Effective check and scope |
| --- | --- | --- |
| [.husky/pre-commit](../.husky/pre-commit) | Stability, consistency, maintainability | Husky dispatches to `pnpm run pre-commit`. The script checks staged whitespace, runs the common validators, and selects additional tests and native lint gates from staged paths. |
| [.husky/pre-push](../.husky/pre-push) | Stability, consistency, maintainability | Husky dispatches to `pnpm run pre-push`, which runs the full `check` gate. |
| [GitHub Actions](../.github/workflows/check.yaml) | Stability, consistency | Linux installs from the frozen lockfile, runs the full `check` gate, and validates both Claude package entry points with strict mode. macOS runs the Node hook tests without a development dependency install. |

Ultracite is the repository entry point for Oxlint and Oxfmt in local checks, fixes, tests, and CI.
Security and authority boundaries, semantic-preserving edits, and the relevance of a test or comment remain review responsibilities.
