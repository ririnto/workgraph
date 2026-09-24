# Instruction And Hook Design

## Separate The Audiences

Keep contributor guidance separate from consumer instructions so the plugin does not impose this repository's toolchain on other projects.

| Source | Audience | Responsibility |
| --- | --- | --- |
| `AGENTS.md` | Contributors | Contributors follow repository conventions, validation, and publication requirements. |
| `README.md` | Plugin users | Users find installation instructions, hook behavior, manual invocation, and errors here. |
| `skills/main-agent-contract/SKILL.md` | Main agents | Main agents follow the common rules and the planning, dispatch, integration, and reporting procedures in one self-contained body. |
| `skills/subagent-context/SKILL.md` | Dispatched agents | Workers follow the common rules and the assignment scope, permitted operations, and result delivery requirements in one self-contained body. |
| `skills/workflow/SKILL.md` | Main session | The user-invocable skill carries the common rules and invokes native Workflow for explicit requests or graph-suitable work. |
| Claude Code Workflow tool | Main session | The host runs the selected workflow while enforcing its permissions. |
| `docs/research.md` | Maintainers | Maintainers connect external evidence to design choices and state its limits. |
| `THIRD_PARTY_NOTICES.md` | Distributors | Distributors retain third-party attribution. |

Keep each rule in the source responsible for its audience.
Use links for supporting explanations instead of copying procedures across documents.
Each skill embeds the common rules and the instructions needed to select its role and execution path.
The two hook-delivered role bodies remain complete without prior hook delivery or extra file retrieval.
The Workflow skill can load its own focused reference for authorized engineering delivery without changing hook output.
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
It trims the selected role body and emits it alone.
It emits one JSON object containing `hookSpecificOutput.additionalContext` and the matching `hookEventName`.

The script reads the selected instruction file before producing stdout.
On a file or frontmatter error, it identifies the failing file without emitting partial instructions.
The [README](../README.md#hook-errors) lists exit codes and the effect on startup.
This context-loading hook cannot enforce permissions.

The host determines which Agent or Workflow executions emit hook events.
Do not assume that every orchestration system creates a Claude Code subagent.
Dispatch prompts must carry the constraints needed by a receiver whose context is unknown.

## Compose Work Through The Host

Workgraph keeps goal definition, scope, authority, acceptance evidence, and dynamic graph planning in the main session.
Each node describes a bounded operation, decision, or check with required inputs, expected outputs, owner, authority, and completion evidence.
Edges identify results or conditions that gate later nodes, not execution order alone.
The main session starts ready independent nodes in parallel, serializes conflicting writes, and joins branches only when a later node needs their results.
Pass actual predecessor results and evidence to successor nodes.
Choose useful node types for the goal rather than requiring an exploration-to-integration sequence.
Workgraph defines no scheduler, executor, or shared task store.

The [README](../README.md#goal-driven-work) documents Workflow selection, script discovery, and the branch, publication, review, and deferral procedures for plugin users.
The `skills/` role bodies remain the operational source for those procedures.
The main session must resolve required scope and authority before launching a Workflow run.
An agent prompt cannot grant tool permissions or enlarge the user's authorization.
The host may relay the user's `/workgraph:workflow` invocation to a dispatched agent together with a bounded computed task.
That relay carries no Workflow launch authority.
The dispatched agent should complete the assigned task within its authority instead of launching another Workflow or returning it unworked.

A Workflow pipeline can run dependent nodes without a global barrier.
Its agents may return `null` or fail, and the main session must report missing results as incomplete instead of treating them as an all-clear.
For dependent follow-up work, append a substantive phase to the saved script and resume it after the prior run exits.
Keep earlier prompts, cache-keyed options, and call order unchanged to replay valid completed results.
Editing an earlier prompt reruns that call and subsequent calls, while changing only display phase labels does not create a dependency or invalidate the cache.
That result cache does not prove that source files, repository state, or check inputs remain unchanged.

The official [Workflow documentation](https://code.claude.com/docs/en/workflows) describes plugin discovery, execution limits, permissions, and resume behavior.
The official [subagent documentation](https://code.claude.com/docs/en/sub-agents) describes worker contexts, skills, permissions, and model routing.
The host controls these mechanics, while Workgraph retains task decomposition and evidence policies.

## Support Manual Invocation

Each hook-delivered role body is self-contained: the common rules and role procedures live in the same file.
Manual role invocation therefore needs no additional file retrieval or substituted plugin paths.
The Workflow skill keeps its common rules and execution gates inline.
It loads `skills/workflow/references/delivery.md` only when authorized engineering delivery requires its detailed graph pattern.
No asset or helper script exists without a concrete output or repeated operation that needs one.

The [skill invocation settings](../README.md#skill-invocation) control skill loading, not role ownership or permissions.
Automatic hooks read the selected role source without invoking the skills or relying on model file retrieval.
Keep one injector and one hook configuration without replaced routes, aliases, or fallback implementations.

## Verify Delivery And Behavior

`hooks/inject-context.test.mjs` uses Node's test runner and child processes to check the real command.
It compares each emitted context with the selected role body, excluding frontmatter and unrelated files.
It covers invalid arguments, file errors, missing or unclosed frontmatter, and empty skill bodies.
It executes the registered shell commands from a path with spaces and an unrelated working directory.
Each test removes its disposable plugin copies.

The tests also check skill names, descriptions, and user-only metadata.
They establish the source and delivery contract without exercising Claude Code's interactive slash-command menu.
Plugin validation checks configuration rather than model behavior.
Use the validation commands and prose review requirements in [AGENTS.md](../AGENTS.md#validation).

Behavioral evaluation requires a host run with the changed plugin loaded.
Relevant cases include an idle background command, a completion callback, and an English handoff during a non-English user conversation.
Record which model, host, and loaded plugin produced the result.
Do not infer model adherence from a passing hook test or a shorter prompt.
