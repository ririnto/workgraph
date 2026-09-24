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
| Claude Code Workflow tool | Main session | The host runs an explicitly authorized workflow when task dependencies justify scripted coordination. |
| `docs/research.md` | Maintainers | Maintainers connect external evidence to design choices and state its limits. |
| `THIRD_PARTY_NOTICES.md` | Distributors | Distributors retain third-party attribution. |

Keep each rule in the source responsible for its audience.
Use links for supporting explanations instead of copying procedures across documents.
The two role skills each reference the shared file so users can invoke either skill without prior hook delivery.
Keep that loading instruction in both roles because the host can load them separately.
Consumers can follow their instructions without reading repository conventions or research history.

Keep host mechanics in the host's tool descriptions.
Retain Workgraph's procedures and user preferences when the host does not supply them.
The [host comparison](research.md#claude-code-21280-comparison) records the reviewed version and evidence limits.

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

## Compose Work Through The Host

Workgraph keeps dynamic task-graph planning in the main session.
Each node describes a bounded operation, decision, or check with inputs, outputs, owner, authority, and completion evidence.
Edges describe results or conditions that gate later nodes, not execution order alone.
The main session starts ready independent work in parallel, serializes conflicting writes, and joins branches only when a later node needs their results.
It chooses useful node types for the goal rather than requiring an exploration-to-integration sequence.
Workgraph defines no scheduler, executor, or shared task store.

Claude Code can execute dynamically composed Workflow scripts and, by default, discovers reusable plugin scripts from the plugin-root `workflows/` directory.
The host exposes included scripts as namespaced slash commands, but Workgraph currently ships no predefined Workflow command.
A future reusable subgraph remains an optional capability and does not replace goal-specific graph planning.
The main agent uses Workflow only when the user authorizes orchestration, the host supports it, and the dependency structure justifies scripted coordination.
The host can still request agent tool permissions during a Workflow run, but the script cannot ask the user for design input between steps.
The main session must resolve required scope and authority before launching the run.
An agent prompt cannot grant tool permissions or enlarge the user's authorization.

A Workflow pipeline can run each item's dependent stages without a global barrier.
Its agents may return `null` or fail, and the main session must report missing results as incomplete instead of treating them as an all-clear.
When the host resumes a Workflow, it may replay saved agent results.
That result cache does not prove that source files, repository state, or check inputs remain unchanged.
Reuse check evidence only while the relevant files, inputs, configuration, and toolchain remain the same.

The official [Workflow documentation](https://code.claude.com/docs/en/workflows) describes plugin discovery, execution limits, permissions, and resume behavior.
The official [subagent documentation](https://code.claude.com/docs/en/sub-agents) describes worker contexts, skills, permissions, and model routing.
The host controls these mechanics, while Workgraph retains task decomposition and evidence policies.

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
