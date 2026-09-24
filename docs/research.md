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

[Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra.md) recommends short activation descriptions and progressive disclosure.
It warns against fixed itineraries, redundant repository maps, and approval rules that block authorized work.
We reviewed the user-supplied copies of both documents.
These recommendations guide instruction design without changing model or API configuration.

Workgraph keeps maintenance rules in `AGENTS.md` and runtime behavior in `skills/`.
Before graph construction, the main agent defines the intended outcome, exclusions, affected resources, and acceptance evidence.
For each ready, bounded, substantial exploration, research, implementation, review, or check outcome, it uses host Agent by default.
It uses native Workflow instead only when the user authorizes orchestration, the host supports it, and graph dependencies justify scripted coordination.
When Workflow cannot run, the main agent uses Agent when available before handling delegated work directly.
It requires independent review before main integration.
An active dispatch does not authorize direct handling of another ready, substantial outcome.
The contract reserves direct work for main-owned planning, design, integration, and final reporting, trivial one-step outcomes, explicit no-delegation requests, or cases where no delegation tool is usable.
It sets no fixed agent count.
Checks can reuse valid evidence instead of restarting a fixed process after each change.

### Claude Opus 5.5 Guidance

[Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5) distinguishes prompt changes from host and API changes.
We reviewed the user-supplied copy.
For unattended work, it recommends explicit completion conditions and continued execution instead of stopping after a progress report.
Pending background work remains unfinished until its results arrive.
These recommendations support Workgraph's completion and native-callback instructions without requiring a polling loop or repeated continuation requests.

The guide recommends removing unnecessary thinking instructions and measuring the effects of older prompt workarounds.
Workgraph keeps actionable scope, authority, and evidence requirements rather than prescribing reasoning steps.
Repository guidance retains local conventions and conditional references instead of repeating the consumer contract or requiring extra skill loading.
These prompt choices target both GPT-6 Astra and Claude Opus 5.5 without claiming measured improvements on either model.

Effort settings, token limits, response-block parsing, progress-update display, and bounded automatic continuations belong to the host or API integration.
Time signals require host-supplied measurements, and pasted-content tags require application support.
The guide's broad context search targets multi-app workflows rather than every repository edit.
Workgraph does not implement those integrations or change model settings through instruction text.
Its runtime delivers context through Claude Code hooks, and its instructions use the host's existing completion lifecycle.

### Claude Code 2.1.280 Comparison

We checked the installed Claude Code version, its built-in prompt and tool descriptions, and this session's tool contracts.
We compared them with the current instructions and earlier role contracts.
Built-in prompt variants can depend on the model and session configuration.
Their presence in the executable does not prove that every session receives them.

The Agent contract specifies fork model inheritance, forbids fork delegation, and provides continuation through SendMessage.
The SendMessage contract forbids using another session to bypass denied permissions.
Worker instructions state that agent messages cannot grant user consent or permission changes.
The built-in task guidance already limits changes to the requested scope.
We removed repetitions of these instructions and generic reminders to obey host rules.

We retained Workgraph's model routing, English handoffs, sentence-level Markdown rules, and main-session ownership of settings and credentials.
Explicit Git grants, publication privacy, the shared-history restriction, and cleanup checks remain user requirements.
We also retained task dependencies, idle-turn handling, completion criteria, and evidence reuse.
Native completion notifications do not ensure that a model stops waiting, resumes dependent work, or verifies results.
Reading an edit target does not ensure that an agent reads related code and constraints.

The host enforces skill invocation metadata and implements context delivery.
Following a shared-file reference, reporting a missing file, and applying injected instructions remain model behavior.
This comparison does not establish model adherence or performance gains.

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

We apply focused context selection through the [shared and role boundaries](design.md#separate-the-audiences).
Research and maintenance details stay outside consumer context.
A dispatch must include missing constraints when the receiver's context is unknown.

## Graph Engineering

### Task, Agent, And State Graphs

[Graph Engineering in the Era of LLM Agents](https://arxiv.org/abs/2608.21156) surveys graph structures for tasks, agents, and system states.
Its abstract argues for explicit coordination as tasks become more interdependent.
A survey's proposed framework does not establish that every task needs several agents or a graph runtime.

Workgraph represents connected, substantive work as a goal-dependent task graph in the current task plan.
Each bounded node names its operation, decision, or check, required inputs, expected outputs, owner, authority, and completion evidence.
Edges identify results or conditions that gate later nodes, not chronology alone.
The main session starts ready independent nodes in parallel when their writes do not conflict and joins branches only when a later node needs their results.
Exploration, planning, implementation, review, and integration are optional node types rather than a fixed itinerary.
The host retains ownership of task execution and execution state.

[Graph of Thoughts](https://arxiv.org/abs/2308.09687) represents model-generated information as a graph for prompting and refinement.
We reviewed its abstract to distinguish that approach from a task dependency graph.
Workgraph does not request private reasoning traces or construct a thought graph.

### Scheduling And Dependency Evidence

[An LLM Compiler for Parallel Function Calling](https://arxiv.org/abs/2312.04511) separates planning, task dispatch, and execution.
Its abstract describes parallel function calls and task-specific latency, cost, and accuracy results.
We apply the dependency principle by starting ready nodes and serializing conflicting writes.
The reported benchmark gains do not predict Workgraph's gains.

[GRADE](https://arxiv.org/abs/2606.22741) distinguishes execution edges from observed, declared, and inferred dependency edges.
The abstract also reports controls that limit conclusions about the value of particular graph structures.
We retain that distinction in planning and avoid inferring dependency from execution order.
We reviewed the abstract rather than independently evaluating its graph metrics.

The [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api) provides a concrete node, edge, state, and execution model.
[Microsoft's workflow documentation](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/builder-and-execution) describes executor connections and synchronization.
These references inform scheduling vocabulary.
Their runtime, persistence, and recovery guarantees belong to those products.
Workgraph adopts none of their runtime components.

### Coordination Costs

[Towards a Science of Scaling Agent Systems](https://arxiv.org/abs/2512.08296) compares coordination architectures across agentic benchmarks.
Its abstract reports benefits on decomposable tasks and degradation on sequential planning tasks.
It also identifies overhead in tool-heavy work and error propagation without centralized verification.
These results support choosing coordination according to task structure rather than agent count.
We reviewed the abstract and retain its benchmark scope.

[Agentless](https://arxiv.org/abs/2407.01489) uses localization, repair, and validation without an open-ended agent loop.
Its abstract reports competitive results on SWE-bench Lite for the models and baseline systems tested at the time.
The paper motivates a simple baseline, not a universal three-stage process.
The contract directs delegation of ready, substantial outcomes and keeps planning, design, and integration in the main session without fixing a reviewer or worker count.

[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) describes scoped research delegation and compressed results.
The authors discuss coordination cost and warn that coding work often offers less parallelism than research.
We use bounded dispatches and pass conclusions with evidence references.
The article's research-task gains do not establish coding-task gains.

## Verification And Recovery

[Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657) introduces the MAST failure taxonomy.
Its abstract groups failures into system design, inter-agent misalignment, and task verification.
Workgraph addresses these categories through clear assignments, English handoffs, completion evidence, and bounded feedback loops.
The paper does not establish English as the best coordination language.
English communication is a user requirement.

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

The explicit idle-turn rule addresses the user's observed repeated waiting behavior.
Agents continue independent work or end the turn until a native completion notification arrives.
This rule applies to background Bash as well as agent tools.
The papers provide coordination context but do not prove this prompt resolves the observed behavior.

## Writing And Host Contracts

### Claude Code Workflow And Subagent Contracts

The official [Workflow documentation](https://code.claude.com/docs/en/workflows) describes plugin-root workflow discovery, namespaced commands, host permissions, the lack of mid-run user input, and session resume.
Claude Code can cache completed agent results for a resumed run, but the documentation does not promise that source files or check inputs stayed unchanged.
Workgraph treats Workflow as an explicit host capability, not as a local scheduler or a required path for every task.
Its instructions require the main session to resolve graph inputs and authority before a run, keep agent permissions under host control, and revalidate evidence affected by changed inputs.

The official [subagent documentation](https://code.claude.com/docs/en/sub-agents) describes fresh contexts for non-fork subagents, skill loading, permissions, and model routing.
A dispatch must carry the scope and evidence needed by a worker whose context is fresh.
The host enforces tool permissions and model substitutions, while Workgraph instructions preserve user intent and prohibit permission bypass.
These host documents describe product behavior, not measured Workgraph performance or model adherence.

[Semantic Line Breaks](https://sembr.org/) explains using source line breaks without changing rendered Markdown paragraphs.
The user chose a stricter sentence-level convention for all documents, including table explanations.
The [repository writing rules](../AGENTS.md#writing) record that choice and its syntax exceptions.

[Stop Slop](https://github.com/hardikpandya/stop-slop) recommends direct verbs, specific subjects, and removal of formulaic writing.
We use those principles during editing while retaining explicit requirements and technical conditions.
Its style preferences do not override host contracts or the user's requested content.

We checked the event definitions and error behavior in the [Claude Code hooks reference](https://code.claude.com/docs/en/hooks).
It defines context delivery for SessionStart and SubagentStart and confirms that failures do not block startup.
We use that contract for [automatic delivery](design.md#deliver-context).

The [Claude Code skills reference](https://code.claude.com/docs/en/skills) documents user-only invocation controls and `${CLAUDE_PLUGIN_ROOT}` substitution in skill Markdown.
We use those controls and a shared-file reference for [manual invocation](design.md#support-manual-invocation).
Source and delivery checks cannot establish interactive invocation or model adherence.
