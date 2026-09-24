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
Each skill embeds the common rules with its role procedures, so users can invoke any skill without prior hook delivery or extra file retrieval.
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
Reuse existing facts and plans, and skip exploration or planning nodes when those facts already answer the goal.
For broad goals, split work into cohesive, independently verifiable, main-targeted delivery units with clear acceptance evidence and one accountable owner.
Keep tightly coupled work together when splitting it would prevent independent verification or mergeability.
Avoid tiny phases and stacked PRs that require repeated rebases.
Publish, review, and integrate each ready unit promptly instead of accumulating an oversized PR.
Each node describes a bounded operation, decision, or check with required inputs, expected outputs, owner, authority, and completion evidence.
Edges identify results or conditions that gate later nodes, not execution order alone.
The main session starts ready independent nodes in parallel, serializes conflicting writes, and joins branches only when a later node needs their results.
Pass actual predecessor results and evidence to successor nodes.
Choose useful node types for the goal rather than requiring an exploration-to-integration sequence.
Workgraph defines no scheduler, executor, or shared task store.

Claude Code can execute dynamically composed Workflow scripts and, by default, discovers reusable plugin scripts from the plugin-root `workflows/` directory.
The host exposes included scripts as namespaced slash commands, but Workgraph ships no reusable Workflow scripts.
The user-invocable `/workgraph:workflow` skill loads workflow-authoring guidance and invokes native Workflow for explicit requests or dependent multi-stage work.
Its description avoids routing implicit single-stage work to Workflow.
The main agent keeps planning, design decisions, publication, and integration in the main session.
The host requires user opt-in to multi-agent orchestration before native Workflow can run.
Within that authorization, Main selects Workflow for substantive stages connected by results or conditions, without a separate tool-specific request.
Use Agent for a single substantive stage, including independent parallel assignments, instead of inventing display-only phases.
Honor explicit Workflow selection whenever the host supports it, even for one stage.
If explicit selection is unavailable, report that Workflow did not run and do not silently substitute Agent.
If an implicit selection is unavailable, report the limitation and use Agent for bounded outcomes only when safe.
The host can still request agent tool permissions during a Workflow run, but the script cannot ask the user for design input between steps.
The main session must resolve required scope and authority before launching the run.
An agent prompt cannot grant tool permissions or enlarge the user's authorization.

### Publish, Review, And Integrate

Before committing or publishing task changes, record the working branch and authorized target branch.
If they match, create a separate working branch from the target before committing or pushing task changes.
Push only the working branch for PR delivery, and never push task changes directly to the target before PR review.
Use named branch references and current PR changes, not fixed commit hashes.

For each authorized unit, delegate implementation and checks, then inspect returned files and evidence in main.
Create or update a PR/MR targeting the authorized branch, and reuse an existing PR/MR for the unit.
Treat publication as a review handoff, not as main integration.
Run one full independent review after publication, using the PR/MR and its current changes as input.
Use the consumer repository's review method.
Verify candidate findings, then classify confirmed findings against acceptance, required behavior, correctness, safety, and required checks.
Fix confirmed blockers before integration.
Only confirmed blockers require code changes before integration.
Publish blocker fixes through the same PR/MR, and ask the same reviewer to re-review only affected changes.
Reuse unaffected passing checks.

Defer a nonblocking finding only when it is noncritical, does not affect required behavior, acceptance, correctness, or safety, and required checks pass.
Before integration, register each deferred bounded follow-up in the authorized long-term issue tracker with evidence, scope, acceptance criteria, a named owner, and a next action.
Reuse or update an existing tracker item when possible.
Defer follow-up implementation until after the target branch is updated.
If tracker access is not authorized or available, do not integrate with an untracked deferral.
Do not repeatedly sync or rebase the working branch unless a conflict or relevant evidence invalidation requires it.
Bound blocker-fix and scoped re-review rounds, and stop sooner on no progress or a concrete blocker.
Respect host and forge protections, then verify the authorized target branch update as the delivery finish condition.

Read-only, research-only, and review-only goals omit implementation, new branch publication, PR/MR creation, and integration.
Review an existing PR/MR from that artifact and its current changes.
Do not infer publication authority from an inspection-only request.

A Workflow pipeline can run dependent nodes without a global barrier.
Its agents may return `null` or fail, and the main session must report missing results as incomplete instead of treating them as an all-clear.
For dependent follow-up work, append a substantive phase to the saved script and resume it after the prior run exits.
Keep earlier prompts, cache-keyed options, and call order unchanged to replay valid completed results.
Editing an earlier prompt reruns that call and subsequent calls, while changing only display phase labels does not create a dependency or invalidate the cache.
That result cache does not prove that source files, repository state, or check inputs remain unchanged.
Reuse check evidence only while the relevant files, inputs, configuration, and toolchain remain the same.

The official [Workflow documentation](https://code.claude.com/docs/en/workflows) describes plugin discovery, execution limits, permissions, and resume behavior.
The official [subagent documentation](https://code.claude.com/docs/en/sub-agents) describes worker contexts, skills, permissions, and model routing.
The host controls these mechanics, while Workgraph retains task decomposition and evidence policies.

## Support Manual Invocation

Each skill body is self-contained: the common rules and the role procedures live in the same file.
Manual invocation therefore needs no additional file retrieval and no substituted plugin paths.

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
