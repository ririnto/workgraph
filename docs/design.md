# Instruction and hook design

## Separate the audiences

Keep contributor guidance separate from consumer instructions so the plugin does not impose this repository's toolchain on other projects.
The [README](../README.md) guides plugin users, and each host adapter guides one host's setup and invocation.

| Source | Audience | Responsibility |
| --- | --- | --- |
| Auto-injected repository guidance | Contributors | Contributors follow repository conventions, validation, and publication requirements. |
| `docs/reviews.md` | Workgraph contributors | Contributors follow the scoped Workgraph pull-request review policy. |
| `CONTRIBUTING.md` | Contributors | Contributors follow issue, commit, and pull request formats. |
| `README.md` | Plugin users | Users find installation, task routing, invocation, errors, development, and release guidance here. |
| `docs/harness/claude-code.md` | Claude Code users | Users follow this adapter for installation, loading formats, manual invocation, updates, and host evidence limits. |
| `docs/harness/codex.md` | Codex users | Users follow this adapter for supported activation, loading formats, manual invocation, updates, and host evidence limits. |
| `docs/harness/copilot.md` | Copilot users | Users follow this adapter for marketplace installation and shared skills across supported surfaces. |
| `docs/harness/cursor.md` | Cursor users | Users follow this adapter for repository installation and shared skill invocation. |
| `skills/main-agent-contract/SKILL.md` | Main agents | Main agents follow role authority, planning, dispatch, reporting, and conditional skill routing. |
| `skills/main-agent-contract/references/{claude-code,codex}.md` | Main agents | Each reference supplies execution timing, orchestration, and model selection guidance for one host. |
| `skills/subagent-context/SKILL.md` | Dispatched agents | Workers follow bounded assignments, evidence, and handbacks in one self-contained body. |
| `skills/subagent-context/references/{claude-code,codex}.md` | Dispatched agents | Each reference supplies execution timing without Main orchestration or model guidance. |
| `skills/delivery/SKILL.md` | Main agents doing repository changes or delivery | Main agents follow branch selection, publication, review, deferral, integration, and cleanup procedures. |
| `skills/delivery/references/fix-queues.md` | Main agents handling or assessing assigned queues | The reference owns queue concurrency, issue acceptance, integration ownership, and closure evidence. |
| `skills/delivery/references/plugin-updates.md` | Plugin maintainers | The reference includes post-merge marketplace and plugin commands in requested-host sections. |
| `skills/workflow/SKILL.md` | Claude Code main session | The skill adds native Workflow selection, execution, and result verification after the Main contract. |
| `skills/workflow/references/authoring.md` | Workflow authors | Authors follow script construction, mapping, recovery, and bundled-source caller contracts. |
| `workflows/` | Claude Main using Workflow | Native JavaScript workflow definitions use plugin discovery without another runner. |
| `skills/workflow/references/delivery.md` | Workflow delivery graphs | The reference maps Delivery operations to node inputs and outputs. |
| `skills/development/SKILL.md` | Agents doing source work | Agents load shared code defaults and select only matching playbooks and language references. |
| `skills/development/playbooks/{feature,bug-fix,refactoring,performance}.md` | Lifecycle work | Each playbook owns its feature, bug-fix, refactoring, or performance procedure. |
| `skills/development/references/lint-rules.md` | Agents selecting, developing, configuring, or assessing authorized lint tools and rules | Agents follow rule selection, fixture, safe-fix, and rollout guidance. |
| `skills/writing/SKILL.md` | Agents doing prose or instruction work | Agents follow prose defaults and select instruction design for agent-facing work. |
| `skills/writing/references/instruction-design.md` | Agents drafting, editing, or reviewing agent instructions | Agents follow prompt task contracts, source separation, loading boundaries, and instruction validation. |
| `skills/memory-maintenance/SKILL.md` | Agents changing durable memory | Agents review relevant records and their index, covering the complete store for whole-store reconciliation. |
| `skills/codex-scoped-cleanup/SKILL.md` | Codex agents retiring resources | Agents follow the complete owner-mediated lifecycle, scoped activity, preservation, and result verification procedure. |
| `skills/codex-scoped-cleanup/references/native-attachments.md` | Codex agents changing Worktree Artifact connections | Agents follow connection inventory, removal, and recovery guidance for the selected scope. |
| `docs/verification-map.md` | Maintainers | Maintainers connect Workgraph behavior to its current commands and evidence boundaries. |
| `docs/research.md` | Maintainers | Maintainers connect external evidence to design choices and state its limits. |
| `docs/model-effort-evidence.md` | Maintainers | Maintainers compare external model benchmarks and workload limitations. |
| `THIRD_PARTY_NOTICES.md` | Distributors | Distributors retain third-party attribution. |

Keep each rule in the source responsible for its audience.
Use links for supporting explanations instead of copying procedures across documents.
Main and Worker embed their applicable role rules because their loading contexts are separate.
Audience tables and adapters link to procedure owners rather than restating their checklists.

### Composition rules

Auto-injected repository guidance defines contributor constraints for these boundaries.
Keep that guidance at its conventional location without directing agents to retrieve it.
Role bodies remain self-contained, while role-specific references supply only the selected host's applicable guidance.
Every skill keeps its always-required procedures in its body and uses references for conditional detail.
Each role owns its async submission and callback policy because their automatic contexts load independently.
Host references retain required native completion mechanics without a second wait policy.
Common role bodies select an available host reference without naming another host or its CLI.
Hosts without a dedicated reference use their native tool descriptions.
Delivery's plugin-update reference selects the requested host's commands without assuming both CLIs are installed.

Main Agent mode remains the stable public entry at `skills/main-agent-contract/SKILL.md` under `/workgraph:main-agent-contract`.
Its activation description identifies the mode without adding another public entry.
Main and Worker select conditional skills by plain skill name when their stated task scope applies.
Development's conditional loading keeps unrelated lifecycle and language guidance out of task context.
Lint authoring and assessment, assigned queue handling, and agent-instruction design each have a focused reference with an explicit read trigger.
Writing owns prose, the agent-facing prompt task contract, and source or example separation.
Workflow stays focused on its lower-level native operation without repeating the Main contract or Delivery checklist.
Host adapters stay at user altitude and link to role references and sole policy owners.
Contributor guidance identifies these directories and forbids duplicate same-context operational rules.

### User-directed defaults

Role and task skills provide recommended procedures within the user's scope, host permissions, and explicit acceptance requirements.
Users can select supported alternatives for delegation, review staffing, delivery methods, and presentation without another approval ceremony.
The owning skills distinguish these choices from actual access restrictions, conflicting writes, required checks, and security controls.
Repository selection follows the requested scope without a fixed activity window or archive-status exclusion.
The [Delivery skill](../skills/delivery/SKILL.md#confirm-repository-access) owns the operation-specific access check.

### Conditional loading

Main loads [Delivery](../skills/delivery/SKILL.md) before repository edits, branch creation, implementation dispatch, commits, or publication.
Main and Worker conditionally load Writing, Development, and Memory Maintenance for tasks within those skills' scopes.
Hooks inject only the selected role and host reference, leaving task skills, playbooks, and language references conditional.
Consumer skills and their references stay inside this plugin so installation needs no other plugin.
Skip retrieving conditional files whose complete content is already loaded.
Workflow adds its operation to the Main session without repeating common role rules.

Main remains the entry point for complete authorized outcomes, including review, integration, readback, and cleanup.
Delivery defines authorized Git operations and current-unit integration gates without enlarging host permissions.
The [Delivery skill](../skills/delivery/SKILL.md) owns its sequence, scan, review, deferral, integration, and cleanup procedures.
The role contracts and their references own autonomy, recovery, evidence freshness, and resource cleanup.
The [orchestration section](#compose-work-through-the-host) describes graph composition without restating those procedures.

Both role contracts classify communication by the initiating sender rather than a relayed message envelope.
Agent assignments remain agent-originated when they relay a human request.
Communication follows the user's language and assignment requirements.
Writing defers to the active role's policy.

The host supplies general execution rules and tool mechanics.
Role bodies contain no benchmark scores, prices, or source lists.
The Main contract honors user and configuration settings within host restrictions.
Main host references provide tier and effort guidance based on task difficulty.
Worker model selection stays in the dispatch, without a model-policy reference.
Each role has separate host references because Main and Worker load at different execution stages.
Detailed model support, benchmarks, and workload reports remain in [maintainer research](research.md#model-effort-and-cost).

Both Codex role references select [Codex Scoped Cleanup](../skills/codex-scoped-cleanup/SKILL.md) before resource retirement.
The skill routes cleanup through the authorized resource owner and supported host operations.
Its owner-mediated lifecycle procedure is inline because every cleanup inventory or lifecycle change needs it.
Attachment details load when Worktree Artifact connections require changes.
The retained [transport research](research.md#codex-native-cleanup) is historical and supplies no cleanup interface or fallback authority.
Claude references contain no cleanup-skill routing, and neither hook injects the conditional cleanup procedure.
The bundled skill replaces the standalone user-level copy without repeating the common role cleanup contract.

Keep host mechanics in the host's tool descriptions.
Retain task procedures that the host does not supply.
The [host comparison](research.md#host-instruction-comparison) records the reviewed version and evidence limits.

## Package for each host

Root `plugin.json` owns portable identity, metadata, version, and the Agent Plugins 1.0 schema declaration.
Portable clients discover the shared `skills/` directory at its fixed location.
The OpenAI extension selects the existing Codex hook configuration.
Claude retains `.claude-plugin/plugin.json` and its conventional hook and workflow locations.
The package gate checks shared metadata and release parity so the required Claude descriptor cannot drift.

OpenAI uses `.agents/plugins/marketplace.json`, and Claude and Copilot share `.claude-plugin/marketplace.json`.
Cursor uses `.cursor-plugin/marketplace.json`.
Each catalog points to this repository's root plugin and leaves release versions to its manifest.
Catalog discovery and plugin installation remain separate host operations.

Copilot and Cursor consume shared skills without Workgraph's Claude or Codex lifecycle hooks.
Their setup adapters explain manual role loading and native execution controls.
The portable package adds no host-independent hook protocol or Workflow execution engine.

## Deliver context

Claude Code loads `hooks/hooks.json` from the default plugin location and locates the injector through `CLAUDE_PLUGIN_ROOT`.
Codex selects `hooks/codex-hooks.json` through `plugin.json`'s OpenAI extension and uses `PLUGIN_ROOT`.
Both hosts run the same Node injector with an explicit host argument.
The script resolves bundled paths against `import.meta.url`, independent of the working directory.
It reports actual source paths after resolving symbolic links.
Each output names the execution host from the hook argument without inferring it from the model family.

The hook runtime uses built-ins and language features available in Node.js 26.
Development tools follow the separate engine range in `package.json`.

The script accepts a hook event and an explicit host name.
The events are `SessionStart` and `SubagentStart`, and the hosts are `claude` and `codex`.
It selects the corresponding role shown in the [README](../README.md#automatic-instructions).
It validates the leading skill frontmatter block without interpreting YAML values.
Delimiter lines follow Codex's trimmed-line comparison.

Claude delivery excludes frontmatter and consumes leading body whitespace, matching native Skill loading.
It preserves trailing whitespace and separators within the body.
Its Skill fragment starts with the native base-directory line.
Codex delivery uses the native `<skill>` wrapper with the qualified plugin name, actual path, and complete file.
It accepts LF and CRLF line endings and preserves separators inside the body.
Claude references follow native full-file Read normalization and line numbering, including a final empty line.
Codex references preserve raw file text, as ordinary file-read stdout does.

Separate metadata identifies the complete loaded content and its actual path.
Claude source labels resolve from the canonical skill base directory to avoid repeating long installation paths.
Codex source labels retain absolute paths.
For each role, it also loads the matching host reference and identifies that source path.
Worker references contain execution timing without Main orchestration or model guidance.
This guarantee covers new hook output, not context inherited from a parent session.
Codex full-history forks can retain Main's hook context before receiving the Worker hook.

It emits one JSON object containing `hookSpecificOutput.additionalContext` and the matching `hookEventName`.
Native Skill and Read message envelopes differ from hook envelopes, despite matching instruction text.
Codex delivers hook context as a developer message, while native Skill instructions use a user message.
Claude wraps SessionStart context in a system reminder, while native Skill and Read use their tool and user messages.
The hook cannot change those roles or fabricate native tool calls.

Claude Code spills fields over 10,000 characters to files without requesting a read.
Keep each Claude context within that limit so the host delivers its complete instructions inline.
Reserve headroom for paragraph spacing and later instruction changes without shortening required native wrappers or omitting selected files.
Measure complete contexts with long source paths and CRLF before accepting injected prose changes.
Path length affects every repeated source path, so an ordinary-path measurement alone does not establish inline delivery.

The script reads every selected instruction file before producing stdout.
On a file or frontmatter error, it identifies the failing file without emitting partial instructions.
The [README](../README.md#hook-errors) lists exit codes and the effect on startup.
This context-loading hook cannot enforce permissions.

The separate `hooks/bash-polling-guard.mjs` command handles Bash `PreToolUse` events in both host configurations.
The [runtime contract](../README.md#bash-polling-guard) defines matching, denial, shared session counters, state ownership, and failure behavior.
Its deliberately restricted literal grammar excludes unsupported syntax instead of guessing shell semantics.
The guard emits only a native denial decision and leaves execution and permission settings with the host.

The host determines which delegated executions emit hook events.
Do not assume that every orchestration system creates a Claude Code subagent.
Dispatch prompts must carry the constraints needed by a receiver whose context is unknown.
Assignments carry Workgraph model choices and acceptance requirements, and the host applies its model, effort, and fork controls.

## Compose work through the host

Workgraph keeps goal definition, scope, authority, acceptance evidence, and dynamic graph planning in the main session.
Each node describes a bounded operation, decision, or check with required inputs, expected outputs, owner, authority, and completion evidence.
Edges identify results or conditions that gate later nodes, not execution order alone.
The main session starts ready independent nodes in parallel, serializes actual conflicting writes, and joins only required predecessor results.
Independent native Task Mains can change overlapping logical sources in separate native worktrees.
Files, worktrees, refs, and shared records retain one actual writer, and unrelated ownership returns do not gate a successor.
A per-Task host manager controls only the assigned native host, while the native Main retains source and complete delivery ownership.
Native Task starts preserve existing settings unless the user or assignment requests supported changes.
Pass actual predecessor results and evidence to successor nodes.
Workgraph defines no scheduler, executor, or shared task store.

Main can use LaTeX when notation makes dependencies or readiness conditions clearer.
For example, let $i$ denote implementation, $t$ regression tests, $v$ verification, and $p$ publication.

$$
V = \lbrace i, t, v, p\rbrace, \qquad
E = \lbrace (i,v), (t,v), (v,p)\rbrace.
$$

Main can run $i$ and $t$ in parallel when their writes do not conflict.
Main starts $v$ after accepting both results and starts $p$ after passing checks and any required scan.
This example does not prescribe the same nodes for other goals.

The [Main contract](../skills/main-agent-contract/SKILL.md) owns node selection, dispatch, evidence acceptance, and reporting rules.
The [Worker contract](../skills/subagent-context/SKILL.md) owns bounded assignment execution and handbacks.
The [Delivery skill](../skills/delivery/SKILL.md) owns repository tracking, exposure scans, review, current-unit deferrals, integration, and owned cleanup.
The delivery skill's sequence and gates govern authorized repository delivery, and this design does not restate them.
Workgraph contributor reviews follow the scoped policy in [docs/reviews.md](reviews.md).

Claude Code's main session must resolve required scope and authority before launching a Workflow run.
An agent prompt cannot grant tool permissions or enlarge the user's authorization.
The host may relay the user's `/workgraph:workflow` invocation to a dispatched agent together with a bounded computed task.
That relay carries no Workflow launch authority.
The dispatched agent should complete the assigned task within its authority instead of launching another Workflow or returning it unworked.

Claude Main normally selects direct Agent when one assignment completes the work without dependent agent stages or joins.
Workflow suits dependent agent stages, required joins, or expected continuation, while explicit supported user choices take precedence.
The native Workflow tool description owns Workflow syntax, runtime behavior, notifications, and continuation.
The [Workflow skill](../skills/workflow/SKILL.md) owns selection, authoring-reference loading, execution, and result acceptance.
Its read-only design guidance keeps design, challenge, and verification within the actual authority and tool restrictions available to the session.
The [authoring reference](../skills/workflow/references/authoring.md) covers native source and run-specific script copies.
The plugin registers workflows by convention and supplies no replacement executor.
The bundled delivery workflows are complete recipes with declared implementation, publication, and review phases.
Choose or author a smaller graph when the requested outcome needs fewer phases.
Skipping a recipe's required phase still leaves that recipe incomplete rather than proving the requested phase ran.
Its delivery reference maps authorized engineering operations to node inputs and outputs while Main owns graph readiness.
Worker and Codex contexts do not load Workflow procedures.
Codex uses available native delegation tools, and its Main host reference owns tool routing.
The official [Workflow documentation](https://code.claude.com/docs/en/workflows) and [subagent documentation](https://code.claude.com/docs/en/sub-agents) describe those host contracts.

Fix loops and multi-model assessments keep their boundaries in the Workflow skill and its references.
Explicit diff-first gates split proposal and edit runs because native Workflow cannot request intermediate operator sign-off.
These consumer rules preserve separately authorized source delivery without activating host settings.

## Support manual invocation

Each role keeps its own procedures inline.
Manual Main and Worker invocation read their matching host reference when present and not already loaded.
Other hosts retain their native tool mechanics while using the same role contracts.
Worker needs no other role's instructions.
The host adapters list the manual invocation forms for each host.

Main reads Delivery when repository changes or delivery require its procedures.
Inspection-only tasks do not require Delivery.
Main resolves the linked file from its loaded skill directory, regardless of the working directory.
Workflow loads its references only when its authoring or delivery scope applies.
No asset or helper script exists without a concrete output or repeated operation that needs one.

The [skill invocation settings](../README.md#skill-invocation) control skill loading, not role ownership or permissions.
Automatic hooks read the selected role and its host reference without invoking skills or requiring model-side retrieval.
Keep one injector and one configuration per host, without runtime host detection or fallback implementations.

## Verify delivery and behavior

The [verification map](verification-map.md) connects maintained Workgraph behavior to its current commands and evidence boundaries.
Use existing pnpm gates instead of adding a second verification CLI.
Keep source delivery, installed host activation, interactive invocation, and model adherence as separate claims.

Development owns correction priorities and architecture boundaries, while Main and Delivery retain acceptance, review, and publication authority.
Existing host tools handle event-triggered work within the authorized graph.
This design adds no scheduler, telemetry service, or runtime dependency.

`hooks/inject-context.test.mjs` uses Node's test runner and child processes to check the real command.
It checks exact role content, loaded source paths, host reference selection, and exclusion of unrelated files.
It covers invalid arguments, role and reference file errors, invalid frontmatter, and empty selected content.
It executes the registered shell commands from a path with spaces and an unrelated working directory.
The Codex command test selects its hook configuration through the relocated portable manifest and uses the standard skills directory.
It checks Claude's inline limit with complete instructions, long plugin paths, and LF or CRLF line endings.
Each test removes its disposable plugin copies.

`hooks/bash-polling-guard.test.mjs` exercises both registered commands, matching and nonmatching syntax, session isolation, resets, concurrency, and state failures.

The skill metadata gate parses names, descriptions, optional fields, and invocation controls through the existing YAML parser.
It preserves host extensions while enforcing portable field types, character limits, directory identity, and nonempty bodies.
Discovery follows linked skill directories within the plugin and validates metadata against each discovered directory name.
The standalone gate rejects paths that resolve outside the plugin before reading their skill contents.
Source checks scan `SKILL.md` bodies for instruction reference links that resolve outside the bundled skills tree.
They do not scan host reference files or judge model behavior.
They establish the source and delivery contract without exercising Claude Code's interactive slash-command menu.
Plugin validation checks configuration rather than model behavior.
Use the validation commands and prose review requirements from the auto-injected repository guidance.
Workgraph's scoped contributor review policy lives in [docs/reviews.md](reviews.md).

Behavioral evaluation requires a host run with the changed plugin loaded.
The maintained cases cover single and parallel independent Agent selection, bundled-source Workflow invocation, expected continuation, and both conditional follow-up outcomes.
Additional cases check an idle background command and an Agent completion callback.
The communication case checks a worker handoff and the requested language of the human report.
The failure-reporting case preserves partial success, distinguishes unresolved and confirmed causes, and rejects invented repairs.
The test-design case checks independent expectations, legitimate structural contracts, and proportionate verification of prose changes.
The delivery-decision case covers scoped Git authority, proportional review, current-unit gates, authorized recovery, true boundaries, and isolated parallel work.
The user-directed-defaults case checks explicit procedural choices and repository scope without arbitrary age or archive filters.
The Workflow-selection case uses keyed parser and documentation assessments with one necessary reconciliation rather than a domain-by-phase review matrix.
These policy assessments do not perform Git delivery or establish installed activation.
Completion graders inspect actual traces rather than relying on final claims.
Retained local traces let maintainers distinguish completed command and worker outcomes from reported acceptance.
Record which model, host, and loaded plugin produced the result.
Do not infer model adherence from a passing hook test or a shorter prompt.

## Validation and tooling

Ultracite runs source lint and formatting through Oxlint and Oxfmt.
The root configs use the official Ultracite presets and preserve their ignore patterns.
Oxfmt additionally excludes Markdown and uses `trailingComma: "none"`.
`oxlint.config.ts` registers one local plugin, `plugins/tsdoc-plugin.ts`, and enables its `tsdoc/require-export-tsdoc` rule.
The rule requires multiline TSDoc for supported exported TypeScript declarations, including public and protected members of exported class declarations.
It does not check class-expression members through direct exported variable declarations.
Function-body spacing and declaration-only explanations remain written conventions without full enforcement by the active configuration.
The preset's `no-inline-comments` rule provides a narrower comment diagnostic.
The repository's tooling tests verify the configured diagnostics and formatter behavior.
JavaScript parameter and return annotations and type imports follow the official preset defaults.
Markdownlint checks relative links and heading fragments, sentence boundaries, and table separators through the adopted rules.

The sentence rule checks English prose in paragraphs, lists, alert quotes, and individual table cells.
It recognizes ASCII sentence terminators and ASCII or fullwidth semicolons between recognizable independent clauses.
Capitalized enumeration labels alone do not establish a clause.
Known company, clock, honorific, initial, example, and decimal forms use bounded context to distinguish sentence boundaries.
Inline code, links, images, autolinks, and quoted interiors remain protected.
Ordinary block quotes, fenced and indented code, HTML blocks, frontmatter, licenses, and generated documents retain their exemptions.
Escaped and entity-encoded punctuation uses rendered text while diagnostics retain original UTF-16 source columns and complete punctuation token spans.
Unfinished prose followed by a continuation on the next physical line also reports, including capitalized and opaque inline starts.
The heuristic cannot resolve every English abbreviation, proper name, fragment, or unlisted clause form.
Other languages and Unicode sentence terminators remain outside its supported scope.

Development validation gates live in `test/validation/`, with their Node tests in `test/`.
The issue-form gate, `test/validation/issue-forms.mjs`, parses `.github/ISSUE_TEMPLATE/*.yaml` with markdownlint-cli2's public YAML parser.
It validates nonempty top-level `name` and `description` strings, a nonempty body, and required textarea fields.
It also checks unique chooser names, field IDs, and labels, plus GitHub's field ID character rules.
Local validation covers this repository's form subset and does not establish GitHub's live chooser recognition.
The package gate, `test/validation/plugin-version.mjs`, checks the portable manifest, Claude descriptor, and host catalogs from its module location.
It checks the complete `yyyy.MM.dd.seq` string, real calendar dates, positive sequences, shared metadata, bundled paths, and release parity.
`test/validation.test.mjs` exercises valid and invalid forms, YAML scalar semantics, file links, package paths, and release versions.
`test/skill-metadata.test.mjs` covers portable metadata, host extensions, invocation controls, and relocated execution.

CI runs full development checks on Linux with the package's Node engine range.
Separate macOS and Node.js 26 jobs run dependency-free hook tests without installing development tools.
Those jobs verify hook runtime compatibility without installing development dependencies.
Pull requests and main updates trigger the workflow without path filters, and its token receives read-only contents permission.
Dependabot checks npm dependencies and GitHub Actions daily.
