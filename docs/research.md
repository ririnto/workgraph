# Research Behind The Instructions

## Scope

These notes connect external evidence to Workgraph's instruction choices.
They distinguish research findings, product guidance, and local design decisions.
The cited studies use different tasks, models, and evaluation methods.
Their results do not establish Workgraph performance or model adherence.

Maintainers can use these sources when changing context boundaries, task dependencies, verification, or writing rules.
See [the design](design.md) for delivery mechanics and [third-party notices](../THIRD_PARTY_NOTICES.md) for attribution.

## Prompt And Skill Design

### Agent-Facing Prompt Contracts

We read the complete official [Claude prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md), including its examples and model-specific qualifications.
We also read the complete [Codex best-practices article](https://learn.chatgpt.com/guides/best-practices) and [OpenAI latest-model guide](https://developers.openai.com/api/docs/guides/latest-model.md).
These sources recommend explicit goals, relevant context, constraints, output requirements, and observable completion criteria.
They support focused skills, useful examples, proportional checks, and independent work suited to the host.
The OpenAI guide warns that conflicting loaded instructions can stop authorized work.
Anthropic recommends separating instructions from source material and using ordinary, direct language rather than aggressive tool triggers.

Instruction Authoring applies those lessons to agent-facing contracts and instruction-management skills.
Writing routes prompt contracts to Instruction Authoring and keeps human-facing presentation guidance separate.
Authors audit actual loading points, replace conflicting consumers, and evaluate decision boundaries instead of testing exact prose.
The user's approved scope determines Git delivery authority, while host permissions and server protections remain unchanged.
A guide's sample approval prompt does not require renewed approval for operations already authorized by the user.
The [Delivery skill](../skills/delivery/SKILL.md#confirm-repository-eligibility) owns repository eligibility checks.

These adaptations do not add SDK integrations, model configuration, settings changes, scheduling, or installed activation.
The guides' model-specific observations require evaluation on the selected workload and do not establish Workgraph adherence.
Source validation, native behavior evidence, and installed activation remain separate claims.

### Official Prompt-Engineering Guides

We fetched the official [Anthropic prompt-engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview.md) in full on October 20, 2026.
It is a hub page that links the separately cited best-practices guide, rather than replacing that guide.
It recommends defining success criteria, running empirical tests, and drafting instructions before refining them, and notes that prompts do not fix every failure.

We fetched the official [OpenAI latest-model guide](https://developers.openai.com/api/docs/guides/latest-model.md) in full on October 20, 2026, last modified the same day.
It recommends explicit user priority over skill text, auditing loaded `AGENTS.md` and skill files for conflicts, concise explicit output expectations, and checks proportional to the change.
It permits initiative only within the authorized scope and treats its model-specific observations as hypotheses for the selected model and workload.

We fetched the official [xAI speech-to-speech prompting guide](https://docs.x.ai/developers/model-capabilities/audio/speech-to-speech/prompting-guide.md) in full, with a footer date of August 17, 2026.
The `.md` URL returned 404 with `Accept: text/markdown`, while a direct fetch with the default `Accept` header returned the complete document.
The [extensionless page](https://docs.x.ai/developers/model-capabilities/audio/speech-to-speech/prompting-guide) was also read.
Its reusable lessons are auditing instructions for conflicts and ambiguity, short focused rules, alignment with real tool schemas, examples where needed, and avoiding accumulated emphasis.

We fetched the official [Meta prompting guide](https://dev.meta.ai/llama/docs/how-to-guides/prompting) in full.
That guide has no Markdown-equivalent URL.
It recommends a clear task, relevant context, roles, restrictions, and an explicit output specification, useful few-shot examples, and iterative testing with source evidence.

| Source lesson | Workgraph mapping |
| --- | --- |
| State the task, context, constraints, output, and completion criteria explicitly. | Instruction Authoring already requires these elements in agent-facing task contracts. |
| Audit loaded instruction sources for conflicts and ambiguity. | Instruction Authoring already audits loading points and replaces conflicting consumers. |
| Use concise and explicit output expectations. | Instruction Authoring owns agent-facing contracts, while Writing owns presentation. |
| Scale checks to the change and keep initiative within scope. | Development, Verification, and the role contracts route checks and authority. |
| Keep rules short and aligned with real tool schemas. | Role bodies and host references match native loading formats and tool contracts. |
| Use examples where they clarify a decision boundary. | Instruction Authoring owns contrasting examples for decision boundaries. |
| Avoid accumulating emphasis and repeated directives. | Writing's final pass already removes repetition while preserving requirements. |

Workgraph does not adopt the guides' voice-only output, confirm-before-mutation examples, fixed heading or second-person format rules, audio and API parameters, model defaults, or realtime preambles.
It does not request private chain-of-thought, build majority-vote or program-execution infrastructure, or claim universal effectiveness for these instruction choices.
Meta's HTML extraction flattens code-block and table styling, so its read does not establish rendered inspection.
The guides document different models and products, so their lessons remain unverified for Workgraph model adherence without a behavioral evaluation.

### OpenAI Guidance

[Using GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md) recommends action within the user's scope.
It calls for explicit completion criteria, clear instruction priority, and checks proportional to the change.
It also recommends concise writing and delegation rules that match the host.
It warns that unclear or conflicting guidance in skills and files such as `AGENTS.md` can pause work, and recommends auditing every loaded instruction source.

[Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra.md) recommends short activation descriptions and progressive disclosure.
It warns against fixed itineraries, redundant repository maps, and approval rules that block authorized work.
It recommends contextual pointers to documents instead of required reads before each edit, and notes that repository skills guide agents on different models.
We reviewed supplied copies of both documents and fetched the GPT-6 guide's prompting and GPT-6.1 Sol sections.
OpenAI presents the prompts as starting points across the GPT-6 family, based on behavior observed with Astra.
OpenAI recommends evaluating them with the selected model and workload.
These recommendations guide instruction design without changing model or API configuration.

The fetched [GPT-6.1 Sol model page](https://developers.openai.com/api/docs/models/gpt-6.1-sol.md) lists `low`, `medium`, `high`, `xhigh`, and `max` effort settings, with `medium` as the default.
It does not support `none` or `minimal` effort.
We confirm supported settings from the model page.
The [Main contract](../skills/main-agent-contract/SKILL.md#models) honors user settings and selects supported controls by workload.
Consumer sessions do not need model comparisons or benchmark evaluations.
Maintainers can use model-specific benchmark and workload evidence for scoped evaluations.
Instruction text does not configure the host or establish model adherence.

OpenAI's [model-selection guide](https://developers.openai.com/api/docs/guides/model-selection.md) gives different effort starting points for Luna, Sol, and Astra.
It recommends experiments with the same inputs and the lightest setting that meets the required quality.
The [GPT-6 Luna model page](https://developers.openai.com/api/docs/models/gpt-6-luna.md) supports `none`, `low`, `medium` (default), `high`, `xhigh`, and `max`.
We have not established a universal effort-performance curve or a plateau above `high` for Sol.

The OpenAI [Build skills guide](https://learn.chatgpt.com/docs/build-skills.md) recommends instructions over scripts unless deterministic behavior or external tooling is needed.
The guide does not choose host tools for Workgraph tasks.
The [Codex subagent guide](https://learn.chatgpt.com/docs/agent-configuration/subagents.md) recommends stating whether to wait for agents and what output to return.
It does not set a minimum timeout or guarantee a native wait tool.
Use suitable native host tools and name any authorized fallback's capability gap.
The role skills leave native waiting and completion mechanics to the host.

Workgraph keeps maintenance rules in `AGENTS.md` and runtime behavior in `skills/`.
Each hook delivers the selected role and its active host reference without model-side retrieval.
Worker references contain execution timing without Main orchestration or model policy.
The Workflow skill can load its own delivery reference when that goal needs detailed publication and review graph guidance.
Main loads the separate Delivery skill for repository changes or delivery, while hooks retain role and host guidance.
The role contract sets no fixed agent count.
Checks can reuse valid evidence instead of restarting a fixed process after each change.

### Claude Model Guidance

[Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5) distinguishes prompt changes from host and API changes.
We reviewed a supplied copy and fetched the official guide's effort and completion sections.
For unattended work, it recommends explicit completion conditions and continued execution instead of stopping after a progress report.
Pending background work remains unfinished until its results arrive.
These recommendations support Workgraph's completion and native-callback instructions without requiring a polling loop or repeated continuation requests.

The guide recommends removing unnecessary thinking instructions and measuring the effects of older prompt workarounds.
Workgraph keeps actionable scope, authority, and evidence requirements rather than prescribing reasoning steps.
Role procedures remain inline, while host-specific orchestration loads only for the active environment.
We have not measured these prompt choices in Workgraph on the selected models.

We fetched the official [Claude Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1.md) and [Claude Sonnet 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5.md) prompting guides.
Fable's completion guidance supports finishing the requested scope and continuing independent work while delegated results remain pending.
Sonnet's scope guidance supports stopping after the requested work and applicable checks finish, without adding unrelated changes or review rounds.
Apply these recommendations within Workgraph's authorization and required-check rules.

Anthropic recommends evaluating effort on the target workload because effort names do not represent equal thinking across models.
Fable 5.1 starts at its default `high`, while Opus 5.5 starts at its default `medium`.
Sonnet 5.5 defaults to `high` in the API but recommends `medium` for well-defined agentic tasks and `high` for harder work.
Anthropic recommends lowering host effort settings to reduce thinking.
Check each model's settings before reuse and honor the active assignment.

Effort settings, token limits, response-block parsing, progress-update display, and bounded automatic continuations belong to the host or API integration.
Time signals require host-supplied measurements, and pasted-content tags require application support.
The guide's broad context search targets multi-app workflows rather than every repository edit.
Workgraph does not implement those integrations or change model settings through instruction text.
Its runtime delivers context through Claude Code hooks, and its instructions use the host's existing completion lifecycle.

### Model Effort And Cost

We reviewed nine exact models using official model, effort, pricing, host, and prompting documentation.
The table compares seven models with standard API pricing and host guidance, separating API defaults from documented host recommendations.
The inspected Codex catalog defaults, recorded below, can differ from those recommendations.
Prices are standard API dollars per million input, cached input, and output tokens.
Gemini has provider rather than benchmark comparisons.
Its supported levels, defaults, model limits, pricing, and host observations are maintained in the [Gemini provider evidence](model-effort-evidence.md#gemini-38-flash-and-gemini-4-argon).
The promotional Copilot rates do not describe subscription usage limits, fast-mode prices, or paid tool charges.

| Exact model | Supported effort | API default | Documented host guidance | Input / cached input / output |
| --- | --- | --- | --- | --- |
| [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna.md) | `none`, `low`, `medium`, `high`, `xhigh`, `max` | `medium` | The Codex guide starts at `high`. | $0.10 / $0.01 / $0.50 |
| [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol.md) | `low`, `medium`, `high`, `xhigh`, `max` | `medium` | The guide gives task-specific medium or xhigh starting points. | $2 / $0.10 / $10 |
| [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra.md) | `low`, `medium`, `high`, `xhigh`, `max` | The reviewed sources did not establish a default. | The Codex guide starts at `low`. | $10 / $1 / $50 |
| [Claude Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview), `claude-haiku-5-5`, October 7, 2026 | `low`, `medium`, `high`, `xhigh`, `max` | `medium` | Claude Code defaults to `medium`. | $0.10 / $0.01 / $0.50 up to 100K input tokens, then $0.50 / $0.05 / $2.50 |
| [Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview.md), `claude-sonnet-5-5`, September 28, 2026 | `low`, `medium`, `high`, `xhigh`, `max` | `high` | Claude Code starts at `medium`. | $2 / $0.10 / $10 |
| [Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview.md), `claude-opus-5-5`, September 22, 2026 | `low`, `medium`, `high`, `xhigh`, `max` | `medium` | Claude Code starts at `medium`. | $4 / $0.20 / $20 |
| [Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview.md), `claude-fable-5-1`, September 1, 2026 | `low`, `medium`, `high`, `xhigh`, `max` | `high` | Claude Code starts at `high`. | $10 / $0.25 / $50 |

The [Codex model guide](https://developers.openai.com/codex/models.md) supplies Astra and Luna starting settings.
The [Claude Code model guide](https://code.claude.com/docs/en/model-config.md) supplies its host defaults, provider aliases, and minimum CLI version.
Anthropic's [effort guide](https://platform.claude.com/docs/en/build-with-claude/effort.md) supplies supported effort levels and API defaults.
Google's [thinking reference](https://ai.google.dev/gemini-api/docs/thinking) supplies the Gemini thinking levels and defaults.
The [Haiku launch announcement](https://www.anthropic.com/claude-haiku-5-5) records Sonnet's cache-read price reduction effective October 7, 2026.
Keep previously published benchmark costs with their source dates rather than treating them as recalculated at the new price.
Fable 5.1 and Opus 5.5 keep adaptive thinking on.
Sonnet 5.5 accepts `between_tools` at `high` or below to remove up-front thinking, but rejects it at `xhigh` and `max`.
Haiku 5.5 defaults to adaptive thinking and accepts `output_config.effort` on the API.
Claude Code exposes the same five effort levels through its model and session controls.
The API permits disabled thinking only through `high`, while Claude Code does not allow it for Haiku 5.5.
Per-message effort changes are beta on the Claude API and Google Cloud for Haiku 5.5.
Claude Code 2.1.293 and later supports Haiku 5.5.
Claude Code subagent effort frontmatter overrides session effort unless `CLAUDE_CODE_EFFORT_LEVEL` is set, and subagents inherit session thinking configuration.
The official Haiku 5.5 prompting guide warns that multi-turn `xhigh` responses may occasionally contain no visible text.
Haiku 5.5 has a 1M token context window and 128K maximum output on the API.
The model page lists availability on the Claude API, Bedrock, Google Cloud, Microsoft Foundry, and Claude Platform on AWS.
Organization effort limits can cap the effective Claude Code level below the selected setting.
These capabilities follow Anthropic's [thinking configuration table](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting.md).

Broad external benchmarks supply the primary effort comparisons.
The [detailed evidence record](model-effort-evidence.md) retains numerical effort comparisons for the seven benchmarked models, workload studies, measurement limits, and the Gemini provider evidence.
No reviewed external benchmark covers the two Gemini models.
Independent review checks the available figures, methods, and verification limits.
Source verification does not establish model performance outside the published workloads.

| Model | External benchmark finding |
| --- | --- |
| [GPT-6 Luna](https://artificialanalysis.ai/models/releases/gpt-6-luna) | High, xhigh, and max score 33, 35, and 38, at estimated $0.03, $0.04, and $0.07 per task. |
| [GPT-6.1 Sol](https://artificialanalysis.ai/models/releases/gpt-6-1-sol) | High to max raises the rounded composite index from 50 to 52 and estimated task cost from $0.32 to $0.72. |
| [GPT-6 Astra](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json) | Across 452 attempts per effort, medium passes 72.79%, xhigh 74.12%, and max 73.23%. |
| [Claude Haiku 5.5](https://www.anthropic.com/document/claude-haiku-5-5-system-card) | FrontierCode Main rises from about 42% at medium and high to 45.8% at xhigh and 46.4% at max. |
| [Claude Sonnet 5.5](https://artificialanalysis.ai/models/releases/claude-sonnet-5-5) | Medium to max raises the composite index from 41 to 56 and estimated task cost from $0.59 to $7.67. |
| [Claude Opus 5.5](https://artificialanalysis.ai/models/releases/claude-opus-5-5) | Xhigh and max tie at 59.60% terminal passes, while estimated task cost rises from $8.78 to $13.11. |
| [Claude Fable 5.1](https://artificialanalysis.ai/models/releases/claude-fable-5-1) | Terminal pass rate peaks at xhigh, while max adds about 0.15 composite points at about 28% more cost. |

Higher Luna effort can improve this composite through max, with increasing cost and answer latency.

Artificial Analysis's ten-evaluation composite mixes coding, agent, science, and general tasks.
Its prices estimate token costs with typical cache behavior rather than actual invoices.
Its Fable, Opus, and Sonnet configurations allow default fallback to another Claude model.
Its Sonnet release article identifies a prerelease structured-output bug and planned reruns.
DeepSWE uses mini-swe-agent and an alias from a job before Astra's public release.
These differences prevent an isolated comparison with native Codex or Claude Code results.
Rounded score changes do not establish statistical significance or gains on every workload.

The [official model-selection guide](https://developers.openai.com/api/docs/guides/model-selection.md) includes Luna xhigh for constrained problem-solving and multi-app work.
These sources do not establish equivalent Luna and Sonnet performance across workloads.

We read the supplied Haiku system card and visually inspected every capability effort curve in Section 8.
FrontierCode reports five runs per task in Claude Code and uses output tokens rather than reported Haiku costs.
Max adds 0.6 percentage points over xhigh on Main while using about 80% more output tokens, estimated from the figure.
The source supplies no uncertainty intervals for that coding comparison.
The runtime's debugging, refactoring, and review choices extend that coding evidence as workload judgments, rather than separate measured rankings.
The reviewed research, visual, computer-use, professional, and healthcare results show different effort gains and latency costs.
Their limits prevent a single effort default for every Haiku workload.

Practitioner evidence supplements these broad benchmarks with specific failure conditions.
The Sol coding study reaches its small sample's score ceiling.
GitDiagram changes both fixtures and service tier when lowering Luna effort.
Willison's Opus max SVG request exhausts its output allowance without a final answer.
The detailed record links the original reports and states those limitations.

The OpenAI [deployment checklist](https://developers.openai.com/api/docs/guides/deployment-checklist.md) recommends representative evaluations before accepting higher latency and cost.
The [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning.md) bills reasoning tokens as output.
Anthropic's [pricing guide](https://platform.claude.com/docs/en/about-claude/pricing.md) separates token rates from cache and speed modifiers.
Compare acceptance results with the same workload, harness, tools, fallback, service tier, caching, and pricing conditions.
Include workers, retries, and tool charges in total workflow cost.
Effort names do not define equal compute across models or fixed cost multipliers.
Local hook and Workflow checks test instruction delivery and tool execution, not model quality or these effort curves.

Use `medium` for routine work and `high` for harder work as a labeled default and ceiling, not a measured efficiency optimum.
No public effort comparison, numerical thinking budget, or gateway translation test establishes performance for either model.
These provider labels do not equate to Claude or OpenAI effort levels.
Native Claude Code effort translation, effective context, and current pricing remain unverified.
The detailed model limits, Copilot pricing, and Claude Code 2.1.302 schema observations are maintained in the [model-effort evidence](model-effort-evidence.md#gemini-38-flash-and-gemini-4-argon).

### Host Model Selection

Claude Code supports `fable`, `opus`, `sonnet`, and `haiku` aliases, as documented in its [model configuration](https://code.claude.com/docs/en/model-config.md).
Provider routing, overrides, and allowlists can resolve an alias to another release.
The exact Haiku 5.5 ID is `claude-haiku-5-5`, without a date suffix.
The Haiku guidance assumes Haiku 5.5.
Claude Code does not accept `max` in persistent `effortLevel` or `modelSettings` values.
Use `max` per session, through an effort frontmatter override, or through `CLAUDE_CODE_EFFORT_LEVEL`.
Use model identifiers supported by the active host and preserve explicitly required versions.
Record requested settings and report resolved settings only when the host supplies them, otherwise mark them unknown.
Follow the current tool contract for fork inheritance and override support.

Delivery remains conditional and retains Workgraph's authorization, check reuse, and independent review rules.
Host adapters use current tool names and supported model settings.
The current host's fork contract governs inheritance and overrides.
These structural choices supply no model-performance evidence.

### Skill Structure

We reviewed the official [Claude Code skills documentation](https://code.claude.com/docs/en/skills) and the complete [Agent Skills source](https://agentskills.io/llms-full.txt).
Claude uses descriptions to select skills and supports user-only invocation through frontmatter.
The Agent Skills guidance recommends clear activation conditions, focused bodies, and conditional references.
The specification recommends fewer than 500 lines per body and one level of references.
Workgraph keeps role rules inline and injects each role's matching host reference during startup.
Delivery remains conditional, with its route in Main.
Main and Worker route prose, instruction design, and source work to bundled task skills.
Those skills retain their own procedures and conditional language references.
Consumer references remain inside their owning plugin so installation and activation do not depend on another plugin.
The hook names loaded source paths so the model can locate references and recognize content already present.
All skills remain user-invocable and model-invocable.
Claude defaults `user-invocable` to `true`, so Workgraph omits that redundant frontmatter field.
Their bodies define role and scope boundaries independently of invocation metadata.
Claude's installed Skill loader strips YAML, preserves trailing body whitespace, and prepends a base-directory line.
Its Read tool normalizes file text and adds tab-separated line numbers, including a final empty line.
Codex's [versioned skill renderer](https://github.com/openai/codex/blob/rust-v0.157.1/codex-rs/ext/skills/src/fragments.rs) wraps the complete file with its name and path.
The hooks match these instruction text fragments and identify already-loaded sources outside them.
They cannot reproduce native message roles or tool-call envelopes.
The [delivery design](design.md#deliver-context) records this boundary.
Workflow's description states its activation boundary, and its body defines dependency gates without repeating Main's finding classifications.
Its delivery reference maps node inputs and outputs for authorized engineering delivery.
Main and Worker inspect failures and partial effects before reasonable authorized retries or alternative supported forms.
They preserve security controls and report each attempt honestly rather than applying a blanket no-retry rule.
We need behavioral evaluation to measure activation or model adherence for these structure choices.

Workgraph keeps a stable Main mode entry, focused development playbooks, two conditional principle skills, and host-specific user adapters.
The README leads users to installation and invocation guidance rather than repeating role procedures.
User adapters separate host setup from role policy, while Workgraph retains its contracts and evidence rules.
The official skills and prompting documents above support the adapter and contract separation.
These structural choices remain unverified for model adherence until a behavioral evaluation covers them.

### Host Instruction Comparison

We compared the local Codex checkout with instructions bundled in Claude Code 2.1.287.
The following sources establish overlapping instructions.
GitHub references use branches or tags so maintainers can inspect the current implementation.

| Supplied instruction | Source | Workgraph change |
| --- | --- | --- |
| Authorization, completion, corrections, general writing, and scoped checks. | Codex's [model catalog](https://github.com/openai/codex/blob/main/codex-rs/models-manager/models.json) contains these instructions for Sol, Astra, and Luna. | Remove general reminders from each skill. |
| Model catalog controls, supported overrides, fork inheritance, and native result delivery. | Codex's [agent tool definitions](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs) and [agent prompt assembly](https://github.com/openai/codex/blob/main/codex-rs/prompts/src/multi_agent_instructions.rs) supply these contracts. | Remove host-control and notification recipes. |
| Notifications, no polling, fresh-context briefing, and checking delegated changes. | Installed Claude Code Agent tool descriptions provide these instructions in their foreground and background variants. | Retain resource ownership and acceptance criteria instead of repeating Agent usage. |
| Reading an existing file before writing it. | Installed Claude Code Write tool descriptions require the read in both regular and lean variants. | Remove the repeated read-before-edit rule. |
| Workflow opt-in, native authoring, journals, resume identifiers, cache invalidation, and later-call reruns. | Installed Claude Code Workflow descriptions and their native authoring reference define these mechanics. | Keep graph-specific acceptance and conservative append-only recovery guidance in the bundled Workflow reference. |
| Native delegation without Claude Code Workflow. | Codex's [tool registration](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/spec_plan.rs) registers agent lifecycle and messaging tools. | Route Claude orchestration selection to Workflow and use native delegation in Codex. |
| Peer messages cannot grant permission or bypass denied actions. | Installed Claude Code SendMessage descriptions and peer-message reminders define these restrictions. | Remove repeated permission-laundering warnings. |

Native Workflow probes confirmed item-local pipeline progression, unawaited agents not starting, all-null early returns, and same-run append reuse.
Those observations do not establish every cache-key detail or model adherence.

Codex [renders captured model instructions](https://github.com/openai/codex/blob/main/codex-rs/prompts/src/model_instructions.rs).
Configured base instructions and refreshed remote catalogs can replace the bundled defaults.
Codex's older agent-tool descriptions contain more delegation guidance than its newer descriptions.
We did not treat an older tool variant as proof of current Sol instructions.
Claude's installed binary also contains model-gated and style-gated prompt variants.
Their presence does not prove that every session receives them.
The comparison establishes source overlap, not universal deployment behavior or model adherence.

The inspected Codex catalog defaults Astra to low, Sol to low, and Luna to medium.
Those defaults differ from API defaults and some documented task recommendations.
Luna's bundled prompt also restricts tests unless the user requests testing or verification.
Sol and Astra instead direct appropriate checks.
Workgraph does not reproduce those changing host rules.

The skills retain role ownership while honoring user communication and model-selection requirements.
Runtime references use family names rather than pinned release identifiers.
Research records retain the measured releases so benchmark results keep their original meaning.
They retain dependency routing, one writer per resource, delegated Git grants, publication privacy, and the shared-history restriction.
They also retain independent review, blocker criteria, registered deferrals, evidence freshness, and cleanup ownership.
Main and Worker load in separate sessions, while Workflow adds only its operation to the Main session.
Codex's [fork loader](https://github.com/openai/codex/blob/main/codex-rs/core/src/agent/control/spawn.rs) can retain Main's hook context from parent history.
Worker isolation therefore describes newly injected content rather than the complete inherited session.
References provide their own details without explaining upper-level instructions.
Benchmark tables, prices, and workload anecdotes remain in maintainer research.

### Repository Context Studies

[Evaluating AGENTS.md](https://arxiv.org/html/2602.11988v2) evaluates context files on Python coding tasks with four agent-model pairings.
The authors report no general improvement in task success and higher average inference cost.
Their analysis finds that repository overviews and redundant documentation can add work without helping agents locate relevant files.
Their recommendations favor specific instructions beyond information already present in the repository.
We reviewed the main text, including the discussion of redundancy and evaluation limits.

[On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents](https://arxiv.org/html/2601.20404v2) reports a different result.
The authors compare runs on 124 pull requests from ten repositories using Codex with gpt-5.2-codex.
They observe lower median runtime and output token use with the repository instructions present.
Their manual sanity check does not establish patch correctness.
We reviewed the study design, results, and limitations.

These studies measure different outcomes on different samples.
They support measuring instruction effects rather than assuming that more or fewer instructions must improve performance.
Workgraph retains local conventions and required checks but avoids copying the runtime contract into `AGENTS.md`.
Neither study evaluates this plugin or GPT-6 Astra.

### Context Selection

[Lost in the Middle](https://arxiv.org/abs/2307.03172) studies retrieval from long contexts in question answering and key-value tasks.
Its abstract reports sensitivity to the position of relevant information.
The work motivates attention to context selection, but it does not measure current coding-agent instructions.

[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) recommends focused instructions and context retrieval as needed.
It describes separating detailed subagent work from the lead agent's synthesis.
This is product engineering guidance rather than a controlled evaluation of Workgraph.

We apply focused context selection through the [role and audience boundaries](design.md#separate-the-audiences).
Research and maintenance details stay outside consumer context.
A dispatch must include missing constraints when the receiver's context is unknown.

## Graph Engineering

### Task, Agent, And State Graphs

[Graph Engineering in the Era of LLM Agents](https://arxiv.org/abs/2608.21156) surveys graph structures for tasks, agents, and system states.
Its abstract argues for explicit coordination as tasks become more interdependent.
A survey's proposed framework does not establish that every task needs several agents or a graph runtime.

Workgraph represents connected, substantive work as a goal-dependent task graph in the current task plan.
The host retains ownership of task execution and execution state.

[Graph of Thoughts](https://arxiv.org/abs/2308.09687) represents model-generated information as a graph for prompting and refinement.
We reviewed its abstract to distinguish that approach from a task dependency graph.
Workgraph does not request private reasoning traces or construct a thought graph.

### Scheduling And Dependency Evidence

[An LLM Compiler for Parallel Function Calling](https://arxiv.org/abs/2312.04511) separates planning, task dispatch, and execution.
Its abstract describes parallel function calls and task-specific latency, cost, and accuracy results.
The full text reports planner overhead exceeding half the latency on one task and a slower result on WebShop.
It also reports a task that required replanning because intermediate results determined its dependencies.
We apply the dependency principle by starting ready nodes and serializing conflicting writes.
The reported benchmark gains do not predict Workgraph's gains.

[GRADE](https://arxiv.org/abs/2606.22741) distinguishes execution edges from observed, declared, and inferred dependency edges.
The abstract also reports controls that limit conclusions about the value of particular graph structures.
We retain that distinction in planning and avoid inferring dependency from execution order.
We reviewed the abstract rather than independently evaluating its graph metrics.

The [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api) provides a concrete node, edge, state, and execution model.
[Microsoft's workflow documentation](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/builder-and-execution) describes executor connections and synchronization.
[Apache Airflow's task documentation](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html) distinguishes upstream dependencies from data transfer between tasks.
Its tasks run independently and do not pass information by default.
These references inform scheduling vocabulary, but Workgraph must pass actual results to dependent agents.
Their runtime, persistence, and recovery guarantees belong to those products.
Workgraph adopts none of their runtime components.

[GPTSwarm](https://arxiv.org/abs/2402.16823) optimizes graph edges between language agents.
Its Mini Crosswords results show that dense and random graphs underperform its optimized graph.
Those task-specific results support choosing meaningful edges rather than linking every agent.
[ADaPT](https://arxiv.org/abs/2311.05772) decomposes tasks when the executor cannot complete them.
Its benchmark improvements support as-needed decomposition, not prebuilding speculative phases for Workgraph.

### Coordination Costs

[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) recommends starting with the simplest design and adding complexity only when outcomes improve.
It distinguishes predefined workflow paths from agents that choose their own actions.
The [OpenAI Agents SDK orchestration guide](https://openai.github.io/openai-agents-python/multi_agent/) shows independent parallel agents alongside code-controlled orchestration.
Neither guide measures Claude Code Agent against native Workflow for this plugin.

[Towards a Science of Scaling Agent Systems](https://arxiv.org/abs/2512.08296) compares coordination architectures across agentic benchmarks.
Its abstract reports benefits on decomposable tasks and degradation on sequential planning tasks.
It also identifies overhead in tool-heavy work and error propagation without centralized verification.
These results support choosing coordination according to task structure rather than agent count.
We reviewed the abstract and retain its benchmark scope.

[Agentless](https://arxiv.org/abs/2407.01489) uses localization, repair, and validation without an open-ended agent loop.
Its abstract reports competitive results on SWE-bench Lite for the models and baseline systems tested at the time.
The paper motivates a simple baseline, not a universal three-stage process.
The role contract delegates ready, substantial outcomes without fixing a reviewer or worker count.

[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) describes scoped research delegation and compressed results.
The authors discuss coordination cost and warn that coding work often offers less parallelism than research.
We use bounded dispatches and pass conclusions with evidence references.
The article's research-task gains do not establish coding-task gains.

[More Agents Is All You Need](https://arxiv.org/abs/2402.05120) reports gains from independent sampling and voting on reasoning benchmarks.
Its token cost rises with agent count, and its setup does not test delegated coding workers.
This supports testing independent fan-out as a simpler baseline, not assuming more agents improve every task.
In Claude Code, Workgraph selects Workflow when an identified follow-up may depend on a prior result.
The sources do not establish that this routing improves Workgraph outcomes.

## Verification And Recovery

### Lauren Tan On Verification And Agent Environments

We reviewed Lauren Tan's [recorded presentation](https://x.com/poteto/status/2102050467505430555), published on September 21, 2026 UTC.
The approximately 38-minute recording and its automatic English captions describe practitioner experience at Cursor and Grok Bot.
The post names 2,500 production PRs, while the opening slide and captions name 2,000.
We retain that discrepancy without treating either count as measured Workgraph evidence.

At 09:15–12:34, Tan combines a reproducible CLI with a feature map describing behavior and access paths.
At 14:56–18:57, she prioritizes code structure, static analysis, rules and Bugbot, skills, then human-applied style guidance.
At 26:43–30:38, Dune slides show execution boundaries, state ownership, discovered feature files, and checks before review.
At 32:35–35:16, external reports and alerts trigger work using existing bot and cloud-agent tooling.

These examples motivate Verification and Development's correction procedure.
Workgraph reuses existing commands and adds a focused [maintainer verification map](verification-map.md).
Consumer feature maps remain optional, local to the relevant project, and updated with affected behavior.
Main already owns ready-node execution, bounded assignments, and shared-resource writers.
The host already owns connectors, event delivery, and task execution.
We retain those boundaries instead of adding a scheduler or copying Dune's framework.

Tan describes banning comments in Dune after agents used them to justify workarounds.
Workgraph's [comment policy](../skills/development/SKILL.md#documentation-and-comments) permits declaration documentation and preserves required directives, licenses, existing suppressions, and documented safety invariants.
Workgraph records risky transformations as policy text without adding explanatory logging or automatic rewrites.
Her talk supplies no controlled Workgraph evaluation, proof of universal comment harm, or automatic-merge acceptance policy.
Runtime observation does not establish formal correctness, and hook delivery does not establish model adherence.

[Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657) introduces the MAST failure taxonomy.
Its abstract groups failures into system design, inter-agent misalignment, and task verification.
Workgraph addresses these categories through clear assignments, completion evidence, and bounded feedback loops.
The paper does not establish English as the best coordination language.
Workgraph follows the user's language and assignment requirements.

[Verification-Aware Planning for Multi-Agent Systems](https://aclanthology.org/2026.eacl-long.353/) connects task dependencies with verification functions.
The EACL 2026 abstract describes failures in task interpretation, output formats, and handoffs.
It supports planning acceptance evidence alongside subtasks.
Workgraph uses existing checks and does not generate a verification framework from the paper.

[SagaLLM](https://arxiv.org/abs/2503.11951) addresses validation, context loss, and recovery through a transactional architecture.
Its abstract describes persistent memory, compensation, and independent validation.
It motivates checking partial effects before retrying a write.
Workgraph does not implement transactions, automatic compensation, or durable recovery.

### Bounded Feedback And Review Evidence

We read the complete original [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic.md), published October 15, 2026.
Addy Osmani, Morgan Westlee Lunt, and Qing Wang describe Anthropic's layered review process and its operational results.
This practitioner report does not establish Workgraph effectiveness or authorize a review product, provider, or approval policy.

| Article lesson | Workgraph application |
| --- | --- |
| Runnable verification precedes review. | Development and Verification already require observable checks, commands, outcomes, and evidence limits. |
| Review evaluates intent and system impact. | Delivery now supplies the complete candidate, project review instructions, acceptance, and affected real consumers. |
| Findings need verification and disposition. | Delivery now distinguishes introduced defects, pre-existing issues, evidence-based rejection, fixes, and tracked deferrals. |
| Review effort follows risk. | Delivery selects reviewer staffing and depth by task risk and explicit requirements. |
| Review must converge. | Delivery and its Workflow consumer now retain prior dispositions and reassess affected interactions without repeating resolved findings. |
| Human authority and ownership remain explicit. | Main already owns authorized delivery, while Delivery preserves required human approvals and now records recovery considerations. |
| Repeated failures should improve the responsible layer. | Development already prioritizes root causes, existing checks, and narrowly justified instruction changes. |

Workgraph scales review to the task and refreshes it when changed scope or invalidated evidence requires new coverage.
The article's fixed round count and voting system do not become universal Workgraph requirements.
Project-wide lint, mandatory harness rules, CI enforcement, and repository approval configuration remain outside this agent-workflow change.
Cloud review, merge queues, flags, staged releases, telemetry, and incident datasets require separate product needs and authority.
Source validation and hook inspection establish instruction delivery, while installed activation and model adherence remain separate acceptance.

[When Agents Do Not Stop: Uncovering Infinite Agentic Loops in LLM Agents](https://arxiv.org/abs/2607.01641v1) studies unbounded feedback paths in agent systems.
The authors report 68 confirmed failures across 47 repositories among 6,549 examined repositories.
These are findings from the paper's sample, not Workgraph results.
The study motivates bounded review and repair loops with a no-progress exit, but it does not measure this policy's effect in Workgraph.

[Are LLMs Reliable Code Reviewers? Systematic Overcorrection in Requirement Conformance Judgement](https://arxiv.org/abs/2603.00539v1) reports false rejection of correct small Python programs.
The authors also report that requests for explanations and suggested fixes sometimes worsen review judgments.
The study does not establish that reviewer errors are independent across agents.
Workgraph therefore treats a reviewer claim as a candidate, requires concrete source or check evidence from verification, and reports missing evidence as unverified.

[Rethinking the Value of Agent-Generated Tests for LLM-Based Software Engineering Agents](https://arxiv.org/abs/2602.07900v2) examines agent-generated tests on SWE-bench Verified.
Its prompt intervention did not significantly change final outcomes when it changed the volume of generated tests.
That result does not show that repository-required checks can be skipped.
Workgraph keeps required checks in the consumer repository's validation process.

The [role host references](design.md#separate-the-audiences) own execution timing and waiting recommendations.
The [wait input schema](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/code_mode/wait_spec.rs) identifies `yield_time_ms` and a ten-second default.
The [wait handler](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/code_mode/wait_handler.rs) uses that fixed default when the argument is omitted.
The [configuration schema](https://github.com/openai/codex/blob/main/codex-rs/features/src/feature_configs.rs) exposes no default or minimum for Code Mode `functions.wait` yield timing.
Its `default_exec_yield_time_ms` setting controls the initial exec call, not later wait calls.
The [Codex configuration default](https://github.com/openai/codex/blob/main/codex-rs/core/src/config/mod.rs) is thirty seconds for that initial exec call.
The [runtime](https://github.com/openai/codex/blob/main/codex-rs/code-mode-runtime/src/service.rs) accepts a per-call duration, adds grace, and applies any host session cap.
Completion or interruption can return before the requested duration.
Each role loads its own execution reference so Worker waiting does not depend on Main forwarding instructions.
The [child configuration](https://github.com/openai/codex/blob/main/codex-rs/core/src/agent/child_config.rs) inherits the parent's effective configuration.
That includes the exec yield default, but existing sessions can retain their earlier configuration snapshot.
Claude Code's [foreground timeout controls](https://code.claude.com/docs/en/env-vars) use `BASH_DEFAULT_TIMEOUT_MS` and `BASH_MAX_TIMEOUT_MS`.
The installed Claude Code 2.1.288 resolves the same foreground default for Main and subagent Bash calls.
Claude Code permits explicit foreground timeouts up to ten minutes.
Foreground timeout normally moves an unfinished command to the background when the host permits background execution.
The [background execution limit](https://code.claude.com/docs/en/tools-reference#time-limit-for-background-commands) is separate from that transition.
An explicit background command's timeout can stop the command when its background deadline applies.
Foreground timeout, background execution duration, and wait yield duration are separate controls.
The [Monitor tool](https://code.claude.com/docs/en/tools-reference#monitor-tool) delivers command output or external events while the conversation continues.
Main and Worker consider Monitor when available, without adding a watch timeout recommendation.
Its watch deadline is separate from Bash's foreground timeout and Codex's wait yield duration.
The installed tool uses a feature gate, so availability depends on the active host.
Claude Code's [scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks) support fixed loops through `/loop`.
Dynamic loops use `ScheduleWakeup`.
There is no global loop-interval setting, and scheduled prompts can wait until the current turn ends.
The [goal check-in setting](https://code.claude.com/docs/en/env-vars) accepts `CLAUDE_CODE_GOAL_CHECKIN_MINUTES=4` in the installed runtime.
That changes the first deferred-goal check-in from thirty minutes to four minutes.
Later [goal check-ins](https://code.claude.com/docs/en/goal#background-work-defers-evaluation) back off to eight and sixteen minutes, with at most three idle deliveries between user prompts.
This setting does not create a cron task or restart an exited process.
The [cache lifetime](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#faq) normally lasts five minutes and refreshes when a request uses the cached content.
Claude Code's [cache defaults](https://code.claude.com/docs/en/prompt-caching) vary by provider and request type.
A `270000` ms interval does not prove cache reuse because queueing, model changes, or prefix changes can prevent it.
The official [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference) lists `TaskOutput` as deprecated.
The official [changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21277) records its removal in version 2.1.277.
The installed Claude Code 2.1.288 settings schema states that `TaskOutput` was removed and `taskOutputMaxChars` has no effect.
We found no active `TaskOutput` registration or input schema in that executable.
Its background Agent instructions prohibit polling and sleeping while waiting for completion notifications.
Its fork Agent instructions also prohibit reading or tailing agent output files while waiting for those notifications.
Workflow also delivers completion through a task notification.
The installed executable also contains a gated Poll tool for queued harness events, with no timeout input.
We have not verified its availability in an active session.
We found no equivalent blocking agent wait that accepts a four-minute timeout in this version.
Reading a background command's output file does not wait for an agent or provide a wait timeout.
Keep these Claude Agent restrictions separate from Codex's native wait policy.
The injected skills do not repeat restrictions already supplied by native tools.
The papers do not establish the effectiveness of Workgraph's waiting instructions.

### Harness2 Verification Evidence Evaluation

We compared the unchanged public [Verification skill](../skills/verification/SKILL.md) with an unmerged three-line expansion on a fixed synthetic evidence-attribution task.
The task had eight status-and-citation criteria and five semantic criteria across three trials.
The third trial was configured to reverse record order, without separately recording runtime request payloads.
GPT-6 Luna scored 13/13 on every trial for both variants.
GPT-6.1 Sol independently judged responses with maintained [Harness2](https://github.com/google-research/harness2/tree/main) tools `core.judge.judge_one` and `core.judge.write`.
The evaluation used a custom score adapter in hardened Linux containers.
Three Haiku baseline trials made six requests: the first returned HTTP 403, and five returned HTTP 503.
Those Haiku results are ungraded, and candidate trials were excluded without requests.
All 20 HTTP attempts comprised 12 solver attempts, with six successes and six failures, and eight valid judge attempts.
A manually reviewed baseline positive control scored 13/13.
A handwritten false-execution, all-pass negative scored 3/13, with all five semantic criteria false.
These controls calibrate the grader and are not additional solver successes.
The graded comparison ties, so it gives no measured reason to expand Verification or add redundant rules.
The proposed expansion remains unmerged, and Verification behavior remains unchanged.
The authoring change requires grader calibration and explicit coverage reporting.
The new native [case](../evals/verification-evidence/case.yaml) defines regression coverage but remains UNRUN.
Neither provides evidence of runtime or model-adherence gains.
No native activation, generalization, stock JobBench, recursive sweep, or selection evidence exists.

### Instruction Boundary Reinforcement Rerun

We compared Instruction Authoring and the shared plugin-update router before and after their auto-injection and host-neutrality changes.
The fixed synthetic task combined skill revision with a separate update plan for one project-declared host.
Ten criteria separated literal filename exclusion from retrieval behavior, convention placement, procedure preservation, and host-specific update routing.
The third trial reversed the draft rule order for both variants.

The calibrated comparison made fourteen HTTP requests: six solver calls and eight successful judge calls.
GPT-6 Luna supplied six complete solver responses, and GPT-6.1 Sol supplied all judge responses.
Raw judge scores were 6/10, 6/10, and 8/10 for baseline, versus 9/10, 8/10, and 10/10 for candidate.
All candidates met the sampled retrieval, literal naming, shared-host neutrality, and update-routing criteria.
Candidate scores still missed required-procedure preservation twice and convention placement once.
Original-task positive and negative controls scored 10/10 and 3/10, without counting additional solver successes.
These scores describe one synthetic task, not a universal improvement or complete adherence.
Independent review disputed one baseline procedure-preservation failure because the response retained both steps in records-focused language.
Raw scores remain judge outputs, not independently validated success counts.
Host-update decisions passed in every baseline and candidate, so that subtask provides no measured distinction.

An earlier thirteen-request authoring-only comparison had one HTTP 408 solver failure, which remains ungraded.
Its controls omitted the original draft and could not substantiate procedure-preservation grading.
The calibrated run supplied that draft to both controls and kept the original failure separate.
The earlier control comparison is not acceptance evidence, and the two tasks' scores are not pooled.

The rerun used maintained `core.judge.judge_one` and `core.judge.write` through a custom adapter in a bounded Linux container.
Public-only source and inputs were read-only mounts, with writable task-owned output, dropped capabilities, and no credential or socket mounts.
The container had a non-root user, read-only root filesystem, resource limits, and a 900-second timeout.
Network egress was not enforced, and model output was never executed.
All requests used the maintained local gateway without changing provider configuration.
The run establishes neither native activation, permission enforcement, broad model adherence, nor stock benchmark or recursive-sweep coverage.
The maintained native evidence-assessment case remains unrun because the worktree isolation guard refused its evaluator invocation.

### Scoped Contributor Review Reinforcement

We compared shared review routing and role Scope text before and after the scoped contributor-policy move and requested deletions.
The fixed synthetic task combined source transformations, requirement preservation, and a plan for a complete posted candidate.
Ten criteria covered the neutral root pointer, complete scoped policy, exact deletions, review execution planning, preservation, and honest evidence.
The third trial reversed the independent source-block order for both variants.
Both variants received the original draft and explicit transformation requirements, so this was not a blind causal comparison.

Fourteen requests completed with HTTP 200 and stopped responses: six GPT-6 Luna solver calls and eight GPT-6.1 Sol judge calls.
Requested and returned model identifiers matched, with no failed requests, truncated responses, or ungraded rows.
Raw baseline grades were 8/10, 9/10, and 9/10, while all three candidate responses received 10/10.
The raw judge marked the root-boundary criterion false in every baseline and Scope preservation false in one baseline.
Original-task positive and negative controls received 10/10 and 0/10, without counting additional solver successes.
These raw model judgments describe one bounded authoring-and-plan task, not general adherence or a universal improvement.
Independent reconciliation confirmed all request records, source inputs, control grades, and eighty criterion decisions against the ledger.
Content review disputed Scope-preservation passes in every candidate and one baseline because requested sections were abbreviated or omitted.
Several responses also misstated the configured future presentation order.
The simple controls do not establish nuanced grading reliability, so the raw grades are not verified perfect-pass or robust-improvement evidence.

Independent static preflight rejected the first evaluator before any model requests ran.
The repaired control states that each reviewer receives the complete materials, and runtime status distinguishes request execution from calibration.
Response bounds, error-sensitive process status, and working-directory environment checks also passed independent static re-verification.
That rejected preflight is not a failed model request or part of the fourteen-request comparison.

The run used maintained Harness2 judge and write functions through the external custom adapter and existing local gateway.
The task-owned Linux container used a non-root user, read-only root and source mounts, writable output, and an empty temporary working directory.
Dropped capabilities, resource limits, and a 1,200-second timeout bounded execution without mounting credentials, home, sockets, or the repository checkout.
Network egress was not enforced, and model output was never executed.
The result establishes neither native activation, permission enforcement, stock benchmark coverage, nor general model adherence.

## Language Tooling And Rule Mappings

Preserve a project's working lint and formatter choices before applying defaults to an unconfigured project.
The Development skill selects Ruff, Ultracite with Oxlint and Oxfmt, ktlint, and golangci-lint for authorized setup.
Java retains its selected native tools, including Spotless with Palantir Java Format and Checkstyle.

Workgraph's language references distinguish syntax-only tooling from compiler-backed checks.
Tool coverage must be verified in the consuming project rather than inferred from another project's results.
This guidance supplies neither consumer test evidence nor proof of model adherence.

| Rule area | Applicable guidance |
| --- | --- |
| Imports | Preserve wildcard imports and qualified names when name resolution is uncertain. |
| Kotlin import conversion | Restrict syntax-only rules to type references and verify resolution beyond their single-file checks. |
| Declaration names | Preserve Kotlin override, open, abstract, and interface contracts and Java's overridden names and supported unnamed bindings. |
| Java documentation and spacing | Review multiline Javadoc, documentation quality, and method-body spacing beyond the selected tools' coverage. |
| Logging | Avoid false-positive lexical checks against text blocks or shadowed names. |
| Control flow | Preserve semantic edge cases instead of promising syntax-only automatic fixes. |

Syntax-only Kotlin import conversion cannot establish compiler symbol resolution or expression receiver meaning.
Preserve conflicting declarations, aliases, wildcard imports, same-package references, and existing unqualified uses unless resolution proves safety.
Java import transformations also need collision-safety evidence.
Lexical logging checks can match shadowed `System` names or text-block content.
Workgraph retains these limits when recommending safe automation.

Check Kotlin compatibility, Java compilation, and lint-runtime requirements independently when choosing Gradle versions.
Verify the target's supported combination instead of assuming the newest stable tool is compatible.
Register custom rulesets with the consumer's ktlint runtime and prove native lint discovers them.
Workgraph bundles language guidance only and does not install consumer rules, plugins, or hooks.

## Codex Native Cleanup

This section records historical, non-operational transport research.
It supplies no cleanup interface or fallback authority.
Current cleanup follows [Codex Scoped Cleanup](../skills/codex-scoped-cleanup/SKILL.md) through the authorized resource owner and supported host operations.

We inspected Local CLI 0.161.0, managed daemon 0.162.1, and the official Codex checkout's named `main` branch.
The inspected versions differed, so we generated experimental schemas from both executables and used the daemon schema for protocol checks.
The [official app-server guide](https://learn.chatgpt.com/docs/app-server) informed initialization and version-matched schema checks.
The inspected [CLI](https://github.com/openai/codex/blob/main/codex-rs/cli/src/main.rs) selected the control socket for its proxy.
The [proxy](https://github.com/openai/codex/blob/main/codex-rs/stdio-to-uds/src/lib.rs) forwarded bytes without translating protocol framing.
The [control transport](https://github.com/openai/codex/blob/main/codex-rs/app-server-transport/src/transport/unix_socket.rs) upgraded connections to WebSocket.

Non-mutating daemon checks verified initialization, two active-list pages, two archived-list pages, loaded inventory, attachment listing, and owner lookup.
We used an installed maintained WebSocket client and an absent synthetic attachment identity for the owner lookup.
An earlier raw newline-delimited proxy probe timed out because it did not perform the required transport handshake.
Both clients closed after their checks, and no archive, delete, or attachment mutation ran.
These bounded reads verified protocol access rather than exhaustive target inventory or cleanup effects.

The inspected [Thread processor](https://github.com/openai/codex/blob/main/codex-rs/app-server/src/request_processors/thread_processor.rs) defined inventory defaults and archive preparation.
Its relation query removed default source and provider filters only when those fields were omitted.
The [state query](https://github.com/openai/codex/blob/main/codex-rs/state/src/runtime/threads.rs) included persisted descendants without user messages.
Its global listing could omit those rows, so the recorded global inventory did not establish complete owner or descendant coverage.
The [agent control](https://github.com/openai/codex/blob/main/codex-rs/core/src/agent/control.rs) could omit ephemeral children or failed spawn-edge persistence.
The Thread manager combined persisted and live descendants, so persisted relation pages did not prove complete subtree coverage.
The [delete processor](https://github.com/openai/codex/blob/main/codex-rs/app-server/src/request_processors/thread_delete.rs) prepared the spawn subtree before persistent deletion.
The [Local delete implementation](https://github.com/openai/codex/blob/main/codex-rs/thread-store/src/local/delete_thread.rs) checked external references and removed persisted data.
Its multi-thread loop could leave partial file deletion before state rows were removed.
The [Thread manager](https://github.com/openai/codex/blob/main/codex-rs/core/src/thread_manager.rs) guarded live internal workers.
Preparation could shut down earlier ordinary runtimes before a later descendant rejected removal.
The [Local archive implementation](https://github.com/openai/codex/blob/main/codex-rs/thread-store/src/local/archive_thread.rs) could log descendant failures after root archival succeeded.
These observations motivated complete affected-set readback after a reported archive success.

The [attachment processor](https://github.com/openai/codex/blob/main/codex-rs/app-server/src/request_processors/thread_attachments.rs) provided paginated owner lookup.
The [app-server reference](https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md) distinguished connection removal from referenced-resource deletion.
These sources informed Workgraph's descendant protection, writer checks, exact readback, and partial-effect reconciliation.
The inspected native worktree tool contracts described snapshot preservation and detached restore behavior.
Those contracts distinguished conversation archival from physical worktree archival.
This research did not establish installed-version parity, actual deletion results, Cloud filesystem cleanup, or model adherence.

## Go Linting

The official [Go Plugin System documentation](https://golangci-lint.run/docs/plugins/go-plugins/) recommends the Module Plugin System for custom linters.
The official [Module Plugin System documentation](https://golangci-lint.run/docs/plugins/module-plugins/) describes its setup.
The Go Plugin System documentation describes Go plugin build and dependency constraints.
The official [FAQ](https://golangci-lint.run/docs/welcome/faq/) describes supported Go versions and compatibility with the Go version used to build golangci-lint.
These sources support guidance to prefer built-in linters, check toolchain compatibility, and use the recommended plugin mechanism.
They do not establish compatibility for a particular repository or replace independent security and semantic checks.

## Writing And Host Contracts

### Native Workflow Stage Adoption

We read the complete original [mirku post](https://x.com/mirku21/status/2111200540772221418), published October 16, 2026.
We also read the complete official [Workflow documentation](https://code.claude.com/docs/en/workflows.md).
The post combines a Claude model split, isolated edits, independent verification, bounded fixes, deterministic decision routing, and an explicit approval gate.
The official documentation supports native scripts, cross-checking, isolated migration edits, and two consecutive no-progress fix rounds.
It describes host permissions and separate runs for operator sign-off between stages.

| Supplied requirement | Workgraph adoption |
| --- | --- |
| Opus 5.5 Main with ultracode. | Workgraph selects tiers by task difficulty and honors compatible user and configuration choices. |
| Haiku 5.5 read-only scans and Sonnet 5.5 isolated edits. | Workflow passes selected settings into stages with separate edit worktrees. |
| Independent verification before every reported finding. | Main excludes the finder and fixer from verification, and Workflow preserves per-candidate outcomes. |
| Two rounds without fix progress. | Fix loops compare results and reassess stalled work without waiving acceptance. |
| Deterministic decision routing. | Native script control flow handles deterministic choices without requiring another execution engine. |
| Diff-first approval before edits. | Explicit consumer gates end proposal work before edits and require approval for the gated scope. |

The post ends its quoted setup-rebuild request with this operator gate.

> Show me every change as a diff first, no edits until I say go

That sentence requires approval before edits for the quoted request.
A separate source-adoption authorization permits its specified source delivery without claiming approval for that live rebuild.
No quoted example grants permission to change live models, ultracode, credentials, permissions, or plugin activation.
Main ownership, complete-candidate review, and normal Delivery integration boundaries remain required.

The post's model split is not an official universal Workflow default or a measured performance ranking.
Provider routing and model overrides can resolve aliases differently, so requested names do not prove resolved releases.
Codex uses its configured model settings and cannot execute Claude's native Workflow.
The post's throughput and cost claims are unverified here, and script-held results do not eliminate planning or worker costs.
Schema validity does not establish factual correctness or replace an independent verifier.
Native schema retries, stall restarts, inference sampling, and task retries remain separate from the no-progress fix-round count.
Source checks establish instruction delivery, while native execution, installed activation, and model adherence require separate host evidence.

### Claude Code Workflow And Subagent Contracts

The official [Workflow documentation](https://code.claude.com/docs/en/workflows) and [subagent documentation](https://code.claude.com/docs/en/sub-agents) describe host execution.
Workgraph retains dependency selection, role ownership, evidence freshness, and delivery gates.
The native tool defines its API, permissions, model controls, and notification delivery.
The bundled Workflow reference adds graph mapping, result acceptance, journal checks, and conservative same-run recovery.

[Semantic Line Breaks](https://sembr.org/) explains using source line breaks without changing rendered Markdown paragraphs.
Workgraph uses sentence-level source lines for all documents, including table explanations.
Required syntax and exact quotations retain their original form.

We checked the event definitions and error behavior in the [Claude Code hooks reference](https://code.claude.com/docs/en/hooks).
It defines context delivery for SessionStart and SubagentStart and confirms that failures do not block startup.
The same reference caps each `additionalContext` field at 10,000 characters without a setting to raise the limit.
Larger fields become file paths with previews of up to 2,000 characters.
The host does not ask the model to read those files.
Workgraph keeps Claude contexts within the cap and tests long paths and line-ending variations.
We use that contract for [automatic delivery](design.md#deliver-context).

The [Codex skill parser](https://github.com/openai/codex/blob/main/codex-rs/skills/src/parser.rs) recognizes delimiter lines whose trimmed content equals `---`.
Workgraph uses that boundary rule without interpreting or repairing YAML values.
Inline dashes remain in frontmatter, while indented delimiter lines end it.
Claude receives the remaining text, and Codex retains the complete original skill file.
The inspected Claude Code 2.1.289 Skill loader consumes whitespace after the closing frontmatter delimiter.
Workgraph removes that leading body whitespace while preserving trailing whitespace and Codex's raw skill file.

The [Claude Code skills reference](https://code.claude.com/docs/en/skills) documents skill invocation controls and `${CLAUDE_PLUGIN_ROOT}` substitution in skill Markdown.
We use the invocation controls for [manual invocation](design.md#support-manual-invocation), and the hook-delivered role bodies need no extra file reads for their contracts.
The [Agent Skills specification](https://agentskills.io/specification) defines optional per-skill references and assets.
The [Agent Skills best practices](https://agentskills.io/skill-creation/best-practices) recommend keeping core guidance inline and naming when to read a focused reference.
We read the complete [combined Agent Skills source](https://agentskills.io/llms-full.txt) rather than a generated summary.
A conditional delivery reference can reduce unrelated Workflow context, but no behavioral evaluation yet establishes that it improves model performance.
Source and delivery checks cannot establish interactive invocation or model adherence.

## Document And Release Validation

GitHub's [issue form schema](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema) defines form fields and field ID constraints.
Workgraph validates a bounded subset: top-level strings, nonempty bodies, and required textarea fields with unique labels and IDs.
The check parses `.yaml` files with markdownlint-cli2's public [YAML parser](https://github.com/DavidAnson/markdownlint-cli2/blob/v0.23.3/parsers/yaml-parse.mjs).
Positive and negative fixtures check schema values, field constraints, parsed scalar semantics, and unique chooser names.
Local checks do not prove that GitHub recognizes the `.yaml` templates or renders their chooser entries.

We use [markdownlint-rule-relative-links](https://github.com/theoludwig/markdownlint-rule-relative-links) for relative file and heading validation instead of maintaining another Markdown parser.
Local positive and negative fixtures verify its integration with the repository's configured lint stack.

Go 1.23 added `maps.Values` and `slices.Values` iterators for value-only collection loops.
See the official [Go 1.23 release notes](https://go.dev/doc/go1.23), [`maps.Values`](https://pkg.go.dev/maps#Values), and [`slices.Values`](https://pkg.go.dev/slices#Values).
Use these APIs only when the declared Go version supports them and key or index iteration is unnecessary.

The official [setup-node version-file guidance](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#node-version-file) supports selecting the development range from `package.json`.
The workflow uses current [checkout](https://github.com/actions/checkout) and [setup-node](https://github.com/actions/setup-node) major releases.
Separate dependency-free jobs exercise the declared hook runtime floor and macOS without claiming development-tool compatibility on Node.js 18.
These checks establish source validation and runtime evidence, while model adherence requires a separate behavioral run.

## Development Lifecycle

Workgraph's conditional [Development](../skills/development/SKILL.md) skill selects the lifecycle matching the requested outcome.
Feature work defines behavior and acceptance before implementation.
Bug fixes require matching-surface reproduction and evidence for the causal mechanism.
Use failing-first regression checks when required or when practical for the defect.
Refactoring captures required behavior before structural changes and verifies equivalence afterward.
Performance work needs baseline traces and comparable measurements.
Verification checks the actual artifact rather than a proxy.
Delivery checks that review verdicts still cover the current candidate.

Main, Delivery, and Verification retain orchestration, publication authority, evidence freshness, and cleanup.
Source and hook checks establish bundled instruction delivery, not universal model adherence.

## pnpm And Git Hook Tooling

The root maintains compatible lint versions, a common check and fix surface, Markdown settings, and Ultracite ownership.
Ultracite supplies the Oxlint source-lint preset and Oxfmt formatting defaults.
`oxlint.config.ts` registers only `plugins/tsdoc-plugin.ts` and enables `tsdoc/require-export-tsdoc` for multiline exported TypeScript API documentation.
Exposed-class member diagnostics are incomplete.
Function-body spacing and declaration-only explanations remain written conventions beyond the active configuration's diagnostic coverage.
See [Validation And Tooling](design.md#validation-and-tooling) for the configured checks and their policy boundary.
Workgraph also maintains its Markdown sentence and table-separator rules.
Copied rules retain their upstream license and run through the repository's existing lint owners.
The original adoption moved dependency versions into the pnpm catalog and retained the patched `smol-toml` override.
The locked markdownlint-cli2 release now declares that parser directly, so the superseded override has been removed.
The selected [pnpm release](https://pnpm.io/installation) supports Node.js 24, which remains an official [LTS line](https://nodejs.org/en/about/previous-releases).
The [pnpm setup action](https://github.com/pnpm/setup/tree/v3.0.0) reads the manifest pin and installs the selected runtime.

We checked Husky `9.1.7` in the npm registry and reviewed its official [setup](https://typicode.github.io/husky/get-started.html) and [hook documentation](https://typicode.github.io/husky/how-to.html).
It requires Node.js 18 or later and supplies the Git dispatchers through the standard `prepare` lifecycle.
Workgraph's two hooks call the corresponding pnpm scripts and retain the complete existing check gate.
Actual commit and push operations in disposable repositories verify execution and intentional failure propagation.
These local Git checks do not establish native plugin activation or provider behavior.
