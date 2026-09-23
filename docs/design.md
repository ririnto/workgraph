# Instruction And Hook Design

## Separate The Audiences

Contributors need repository conventions and validation commands.
Consumer agents need task behavior and role boundaries.
Keep those audiences separate so an installed plugin does not impose this repository's toolchain on other projects.

| File | Audience | Responsibility |
| --- | --- | --- |
| `AGENTS.md` | Repository contributors | Local conventions and validation |
| `README.md` | Plugin users | Installation and observable behavior |
| `skills/shared.md` | Main agents and workers | Authority, language, asynchronous work, and evidence |
| `skills/main-agent-contract/SKILL.md` | Main agents | User-only skill and maintained planning, dispatch, integration, and reporting rules |
| `skills/subagent-context/SKILL.md` | Dispatched agents | User-only skill and maintained assignment scope and result delivery rules |
| `docs/research.md` | Maintainers | Research evidence and design limits |
| `THIRD_PARTY_NOTICES.md` | Maintainers and distributors | Attribution |

All maintained files live in the repository.
Only the shared instructions and selected skill body enter a consumer's session through these hooks.
The shared file owns behavior that applies to both roles.
The injector supplies it with the selected role so neither agent must retrieve another file before following its instructions.

Keep research detail outside the injected context.
A maintainer changing a design choice can load the relevant source notes.
A consumer agent can follow the operational rules without reading the research history.

## Deliver Context

Claude Code runs `hooks/inject-context.mjs` through the synchronous command hooks in `hooks/hooks.json`.
The command uses `CLAUDE_PLUGIN_ROOT` to locate the script.
The script resolves Markdown paths against `import.meta.url`, independent of the working directory.

The command accepts the host event name as its sole argument.
For SessionStart, it combines `skills/shared.md` with the body of `skills/main-agent-contract/SKILL.md`.
For SubagentStart, it combines `skills/shared.md` with the body of `skills/subagent-context/SKILL.md`.
It removes only the leading skill frontmatter block between standalone `---` lines.
It accepts LF and CRLF line endings and preserves separators inside the body.
It trims the shared instructions and role body and separates them with one blank line.
The runtime strips the frontmatter delimiters without interpreting YAML values.
The skill tests check the maintained metadata, and plugin validation checks the plugin configuration.
It returns the result as `hookSpecificOutput.additionalContext` with the matching `hookEventName`.

Both hook registrations omit a matcher.
The main instructions therefore cover startup, resume, clear, compact, and fork events that the host emits.
The worker registration covers the agent types that receive SubagentStart.
The host determines whether a particular Agent or Workflow execution emits those events.
Do not assume that every orchestration system creates a Claude Code subagent.
Dispatch prompts must carry the constraints needed by a receiver whose context is unknown.

The script reads all required files before producing stdout.
It exits with code 2 for invalid arguments and code 1 for missing, unreadable, or empty files.
Missing or unclosed skill frontmatter and empty skill bodies also exit with code 1.
It reports the failing file without emitting partial instructions.
Claude Code continues session and subagent startup after these hook errors.
Workgraph cannot turn this context-loading hook into a permission gate.

## Keep One Implementation

Each role skill contains its maintained behavioral rules.
The shared rules live once in `skills/shared.md`.
The two role skills keep their names, descriptions, and role boundaries as explicit user entry points.
Their frontmatter sets `disable-model-invocation: true` and `user-invocable: true`.
Claude Code keeps them available to users while blocking model invocation and automatic skill preloading.

Each skill directs the agent to read `${CLAUDE_PLUGIN_ROOT}/skills/shared.md` when shared instructions are absent from context.
Claude Code substitutes the plugin's installation path in skill Markdown.
The role body loads with the skill, while the shared link requires a read when hooks have not supplied it.
An unavailable or empty shared file must stop application of an incomplete contract.
Hook delivery includes both sources in full without depending on linked-file retrieval.
Invocation cannot change role ownership or grant permissions.

The plugin has one injector and one hook configuration for automatic context delivery.
It keeps no aliases for earlier route arguments.
A structural change must update its consumers, tests, and documentation in the same change.

The runtime uses Node built-ins.
Development dependencies support lint and formatting.
Node's built-in test runner exercises the hook without an additional test framework.
The version belongs to the plugin manifest.
The marketplace points to this plugin without defining a second version.

## Coordinate Through The Host

A task graph describes work and prerequisites.
A node can be a tool operation, verification, or decision instead of a separate agent.
The main agent assigns owners and checks that inputs and authority are available before dispatch.
Workers return evidence references and conclusions that successors need.

The host tracks background execution and sends completion notifications.
An agent can end an idle turn while the overall task remains unfinished.
This separation prevents task persistence from becoming a reason to repeat waiting text or tool calls.
A later completion event supplies the result needed to resume dependent work.

The shared instructions require English for messages to another agent.
The recipient determines the communication language even when the user's conversation uses another language.
A requested deliverable can retain its own language while the surrounding handoff uses English.

## Verify The Boundaries

`hooks/inject-context.test.mjs` checks the real command through child processes.
It compares each emitted context with the shared file and selected skill body, excluding frontmatter.
It checks invalid arguments, file errors, missing or unclosed frontmatter, and empty skill bodies.
It executes the registered shell commands from a path with spaces and an unrelated working directory.
Its temporary directories contain disposable copies and receive cleanup after each test.
The tests also check skill names, descriptions, user-only metadata, and manual-use references to the shared file.
These checks establish the source contract rather than exercising Claude Code's interactive slash-command menu.

Review prose for sentence completeness, line boundaries, conditions, and meaning.
A punctuation check can find suspicious lines but cannot establish grammar or model adherence.
The stop-slop editing pass removes filler while preserving technical constraints.

Behavioral evaluation needs a host run with the new plugin loaded.
Relevant cases include an idle background command, a completion callback, and an English handoff during a non-English user conversation.
Record which model, host, and loaded plugin produced the result.
Do not infer those outcomes from a successful hook test or a shorter prompt.
