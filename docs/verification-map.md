# Verification Map

This map connects Workgraph behavior to its implementation paths and existing evidence.
Use `npm run check` when a change spans multiple validation areas.
Run a focused command when only one listed area changes.

| User-visible behavior | Owning path | Check | Evidence and limits |
| --- | --- | --- | --- |
| `SessionStart` delivers Main instructions and the selected host reference. | `hooks/inject-context.mjs`, `hooks/hooks.json`, `hooks/codex-hooks.json`, and `skills/main-agent-contract/`. | `npm run check:hooks` | The hook tests compare complete output, role source paths, selected host references, and excluded files. |
| `SubagentStart` delivers Worker instructions and the selected host reference. | `hooks/inject-context.mjs`, `hooks/hooks.json`, `hooks/codex-hooks.json`, and `skills/subagent-context/`. | `npm run check:hooks` | The hook tests compare complete output, role source paths, selected host references, and excluded files. |
| Relocated plugin copies load skills and references from their installed paths. | `hooks/hooks.json`, `hooks/codex-hooks.json`, `.codex-plugin/plugin.json`, and `hooks/inject-context.mjs`. | `npm run check:hooks` | Tests run configured commands from relocated copies, paths with spaces, and unrelated working directories. |
| Claude context remains inline across long paths and LF or CRLF files. | `hooks/inject-context.mjs` and selected role skills and references. | `npm run check:hooks` | Tests cap output at 9,750 characters, leaving at least 250 characters below the 10,000-character limit. |
| Hook failures emit no partial context. | `hooks/inject-context.mjs`. | `npm run check:hooks` | Tests cover invalid arguments, missing or empty files, invalid frontmatter, and empty output on file errors. |
| Conditional skills resolve without entering automatic role context. | `skills/main-agent-contract/SKILL.md`, `skills/subagent-context/SKILL.md`, and linked task skills. | `npm run check:hooks` | Tests check relocated links, names, descriptions, available invocation metadata, and exclusion of conditional bodies. |
| Markdown references resolve to files and headings. | `README.md`, `skills/`, and `docs/`. | `npm run check:markdownlint-cli2` and `npm run check:validation-tests` | The Markdown gate checks repository links, while validation tests cover existing file and heading links and reject missing files. |
| Issue templates follow Workgraph's supported schema. | `.github/ISSUE_TEMPLATE/*.yaml` and `test/validation/issue-forms.mjs`. | `npm run check:issue-forms` | `npm run check:validation-tests` covers required fields, unique names, field IDs, and invalid forms. |
| Host plugin versions use matching calendar-date releases. | `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and `test/validation/plugin-version.mjs`. | `npm run check:plugin-version` | `npm run check:validation-tests` covers date format, valid dates, nonzero sequence, and parity. |

These checks exercise repository source and registered commands, not native host activation.
Installed-host activation, interactive invocation menus, and model adherence require direct host-session evidence.
Do not report those outcomes as verified from passing repository checks.
