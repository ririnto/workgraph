# Third-Party Notices

Workgraph contains instructions informed by the projects and documents listed here.
It does not redistribute their source files verbatim.
The [research notes](docs/research.md) record source evidence, reviewed sections, and limits.
This document records attribution and prior sources.

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

## Giver Architecture

We studied [sng2c/giver-architecture](https://github.com/sng2c/giver-architecture) at version `v0.1.1`.
Its package metadata declares the MIT license and names sng2c as the author.
The `giver-principles.md` reference informed separating coordination messages from working material and passing relevant results to successors.
Workgraph does not include its runtime or require its message schema.

## OpenAI Guidance

We reviewed the supplied copies of [Using GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md) and [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra.md).
These documents informed scoped autonomy, instruction priority, concise writing, progressive disclosure, and proportional verification.
We fetched the official [GPT-6 guide](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md) and [GPT-6.1 Sol model page](https://developers.openai.com/api/docs/models/gpt-6.1-sol.md).
We used their prompting and effort sections to confirm supported settings and evaluation needs for the selected model and workload.
These references do not replace local model policy or configure the host.
We reviewed the [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra.md) and [Luna](https://developers.openai.com/api/docs/models/gpt-6-luna.md) model pages, [model selection](https://developers.openai.com/api/docs/guides/model-selection.md), [reasoning](https://developers.openai.com/api/docs/guides/reasoning.md), [deployment checklist](https://developers.openai.com/api/docs/guides/deployment-checklist.md), and [Codex models](https://developers.openai.com/codex/models.md) for effort, pricing, and host starting settings.

## Anthropic Guidance

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

## Research And Official Documentation

The [research notes](docs/research.md) cite the papers and official documentation used for context, graph, and verification decisions.
We consulted the official [golangci-lint documentation](https://golangci-lint.run/docs/) for Go linting and custom-linter guidance.
The guidance uses its documented recommendations without redistributing golangci-lint code or claiming compatibility for a specific project.
We read the full [Agent Skills combined source](https://agentskills.io/llms-full.txt), including its specification and skill creation guidance.
Its guidance informed the conditional reference boundary without supplying plugin code or bundled assets.
We consulted Anthropic's official [Claude Code Workflow documentation](https://code.claude.com/docs/en/workflows) and [subagent documentation](https://code.claude.com/docs/en/sub-agents) for host behavior.
We reviewed the official [Claude Code skills documentation](https://code.claude.com/docs/en/skills) for activation descriptions, invocation controls, and supporting files.

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
