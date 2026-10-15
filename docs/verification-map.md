# Verification Map

This map connects Workgraph behavior to its implementation paths and existing evidence.
Use `pnpm run check` when a change spans multiple validation areas.
Run a focused command when only one listed area changes.

| User-visible behavior | Owning path | Check | Evidence and limits |
| --- | --- | --- | --- |
| `SessionStart` delivers Main instructions and the selected host reference. | `hooks/inject-context.mjs`, `hooks/hooks.json`, `hooks/codex-hooks.json`, and `skills/main-agent-contract/`. | `pnpm run check:hooks` | The hook tests compare complete output, role source paths, selected host references, and excluded files. |
| `SubagentStart` delivers Worker instructions and the selected host reference. | `hooks/inject-context.mjs`, `hooks/hooks.json`, `hooks/codex-hooks.json`, and `skills/subagent-context/`. | `pnpm run check:hooks` | The hook tests compare complete output, role source paths, selected host references, and excluded files. |
| Relocated plugin copies load skills and references from their installed paths. | `hooks/hooks.json`, `hooks/codex-hooks.json`, `.codex-plugin/plugin.json`, and `hooks/inject-context.mjs`. | `pnpm run check:hooks` | Tests run configured commands from relocated copies, paths with spaces, and unrelated working directories. |
| Claude context remains inline across long paths and LF or CRLF files. | `hooks/inject-context.mjs` and selected role skills and references. | `pnpm run check:hooks` | Tests cap output at 9,750 characters, leaving at least 250 characters below the 10,000-character limit. |
| Hook failures emit no partial context. | `hooks/inject-context.mjs`. | `pnpm run check:hooks` | Tests cover invalid arguments, missing or empty files, invalid frontmatter, and empty output on file errors. |
| Bundled task skills remain available without entering automatic role context. | `skills/` and `hooks/inject-context.test.mjs`. | `pnpm run check:hooks` | Tests check invocation metadata, bundled reference files, source-derived output, and startup independence from conditional bodies. |
| Markdown references resolve to files and headings. | `README.md`, `skills/`, and `docs/`. | `pnpm run check:markdownlint-cli2` and `pnpm run check:validation-tests` | The Markdown gate checks repository links, while validation tests cover existing file and heading links and reject missing files. |
| Issue templates follow Workgraph's supported schema. | `.github/ISSUE_TEMPLATE/*.yaml` and `test/validation/issue-forms.mjs`. | `pnpm run check:issue-forms` | `pnpm run check:validation-tests` covers required fields, unique names, field IDs, and invalid forms. |
| Host plugin versions use matching calendar-date releases. | `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and `test/validation/plugin-version.mjs`. | `pnpm run check:plugin-version` | `pnpm run check:validation-tests` covers date format, valid dates, nonzero sequence, and parity. |
| Adopted lint rules preserve protected prose, first matches, deep traversal, class reuse, and filename selection. | `rules/sentence-per-line.ts`, `plugins/tsdoc-plugin.ts`, and `test/tooling.test.mjs`. | `pnpm run check:tooling-tests` | Tests check Markdownlint parser diagnostics, structured token depth, and TSDoc visitor effects, including lazy reads. |

These checks exercise repository source and registered commands, not native host activation.
Installed-host activation, interactive invocation menus, and model adherence require direct host-session evidence.
Do not report those outcomes as verified from passing repository checks.
