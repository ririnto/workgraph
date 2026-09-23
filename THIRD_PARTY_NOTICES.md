# Third-Party Notices

Workgraph contains instructions informed by the projects and documents listed here.
It does not redistribute their source files verbatim.
The [research notes](docs/research.md) identify the papers, official documents, reviewed sections, and limits behind current design choices.

## Superpowers

We studied [obra/superpowers](https://github.com/obra/superpowers) at revision `44c9b2d6e889982ac18c27d05a19fefe335194e1`.
The project uses the MIT license and credits Jesse Vincent, copyright 2025.
It informed hook bootstrapping, scoped instruction loading, and task verification.
Workgraph uses its own context documents and execution rules.

## Ponytail

We studied [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) at revision `16f29800fd2681bdf24f3eb4ccffe38be3baec6b`.
The project uses the MIT license and credits Dietrich Gebert, copyright 2026.
It informed the preference for existing tools, limited abstractions, and the smallest sufficient implementation.

## Giver Architecture

We studied [sng2c/giver-architecture](https://github.com/sng2c/giver-architecture) at version `v0.1.1`.
Its package metadata declares the MIT license and names sng2c as the author.
The `giver-principles.md` reference informed separating coordination messages from working material and passing relevant results to successors.
Workgraph does not include its runtime or require its message schema.

## OpenAI Guidance

We reviewed the supplied copies of [Using GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md) and [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra.md).
These documents informed scoped autonomy, instruction priority, concise writing, progressive disclosure, and proportional verification.
Workgraph adapts those recommendations without changing model or API configuration.

## Anthropic Guidance

We reviewed the supplied copy of [Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5).
Its guidance informed completion behavior for unattended tasks and proportional progress updates.
Workgraph does not set model effort or change host API settings.
The [Claude Code skills reference](https://code.claude.com/docs/en/skills) defines user-only invocation and shared plugin file references.

## Stop Slop

We used [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) for prose editing.
The local skill identifies Hardik Pandya as its author and declares the MIT license.
It informed complete sentences, direct verbs, specific subjects, and removal of filler.
The plugin does not bundle that skill.

## Research And Official Documentation

The [research notes](docs/research.md) cite twelve papers and the official documentation used for context, graph, and verification decisions.
They include studies with different findings about repository instructions.
They distinguish abstract-level review from full-text review.
The cited benchmark results do not establish Workgraph's performance or guarantee model adherence.

We also consulted [Semantic Line Breaks](https://sembr.org/) for Markdown source formatting.
The user's sentence-level convention takes precedence over the specification's optional clause-level breaks.

Earlier design research included [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) and [LangChain's graph engineering retrospective](https://www.langchain.com/blog/3-years-of-graph-engineering-with-langgraph).
We also studied [context4ai/agent-graph](https://github.com/context4ai/agent-graph/blob/main/docs/en/graph-engineering.md) and [luxiaolei/graph-engineering](https://github.com/luxiaolei/graph-engineering).
These sources informed discussion of context boundaries and graph execution.
Workgraph does not bundle their code or adopt their runtime guarantees.
