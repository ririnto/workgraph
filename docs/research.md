# Research Behind The Instructions

## Scope

These notes connect external evidence to Workgraph's instruction choices.
They distinguish research findings, product guidance, and local design decisions.
The cited studies use different tasks, models, and evaluation methods.
Their results do not establish Workgraph performance or model adherence.

Maintainers can use these sources when changing context boundaries, task dependencies, verification, or writing rules.
See [the design](design.md) for delivery mechanics and [third-party notices](../THIRD_PARTY_NOTICES.md) for attribution.

## Prompt And Skill Design

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
Workgraph delegates clear tasks to Luna and uses Sol when stronger judgment is required.
We confirm supported settings from the model page and maintain the task mapping in Main's Codex reference.
Workgraph's selection defaults apply only when no explicit or configured setting exists.
Main's host references supply task defaults and escalation conditions without requiring comparisons or evaluations during consumer sessions.
Sol, Sonnet, and Opus efforts above high remain available through explicit or configured choices.
Maintainers use model-specific benchmark and workload evidence when revising these defaults.
Instruction text does not configure the host or establish model adherence.

OpenAI's [model-selection guide](https://developers.openai.com/api/docs/guides/model-selection.md) gives different effort starting points for Luna, Sol, and Astra.
It recommends experiments with the same inputs and the lightest setting that meets the required quality.
The [GPT-6 Luna model page](https://developers.openai.com/api/docs/models/gpt-6-luna.md) supports `none`, `low`, `medium` (default), `high`, `xhigh`, and `max`.
For other models, use their supported settings, exact-model guidance, and evaluation on comparable tasks.
Use documented host settings when applicable workload guidance and benchmark evidence are absent.
Workgraph's Sol task defaults do not cap effort for Luna, Astra, or Claude.
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
Role procedures remain inline, while Main orchestration and model guidance load only for the active environment.
We have not measured these prompt choices in Workgraph on the selected models.

We fetched the official [Claude Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1.md) and [Claude Sonnet 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5.md) prompting guides.
Fable's completion guidance supports finishing the requested scope and continuing independent work while delegated results remain pending.
Sonnet's scope guidance supports stopping after the requested work and applicable checks finish, without adding unrelated changes or review rounds.
Apply these recommendations within Workgraph's authorization and required-check rules.

Anthropic recommends evaluating effort on the target workload because effort names do not represent equal thinking across models.
Fable 5.1 starts at its default `high`, while Opus 5.5 starts at its default `medium`.
Sonnet 5.5 defaults to `high` in the API but recommends `medium` for well-defined agentic tasks and `high` for harder work.
The Opus and Sonnet guides reserve `xhigh` and `max` for measured quality gains.
Anthropic recommends lowering host effort settings to reduce thinking.
Check each model's settings before reuse, and preserve Workgraph's Claude routing.

Effort settings, token limits, response-block parsing, progress-update display, and bounded automatic continuations belong to the host or API integration.
Time signals require host-supplied measurements, and pasted-content tags require application support.
The guide's broad context search targets multi-app workflows rather than every repository edit.
Workgraph does not implement those integrations or change model settings through instruction text.
Its runtime delivers context through Claude Code hooks, and its instructions use the host's existing completion lifecycle.

### Model Effort And Cost

We reviewed seven exact models using official model, effort, pricing, host, and prompting documentation.
The table separates API defaults from documented host recommendations.
The inspected Codex catalog defaults, recorded below, can differ from those recommendations.
Prices are standard API dollars per million input, cached input, and output tokens.
They do not describe subscription usage limits, fast-mode prices, or paid tool charges.

| Exact model | Supported effort | API default | Documented host guidance | Input / cached input / output |
| --- | --- | --- | --- | --- |
| [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna.md) | `none`, `low`, `medium`, `high`, `xhigh`, `max` | `medium` | The Codex guide starts at `high`. | $0.10 / $0.01 / $0.50 |
| [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol.md) | `low`, `medium`, `high`, `xhigh`, `max` | `medium` | The guide gives task-specific medium or xhigh starting points. | $2 / $0.10 / $10 |
| [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra.md) | `low`, `medium`, `high`, `xhigh`, `max` | The reviewed sources did not establish a default. | The Codex guide starts at `low`. | $10 / $1 / $50 |
| [Claude Haiku 4.5](https://platform.claude.com/docs/en/models/haiku-4-5/overview.md), `claude-haiku-4-5-20251001`, October 15, 2025 | Effort is unsupported. | Not applicable | Leave effort unset. | $1 / $0.10 / $5 |
| [Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview.md), `claude-sonnet-5-5`, September 28, 2026 | `low`, `medium`, `high`, `xhigh`, `max` | `high` | Claude Code starts at `medium`. | $2 / $0.20 / $10 |
| [Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview.md), `claude-opus-5-5`, September 22, 2026 | `low`, `medium`, `high`, `xhigh`, `max` | `medium` | Claude Code starts at `medium`. | $4 / $0.20 / $20 |
| [Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview.md), `claude-fable-5-1`, September 1, 2026 | `low`, `medium`, `high`, `xhigh`, `max` | `high` | Claude Code starts at `high`. | $10 / $0.25 / $50 |

The [Codex model guide](https://developers.openai.com/codex/models.md) supplies Astra and Luna starting settings.
The [Claude Code model guide](https://code.claude.com/docs/en/model-config.md) supplies its host defaults.
Anthropic's [effort guide](https://platform.claude.com/docs/en/build-with-claude/effort.md) supplies supported effort levels and API defaults.
Fable 5.1 and Opus 5.5 keep adaptive thinking on.
Sonnet 5.5 accepts `between_tools` at `high` or below to remove up-front thinking, but rejects it at `xhigh` and `max`.
Haiku 4.5 defaults to thinking off and supports optional manual thinking budgets, not adaptive effort.
These capabilities follow Anthropic's [thinking configuration table](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting.md).

Broad external benchmarks supply the primary effort comparisons.
The [detailed evidence record](model-effort-evidence.md) retains six within-model tables, workload studies, measurement definitions, and limitations.
Independent reviewers checked source figures and study methods for each model.
Source verification does not establish model performance outside the published workloads.

| Model | External benchmark finding | Selection implication |
| --- | --- | --- |
| [GPT-6 Luna](https://artificialanalysis.ai/models/releases/gpt-6-luna) | High, xhigh, and max score 33, 35, and 38, at estimated $0.03, $0.04, and $0.07 per task. | Higher effort can improve this composite through max, with increasing cost and answer latency. |
| [GPT-6.1 Sol](https://artificialanalysis.ai/models/releases/gpt-6-1-sol) | High to max raises the rounded composite index from 50 to 52 and estimated task cost from $0.32 to $0.72. | Preserve task-based starting settings and evaluate required gains above high. |
| [GPT-6 Astra](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json) | Across 452 attempts per effort, medium passes 72.79%, xhigh 74.12%, and max 73.23%. | Compare medium and xhigh for similar terminal work, with the prerelease alias and overlapping intervals stated. |
| [Claude Haiku 4.5](https://artificialanalysis.ai/models/releases/claude-4-5-haiku) | The thinking score is measured, but the non-thinking score is estimated and the thinking budget is undisclosed. | Leave effort unset, and evaluate manual thinking budgets separately when the host supports them. |
| [Claude Sonnet 5.5](https://artificialanalysis.ai/models/releases/claude-sonnet-5-5) | Medium to max raises the composite index from 41 to 56 and estimated task cost from $0.59 to $7.67. | Compare Opus medium or high before Sonnet xhigh or max, retaining workload-specific exceptions. |
| [Claude Opus 5.5](https://artificialanalysis.ai/models/releases/claude-opus-5-5) | Xhigh and max tie at 59.60% terminal passes, while estimated task cost rises from $8.78 to $13.11. | Prefer medium or high, and avoid higher effort unless comparable-task gains justify its cost. |
| [Claude Fable 5.1](https://artificialanalysis.ai/models/releases/claude-fable-5-1) | Terminal pass rate peaks at xhigh, while max adds about 0.15 composite points at about 28% more cost. | Compare high and xhigh for terminal tasks, and retain max for workloads with demonstrated gains. |

Artificial Analysis's ten-evaluation composite mixes coding, agent, science, and general tasks.
Its prices estimate token costs with typical cache behavior rather than actual invoices.
Its Fable, Opus, and Sonnet configurations allow default fallback to another Claude model.
Its Sonnet release article identifies a prerelease structured-output bug and planned reruns.
DeepSWE uses mini-swe-agent and an alias from a job before Astra's public release.
These differences prevent an isolated comparison with native Codex or Claude Code results.
Rounded score changes do not establish statistical significance or gains on every workload.

Luna's lower token rates and gains through max support broader coding, review, and agentic assignments with clear requirements.
The [official model-selection guide](https://developers.openai.com/api/docs/guides/model-selection.md) includes Luna xhigh for constrained problem-solving and multi-app work.
Workgraph selects Sol when conflicting evidence, difficult tradeoffs, or acceptance failures justify stronger judgment.
Step count alone does not require Sol.
Workgraph uses Luna xhigh or max for coding, debugging, refactoring, and code review.
It reserves Luna low for simple exploration and extraction.
These sources do not establish equivalent Luna and Sonnet performance across workloads.

Practitioner evidence supplements these broad benchmarks with specific failure conditions.
The Sol coding study reaches its small sample's score ceiling.
GitDiagram changes both fixtures and service tier when lowering Luna effort.
Willison's Opus max SVG request exhausts its output allowance without a final answer.
Haiku retrieval studies compare harnesses and information structure rather than effort settings.
The detailed record links the original reports and states those limitations.

The OpenAI [deployment checklist](https://developers.openai.com/api/docs/guides/deployment-checklist.md) recommends representative evaluations before accepting higher latency and cost.
The [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning.md) bills reasoning tokens as output.
Anthropic's [pricing guide](https://platform.claude.com/docs/en/about-claude/pricing.md) separates token rates from cache and speed modifiers.
Compare acceptance results with the same workload, harness, tools, fallback, service tier, caching, and pricing conditions.
Include workers, retries, and tool charges in total workflow cost.
Effort names do not define equal compute across models or fixed cost multipliers.
Local hook and Workflow checks test instruction delivery and tool execution, not model quality or these effort curves.

### Host Model Selection

Claude Code supports `fable`, `opus`, `sonnet`, and `haiku` aliases, as documented in its [model configuration](https://code.claude.com/docs/en/model-config.md).
Provider routing, overrides, and allowlists can resolve an alias to another release.
The current Anthropic model catalog identifies Haiku 4.5 as `claude-haiku-4-5-20251001`, with API alias `claude-haiku-4-5`.
Codex's Astra, Sol, and Luna display names do not establish support for bare aliases in dispatch tools.
Use the host's supported exact IDs and preserve pinned versions.
Record requested settings and report resolved settings only when the host supplies them, otherwise mark them unknown.
Follow the current tool contract for fork inheritance and override support.

We reviewed Superpowers' [using-superpowers skill](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md) and [Codex tool reference](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/references/codex-tools.md) on its `main` branch.
Its host adapters informed use of current tool names and model allowlists.
We retained the current host's fork contract where its override rules conflict with that reference.
Superpowers supplies no model-performance evidence for this comparison.

### Skill Structure

We reviewed the official [Claude Code skills documentation](https://code.claude.com/docs/en/skills) and the complete [Agent Skills source](https://agentskills.io/llms-full.txt).
Claude uses descriptions to select skills and supports user-only invocation through frontmatter.
The Agent Skills guidance recommends clear activation conditions, focused bodies, and conditional references.
The specification recommends fewer than 500 lines per body and one level of references.
Workgraph keeps role rules inline and injects each role's matching host reference during startup.
The hook names loaded source paths so the model can locate references and recognize content already present.
All three skills remain user-invocable and model-invocable.
Their bodies define role and scope boundaries independently of invocation metadata.
Claude's installed Skill loader strips YAML, preserves trailing body whitespace, and prepends a base-directory line.
Its Read tool normalizes file text and adds tab-separated line numbers, including a final empty line.
Codex's [versioned skill renderer](https://github.com/openai/codex/blob/rust-v0.157.1/codex-rs/ext/skills/src/fragments.rs) wraps the complete file with its name and path.
The hooks match these instruction text fragments and identify already-loaded sources outside them.
They cannot reproduce native message roles or tool-call envelopes.
The [delivery design](design.md#deliver-context) records this boundary.
Workflow's description states its activation boundary, and its body defines dependency gates without repeating Main's finding classifications.
Its delivery reference maps node inputs and outputs for authorized engineering delivery.
We need behavioral evaluation to measure activation or model adherence for these structure choices.

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
| Workflow opt-in, native authoring, journals, resume identifiers, cache invalidation, and later-call reruns. | Installed Claude Code Workflow descriptions and their native authoring reference define these mechanics. | Remove the repeated continuation recipe. |
| Native delegation without Claude Code Workflow. | Codex's [tool registration](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/spec_plan.rs) registers agent lifecycle and messaging tools. | Keep Workflow selection in the Claude reference and use native delegation in Codex. |
| Peer messages cannot grant permission or bypass denied actions. | Installed Claude Code SendMessage descriptions and peer-message reminders define these restrictions. | Remove repeated permission-laundering warnings. |

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

The skills retain role ownership, English handoffs, sentence-level Markdown rules, and host-specific model-family selection policy.
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
In Claude Code, Workgraph selects Workflow for identified dependent or follow-up stages.
The sources do not establish that this routing improves Workgraph outcomes.

## Verification And Recovery

[Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657) introduces the MAST failure taxonomy.
Its abstract groups failures into system design, inter-agent misalignment, and task verification.
Workgraph addresses these categories through clear assignments, English handoffs, completion evidence, and bounded feedback loops.
The paper does not establish English as the best coordination language.
Workgraph requires English handoffs.

[Verification-Aware Planning for Multi-Agent Systems](https://aclanthology.org/2026.eacl-long.353/) connects task dependencies with verification functions.
The EACL 2026 abstract describes failures in task interpretation, output formats, and handoffs.
It supports planning acceptance evidence alongside subtasks.
Workgraph uses existing checks and does not generate a verification framework from the paper.

[SagaLLM](https://arxiv.org/abs/2503.11951) addresses validation, context loss, and recovery through a transactional architecture.
Its abstract describes persistent memory, compensation, and independent validation.
It motivates checking partial effects before retrying a write.
Workgraph does not implement transactions, automatic compensation, or durable recovery.

### Bounded Feedback And Review Evidence

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

The waiting rules address the user's observed repeated waiting behavior.
Codex Main and Worker prefer `wait_agent` with `timeout_ms: 240000` when only delegated results remain.
They prefer `functions.wait` with `yield_time_ms: 240000` when waiting for a yielded `functions.exec` cell.
Four minutes is the user's recommended starting point, not a required duration or execution limit.
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
We set the foreground default to four minutes while retaining the native ten-minute ceiling for explicit requests.
Foreground timeout normally moves an unfinished command to the background when the host permits background execution.
The [background execution limit](https://code.claude.com/docs/en/tools-reference#time-limit-for-background-commands) is separate from that transition.
An explicit background command's timeout can stop the command when its background deadline applies.
We keep that execution duration separate from the four-minute foreground default.
The [Monitor tool](https://code.claude.com/docs/en/tools-reference#monitor-tool) delivers command output or external events while the conversation continues.
Main and Worker consider Monitor when available, without adding a watch timeout recommendation.
Its watch deadline is separate from Bash's foreground timeout and Codex's wait yield duration.
The installed tool uses a feature gate, so availability depends on the active host.
Claude Code's [scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks) support a fixed `/loop 4m` cadence.
Dynamic loops use `ScheduleWakeup` with a chosen delay, so Main recommends `delaySeconds: 240` when the task permits.
There is no global loop-interval setting, and scheduled prompts can wait until the current turn ends.
The [goal check-in setting](https://code.claude.com/docs/en/env-vars) accepts `CLAUDE_CODE_GOAL_CHECKIN_MINUTES=4` in the installed runtime.
That changes the first deferred-goal check-in from thirty minutes to four minutes.
Later [goal check-ins](https://code.claude.com/docs/en/goal#background-work-defers-evaluation) back off to eight and sixteen minutes, with at most three idle deliveries between user prompts.
This setting does not create a cron task or restart an exited process.
The [cache lifetime](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#faq) normally lasts five minutes and refreshes when a request uses the cached content.
Claude Code's [cache defaults](https://code.claude.com/docs/en/prompt-caching) vary by provider and request type.
Four-minute scheduling does not prove a cache hit because queueing, model changes, or prefix changes can prevent reuse.
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
Without a native agent wait tool, agents end an idle turn until a completion notification arrives.
This idle-turn rule also applies to background Bash.
The papers provide coordination context but do not prove this prompt resolves the observed behavior.

## Writing And Host Contracts

### Claude Code Workflow And Subagent Contracts

The official [Workflow documentation](https://code.claude.com/docs/en/workflows) and [subagent documentation](https://code.claude.com/docs/en/sub-agents) describe host execution.
Workgraph retains dependency selection, role ownership, evidence freshness, and delivery gates.
The skills leave authoring syntax, permissions, model controls, notification delivery, and resume mechanics to native instructions.

[Semantic Line Breaks](https://sembr.org/) explains using source line breaks without changing rendered Markdown paragraphs.
Workgraph uses sentence-level source lines for all documents, including table explanations.
The [repository writing rules](../AGENTS.md#writing) record that choice and its syntax exceptions.

[Stop Slop](https://github.com/hardikpandya/stop-slop) recommends direct verbs, specific subjects, and removal of formulaic writing.
We use those principles during editing while retaining explicit requirements and technical conditions.
Its style preferences do not override host contracts or the user's requested content.

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

The [Claude Code skills reference](https://code.claude.com/docs/en/skills) documents skill invocation controls and `${CLAUDE_PLUGIN_ROOT}` substitution in skill Markdown.
We use the invocation controls for [manual invocation](design.md#support-manual-invocation), and the hook-delivered role bodies need no extra file reads for their contracts.
The [Agent Skills specification](https://agentskills.io/specification) defines optional per-skill references and assets.
The [Agent Skills best practices](https://agentskills.io/skill-creation/best-practices) recommend keeping core guidance inline and naming when to read a focused reference.
We read the complete [combined Agent Skills source](https://agentskills.io/llms-full.txt) rather than a generated summary.
A conditional delivery reference can reduce unrelated Workflow context, but no behavioral evaluation yet establishes that it improves model performance.
Source and delivery checks cannot establish interactive invocation or model adherence.
