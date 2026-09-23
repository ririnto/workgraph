# Instruction And Hook Design

## Separate The Audiences

Keep contributor guidance separate from consumer instructions so the plugin does not impose this repository's toolchain on other projects.

| Source | Audience | Responsibility |
| --- | --- | --- |
| `AGENTS.md` | Contributors | Contributors follow repository conventions, validation, and publication requirements. |
| `README.md` | Plugin users | Users find installation instructions, hook behavior, manual invocation, and errors here. |
| `skills/shared.md` | Both agent roles | Agents follow shared authority, communication, delegation, background work, and evidence requirements. |
| `skills/main-agent-contract/SKILL.md` | Main agents | Main agents follow planning, dispatch, integration, and reporting procedures. |
| `skills/subagent-context/SKILL.md` | Dispatched agents | Workers follow assignment scope, permitted operations, and result delivery requirements. |
| `docs/research.md` | Maintainers | Maintainers connect external evidence to design choices and state its limits. |
| `THIRD_PARTY_NOTICES.md` | Distributors | Distributors retain third-party attribution. |

Keep each rule in the source responsible for its audience.
Use links for supporting explanations instead of copying procedures across documents.
The two role skills each reference the shared file so users can invoke either skill without prior hook delivery.
Keep that loading instruction in both roles because the host can load them separately.
Consumers can follow their instructions without reading repository conventions or research history.

## Deliver Context

Claude Code runs `hooks/inject-context.mjs` through the synchronous command hooks in `hooks/hooks.json`.
The command uses `CLAUDE_PLUGIN_ROOT` to locate the script.
The script resolves instruction paths against `import.meta.url`, independent of the working directory.

The script accepts one argument, `SessionStart` or `SubagentStart`.
It selects the corresponding role shown in the [README](../README.md#automatic-instructions).
It removes the leading skill frontmatter block between standalone `---` lines without interpreting YAML values.
It accepts LF and CRLF line endings and preserves separators inside the body.
It trims the shared instructions and role body and joins them with one blank line.
It emits one JSON object containing `hookSpecificOutput.additionalContext` and the matching `hookEventName`.

The script reads all required files before producing stdout.
On a file or frontmatter error, it identifies the failing file without emitting partial instructions.
The [README](../README.md#hook-errors) lists exit codes and the effect on startup.
This context-loading hook cannot enforce permissions.

The host determines which Agent or Workflow executions emit hook events.
Do not assume that every orchestration system creates a Claude Code subagent.
Dispatch prompts must carry the constraints needed by a receiver whose context is unknown.

## Support Manual Invocation

Each role's skill body contains its procedures and a link to `${CLAUDE_PLUGIN_ROOT}/skills/shared.md`.
Claude Code substitutes the plugin's installation path in skill Markdown.
The role directs the agent to read that file when the shared instructions are absent from context.
An unavailable or empty shared file requires a blocker report rather than an incomplete contract.

The [user-only invocation settings](../README.md#user-only-skills) control skill loading, not role ownership or permissions.
Automatic hooks read the same sources without invoking the skills or relying on model file retrieval.
Keep one injector and one hook configuration without replaced routes, aliases, or fallback implementations.

## Verify Delivery And Behavior

`hooks/inject-context.test.mjs` uses Node's test runner and child processes to check the real command.
It compares each emitted context with the shared file and selected role body, excluding frontmatter and unrelated files.
It covers invalid arguments, file errors, missing or unclosed frontmatter, and empty skill bodies.
It executes the registered shell commands from a path with spaces and an unrelated working directory.
Each test removes its disposable plugin copies.

The tests also check skill names, descriptions, user-only metadata, and manual-use references to the shared file.
They establish the source and delivery contract without exercising Claude Code's interactive slash-command menu.
Plugin validation checks configuration rather than model behavior.
Use the validation commands and prose review requirements in [AGENTS.md](../AGENTS.md#validation).

Behavioral evaluation requires a host run with the changed plugin loaded.
Relevant cases include an idle background command, a completion callback, and an English handoff during a non-English user conversation.
Record which model, host, and loaded plugin produced the result.
Do not infer model adherence from a passing hook test or a shorter prompt.
