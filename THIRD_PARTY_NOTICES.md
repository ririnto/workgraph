# Third-Party Notices

Workgraph contains instructions informed by the projects and documents listed here.
Bundled third-party tooling retains the attribution and license identified below.
The [research notes](docs/research.md) record source evidence, reviewed sections, and limits.
This document records attribution and prior sources.

## Markdown Link Validation

Workgraph uses [markdownlint-rule-relative-links](https://github.com/theoludwig/markdownlint-rule-relative-links) under the MIT license.
The package credits Théo LUDWIG as its author and copyright holder.

## Markdown Box-Drawing Validation

Workgraph uses [markdownlint-rule-search-replace](https://github.com/OnkarRuikar/markdownlint-rule-search-replace) under the MIT license.
The package credits Onkar Ruikar, copyright 2022.

## Google Research Harness2

Google LLC's [Harness2](https://github.com/google-research/harness2/tree/main) repository declares the Apache-2.0 license.
We used its maintained evaluation tools externally on its named `main` branch.
Workgraph bundles no Harness2 source or dependency.

## Superpowers

We studied [obra/superpowers](https://github.com/obra/superpowers) on its `main` branch.
The project uses the MIT license and credits Jesse Vincent, copyright 2025.
It informed hook bootstrapping, scoped instruction loading, and task verification.
We reviewed its [branch-finishing skill](https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md) for conditional delivery loading.
Workgraph uses its own context documents and execution rules.
We reviewed the [using-superpowers skill](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md) and [Codex tool reference](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/references/codex-tools.md) on its `main` branch.
We used their host adapters to review tool names and model allowlists, retaining the current host's fork rules where they differ.

## Ponytail

We studied [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) on its `main` branch.
The project uses the MIT license and credits Dietrich Gebert, copyright 2026.
It informed reuse of existing tools, limited abstractions, and the smallest sufficient implementation.

## Lauren Tan

Lauren Tan, known as [@poteto](https://x.com/poteto), published a [recorded presentation](https://x.com/poteto/status/2102050467505430555) on September 21, 2026 UTC.
We reviewed its automatic English captions and presentation screens.
Her CLI and feature-map examples, correction priorities, and Dune ownership boundaries informed Verification and Development guidance.
Workgraph adapts those ideas without redistributing her video, slides, transcript, pstack, or Dune implementation.
The [research notes](docs/research.md#lauren-tan-on-verification-and-agent-environments) distinguish practitioner examples from Workgraph evidence.

We also studied the original [cursor/plugins pstack](https://github.com/cursor/plugins/tree/main/pstack) on its `main` branch.
Its MIT license credits Lauren Tan, copyright 2026.
Its feature, bug-fix, refactoring, performance, TDD, verification, and shipping procedures informed Development's lifecycle decisions.
Workgraph adapts those decisions without bundling pstack source or importing Cursor tools, models, or stack operations.
We also inspected the installed pstack `0.15.29` mode, leaf principle skills, worker, guide, and host adapters as read-only organization references.
They informed Workgraph's mode entry, focused lifecycle playbooks, conditional principles, user host adapters, and guide-first README structure.
This restructure uses pstack's organization without copying its text, adopting its policies, or adding a dependency.
The [research notes](docs/research.md#skill-structure) record the structure evidence and its limits.

## Giver Architecture

We studied [sng2c/giver-architecture](https://github.com/sng2c/giver-architecture) at version `v0.1.1`.
Its package metadata declares the MIT license and names sng2c as the author.
The `giver-principles.md` reference informed separating coordination messages from working material and passing relevant results to successors.
Workgraph does not include its runtime or require its message schema.

## OpenAI Guidance

We read the complete official [Codex best-practices article](https://learn.chatgpt.com/guides/best-practices) and [OpenAI latest-model guide](https://developers.openai.com/api/docs/guides/latest-model.md).
Their goal, context, constraint, completion, skill-scoping, and instruction-audit guidance informed agent-facing instruction authoring.
Workgraph adapts these decisions without bundling their text or changing SDKs, model configuration, settings, or scheduling.

We reviewed the supplied copies of [Using GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md) and [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra.md).
These documents informed scoped autonomy, instruction priority, concise writing, progressive disclosure, and proportional verification.
We fetched the official [GPT-6 guide](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md) and [GPT-6.1 Sol model page](https://developers.openai.com/api/docs/models/gpt-6.1-sol.md).
We used their prompting and effort sections to confirm supported settings and evaluation needs for the selected model and workload.
These references do not replace local model policy or configure the host.
We reviewed the [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra.md) and [Luna](https://developers.openai.com/api/docs/models/gpt-6-luna.md) model pages, [model selection](https://developers.openai.com/api/docs/guides/model-selection.md), [reasoning](https://developers.openai.com/api/docs/guides/reasoning.md), [deployment checklist](https://developers.openai.com/api/docs/guides/deployment-checklist.md), and [Codex models](https://developers.openai.com/codex/models.md) for effort, pricing, and host starting settings.

## Codex App-Server

We inspected [openai/codex](https://github.com/openai/codex) on its named `main` branch and its installed app-server schemas.
The repository declares the Apache License 2.0.
Its lifecycle, inventory, owner guards, attachment APIs, and control transport informed the Codex Scoped Cleanup procedure.
We also consulted the [official app-server guide](https://learn.chatgpt.com/docs/app-server) for protocol initialization and schema generation.
Workgraph distributes its own instructions without bundling Codex source or a cleanup client.
The [research notes](docs/research.md#codex-native-cleanup) distinguish reference-source effects from installed protocol and destructive-operation evidence.

## Anthropic Guidance

We read the complete official [Claude prompting best-practices guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md).
Its explicit outcomes, contextual instructions, examples, source separation, and scoped tool guidance informed agent-facing instruction authoring.
These adaptations retain model-specific evidence limits and do not redistribute the guide or configure host behavior.

We read the complete original [mirku workflow post](https://x.com/mirku21/status/2111200540772221418), published October 16, 2026.
Its role split, isolated edits, verification, fix-loop bound, and approval example informed the native Workflow stage guidance.
The complete official [Claude Code Workflow documentation](https://code.claude.com/docs/en/workflows.md) informed supported execution and permission boundaries.
Workgraph adapts those decisions without redistributing the post or supplying another execution engine.

We read the complete original [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic.md), published October 15, 2026.
The article credits Addy Osmani, Morgan Westlee Lunt, and Qing Wang.
Its layered review, verified findings, risk selection, and convergence lessons informed Workgraph's Delivery procedure and Main review staffing guidance.
Workgraph adapts those workflow decisions without redistributing the article or activating Anthropic review products.

We reviewed the supplied copy of [Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5).
Its guidance informed completion behavior for unattended tasks and proportional progress updates.
We fetched relevant sections of the official [Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5.md), [Claude Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1.md), and [Claude Sonnet 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5.md) prompting guides.
We used their scope, completion, and effort sections to guide task boundaries and workload-specific evaluation.
We reviewed Anthropic's [model catalog](https://platform.claude.com/docs/en/about-claude/models/overview.md), [effort guide](https://platform.claude.com/docs/en/build-with-claude/effort.md), [pricing](https://platform.claude.com/docs/en/about-claude/pricing.md), and [Claude Code model configuration](https://code.claude.com/docs/en/model-config.md).
We reviewed the [Haiku 5.5 prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5) and [Claude Code subagent documentation](https://code.claude.com/docs/en/sub-agents) for model and delegation behavior.
We reviewed the [Fable 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1), [Opus 5.5](https://www.anthropic.com/claude-opus-5-5), [Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5), and [Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5) announcements for published performance and cost comparisons.
Their benchmark results retain the task, harness, effort, and pricing limits described in the research notes.
We read the supplied [Haiku 5.5 system card](https://www.anthropic.com/document/claude-haiku-5-5-system-card), including its capability methods and effort curves.
Its reported FrontierCode comparisons inform Haiku's coding effort choices, with graph estimates distinguished from labeled figures.

## xAI And Meta Prompting Guides

We fetched the official [xAI speech-to-speech prompting guide](https://docs.x.ai/developers/model-capabilities/audio/speech-to-speech/prompting-guide.md) and the official [Meta prompting guide](https://dev.meta.ai/llama/docs/how-to-guides/prompting) in full on October 20, 2026.
We also fetched the official [Anthropic prompt-engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview.md) and the [OpenAI latest-model guide](https://developers.openai.com/api/docs/guides/latest-model.md) in full for the same decisions.
Their conflict audits, short focused rules, tool-schema alignment, example guidance, and emphasis limits informed the agent-facing instruction contracts.
Workgraph adapts these lessons without redistributing their text or adopting their voice, audio, API, or format-specific guidance.
The [research notes](docs/research.md#official-prompt-engineering-guides) record the reviewed sources, fetch conditions, and scope limits.

## Model Benchmarks And Workload Reports

[Artificial Analysis](https://artificialanalysis.ai/methodology/intelligence-benchmarking) supplies the composite effort curves and terminal comparisons.
[Datacurve's DeepSWE](https://deepswe.datacurve.ai/blog/deepswe) supplies the Astra terminal benchmark and public aggregate artifact.
[AI Coding Daily](https://aicodingdaily.com/model/gpt-6-luna), by Povilas Korop, supplies the Luna coding effort comparison.
The [model evidence record](docs/model-effort-evidence.md) links their methods and states configuration and cost limits.

We consulted original reports from [Joonlab](https://github.com/joonlab/gpt-6.1-sol-benchmark), [Dyad](https://github.com/dyad-sh/dyad), and [GitDiagram](https://github.com/ahmedkhaleel2004/gitdiagram).
We also consulted [ElectricityBench](https://electricitybench.com/about/), [FaultMaven](https://github.com/FaultMaven/faultmaven/issues/1800), and [Claude Subagent Router](https://github.com/stas4000/claude-subagent-router).
[Simon Willison](https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/) supplies public generation logs, and [CodeRabbit](https://www.coderabbit.ai/blog/opus-5-5-model-review) supplies product review results.
[Kernelbench](https://github.com/Infatoshi/kernelbench.com) supplies supporting workload studies.
These reports inform workload limits and do not supply bundled source code.

## Stop Slop

We used [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) for prose editing.
We read its complete skill and the `phrases.md`, `structures.md`, and `examples.md` references.
The local skill identifies Hardik Pandya as its author and declares the MIT license.
It informed direct verbs, specific subjects, and removal of filler.
The bundled Writing skill adapts its prose guidance.
The plugin does not redistribute the source skill or its reference files verbatim.

## Sinon Language Tooling

We reviewed [ririnto/sinon](https://github.com/ririnto/sinon) on its named `main` branch.
The repository's root MIT license credits ririnto, copyright 2026.
The reviewed Harness component declares [Apache-2.0](https://github.com/ririnto/sinon/blob/main/plugins/harness/LICENSE).
The Harness Java parity mapping, Kotlin rules, and Gradle compatibility guidance informed the Development references.
Workgraph adapts their decision boundaries without requiring a Sinon installation.
Its development tooling copies the Harness source-style plugins and Markdown sentence and table-separator rules.
These files retain the Harness [Apache-2.0 license](LICENSES/sinon-harness.txt), with attribution to ririnto.
The repository owns the copied configuration and checks without modifying the upstream Harness.
Workgraph modifies the sentence, TSDoc, blank-line, and inline-comment copies while preserving their diagnostics.

## Research And Official Documentation

The [research notes](docs/research.md) cite the papers and official documentation used for context, graph, and verification decisions.
We consulted the official [golangci-lint documentation](https://golangci-lint.run/docs/) for Go linting and custom-linter guidance.
The guidance uses its documented recommendations without redistributing golangci-lint code or claiming compatibility for a specific project.
We consulted the Go project's [Go 1.23 release notes](https://go.dev/doc/go1.23) and [`maps.Values`](https://pkg.go.dev/maps#Values) and [`slices.Values`](https://pkg.go.dev/slices#Values) documentation.
Those official sources informed version-aware Go iteration guidance and supplied no redistributed code.
We read the full [Agent Skills combined source](https://agentskills.io/llms-full.txt), including its specification and skill creation guidance.
Its guidance informed the conditional reference boundary without supplying plugin code or bundled assets.
We consulted Anthropic's official [Claude Code Workflow documentation](https://code.claude.com/docs/en/workflows) and [subagent documentation](https://code.claude.com/docs/en/sub-agents) for host behavior.
We reviewed the official [Claude Code skills documentation](https://code.claude.com/docs/en/skills) for activation descriptions, invocation controls, and supporting files.
We reviewed Google's Gemini API [thinking reference](https://ai.google.dev/gemini-api/docs/thinking) and its [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) and [Gemini 4 Argon](https://ai.google.dev/gemini-api/docs/models/gemini-4-argon) model pages for provider thinking levels, defaults, and token limits.
We reviewed GitHub's [Copilot models-and-pricing documentation](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing) for the cited promotional display rates.
These official references inform the maintained model research without supplying bundled code or provider configuration.

We reviewed the arXiv paper [When Agents Do Not Stop: Uncovering Infinite Agentic Loops in LLM Agents](https://arxiv.org/abs/2607.01641v1) by Xinyi Hou, Shenao Wang, Yanjie Zhao, and Haoyu Wang.
We reviewed the arXiv paper [Are LLMs Reliable Code Reviewers? Systematic Overcorrection in Requirement Conformance Judgement](https://arxiv.org/abs/2603.00539v1) by Haolin Jin and Huaming Chen.
We reviewed the arXiv paper [Rethinking the Value of Agent-Generated Tests for LLM-Based Software Engineering Agents](https://arxiv.org/abs/2602.07900v2) by Zhi Chen, Zhensu Sun, Yuling Shi, Chao Peng, Xiaodong Gu, David Lo, and Lingxiao Jiang.
These references inform research notes and do not supply Workgraph code or prove its performance.

We also consulted [Semantic Line Breaks](https://sembr.org/) for Markdown source formatting.

Earlier design research included [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) and [LangChain's graph engineering retrospective](https://www.langchain.com/blog/3-years-of-graph-engineering-with-langgraph).
We also studied [context4ai/agent-graph](https://github.com/context4ai/agent-graph/blob/main/docs/en/graph-engineering.md) and [luxiaolei/graph-engineering](https://github.com/luxiaolei/graph-engineering).
These sources informed discussion of context boundaries and graph execution.
Workgraph does not bundle their code or adopt their runtime guarantees.

## Communication Guidance

The Writing skill also adapts communication guidance from [i-have-adhd](https://github.com/ayghri/i-have-adhd/blob/main/skills/i-have-adhd/SKILL.md) by Ayoub Ghriss.
The source repository declares the MIT license and identifies 2026 copyright.
This adaptation uses general communication guidance without redistributing the source skill verbatim.
