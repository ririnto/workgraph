# Verification map

This map connects Workgraph behavior to its implementation paths and existing evidence.
Use `pnpm run check` when a change spans multiple validation areas.
Run a focused command when only one listed area changes.

For native observations, choose a case below and use the [evaluation command](../README.md#development).

| User-visible behavior | Owning path | Check | Evidence and limits |
| --- | --- | --- | --- |
| `SessionStart` delivers Main instructions and the selected host reference. | `hooks/inject-context.ts`, `hooks/claude-hooks.json`, `hooks/codex-hooks.json`, and `skills/main-agent-contract/`. | `node --test "hooks/**/*.test.{mjs,ts}"` | The hook tests compare complete output with the selected source files, role source paths, and selected host references. |
| `SubagentStart` delivers Worker instructions and the selected host reference. | `hooks/inject-context.ts`, `hooks/claude-hooks.json`, `hooks/codex-hooks.json`, and `skills/subagent-context/`. | `node --test "hooks/**/*.test.{mjs,ts}"` | The hook tests compare complete output with the selected source files, role source paths, and selected host references. |
| Relocated plugin copies load skills and references from their installed paths. | `hooks/claude-hooks.json`, `hooks/codex-hooks.json`, the native host manifests, and `hooks/inject-context.ts`. | `node --test "hooks/**/*.test.{mjs,ts}"` | Tests run configured commands from relocated copies, paths with spaces, and unrelated working directories. |
| Claude context remains inline across long paths and LF or CRLF files. | `hooks/inject-context.ts` and selected role skills and references. | `node --test "hooks/**/*.test.{mjs,ts}"` | Tests cap output at 9,750 characters, leaving at least 250 characters below the 10,000-character limit. |
| Hook failures emit no partial context. | `hooks/inject-context.ts`. | `node --test "hooks/**/*.test.{mjs,ts}"` | Tests compare exact diagnostics for invalid arguments, missing or empty files, and invalid frontmatter, with empty output on file errors. |
| Bundled task skills remain available without entering automatic role context. | `skills/` and `hooks/inject-context.test.ts`. | `node --test "hooks/**/*.test.{mjs,ts}"` | Tests remove every unselected skill and host reference before checking source-derived output. |
| Agents rely on auto-injected repository guidance without named retrieval instructions. | `skills/`, contributor entry documents, and `docs/reviews.md`. | Loading-context review and `pnpm run check:markdownlint-cli2` | The Markdown gate checks link targets, while instruction placement remains a source-review claim rather than a prose test. |
| The delivery script routes early exits, model selectors, unit ownership, repairs, and publication. | `workflows/delivery.js` | `pnpm run check:test` | The harness runs the actual script with supplied agent results. |
| Markdown references resolve to files and headings. | `README.md`, `skills/`, and `docs/`. | `pnpm run check:markdownlint-cli2` | The Markdown gate checks repository file and heading links through the adopted rule. |
| Issue templates follow Workgraph's supported schema. | `.github/ISSUE_TEMPLATE/*.yaml` and `scripts/issue-forms.ts`. | `pnpm run check:issue-forms` | `pnpm run check:test` covers required fields, unique names, field IDs, and invalid forms. |
| Native host packages share names and versions and have valid catalog destinations. | The four native manifests, host catalogs, and `scripts/plugin-version.ts`. | `pnpm run check:plugin-version` | `pnpm run check:test` covers calendar releases, parity, contained paths, invalid catalog values, root-manifest shadowing, and cross-host default hook discovery. |
| Skills retain portable metadata, user invocation, blocked model invocation, and complete native prompt content. | `skills/`, each skill's `agents/openai.yaml`, `scripts/skill-metadata.ts`, and `test/skill-metadata.test.ts`. | `pnpm run check:skill-metadata` and `pnpm run check:test` | Fixtures cover malformed YAML, field types, Unicode lengths, Codex's complete-file byte boundary, linked-directory identity, path containment, invocation controls, and relocated execution. |
| Adopted lint rules preserve table separator diagnostics, deep traversal, class reuse, and filename selection. | `rules/table-separators.ts`, `plugins/tsdoc-plugin.ts`, and `test/tooling.test.ts`. | `pnpm run check:test` | Tests check Markdownlint parser diagnostics, structured token depth, and TSDoc visitor effects, including lazy reads. |
| The [shared Oxlint configuration](../skills/development/assets/nodejs/oxlint.config.ts) checks JavaScript and TypeScript placement and recognized exceptions. | `test/tooling.test.ts` | `pnpm run check:test` | CLI fixtures exercise loose and attached comments and directives. |
| The [Markdown configuration](../skills/development/assets/markdown/.markdownlint-cli2.jsonc) checks hidden notes and unused link definitions. | `test/tooling.test.ts` | `pnpm run check:test` | The copied config checks both mechanisms and preserves literals and markers. |

These checks exercise repository source and registered commands, not native host activation.
Installed-host activation, interactive invocation menus, and model adherence require direct host-session evidence.
Do not report those outcomes as verified from passing repository checks.

## Native evaluation cases

Select the scenario affected by the change.
Each case defaults to one run.
Repeat a selected case when comparing behavior across runs.

| Host path | Case | Evidence |
| --- | --- | --- |
| Direct | [Source correction](../evals/development-natural-trigger/case.yaml) | Main loads Development and fixes the supplied bug without delegation. |
| Agent | [Worker completion](../evals/agent-completion-callback/case.yaml) | Main waits for the background worker and uses its completed result. |
| Workflow | [Bundled delivery](../evals/delivery-completion-evidence/case.yaml) | The registered workflow returns phase records that support the reported outcome. |

### Workflow continuation

The bundled delivery case makes one Workflow call.
To evaluate same-session continuation, seed an existing workflow script in the eval workspace with [`context.scaffold_script` and `--scaffold`](https://code.claude.com/docs/en/plugin-evals#seed-the-workspace-or-conversation).
Give the case `Read`, `Edit`, and `Workflow` under the evaluator's [tool grant rules](https://code.claude.com/docs/en/plugin-evals#grant-tools).

1. Launch the fixture by absolute [`scriptPath`](https://code.claude.com/docs/en/agent-sdk/typescript#workflow) and wait for the completion callback.
   Verify that Main received the actual results in the callback payload.
2. Edit the exact returned `scriptPath` to append a stage that uses those results.
3. In the same session, pass the returned `scriptPath` and set `resumeFromRunId` to the first `runId`.
   Keep `args` and the completed calls unchanged.
4. Inspect `workflow_progress` for `cached: true` on each reused result and match its agent ID to the first run.
   Confirm that the new stage ran with the actual earlier results.

Direct reads of journals in the evaluator's protected configuration directory remain subject to its filesystem deny rules.
Those rules also blocked continuation from an inline launch whose returned script was stored in that directory.
Testing that inline launch path requires a host-supported way to edit the returned script while preserving the deny rules.
