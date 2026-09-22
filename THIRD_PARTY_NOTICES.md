# Third-Party Notices

Workgraph is an original synthesis that was developed after studying the following projects.

No upstream source file is redistributed verbatim in this package.

## Superpowers

- Project: `obra/superpowers`
- Source revision: `44c9b2d6e889982ac18c27d05a19fefe335194e1`
- License: MIT
- Copyright: 2025 Jesse Vincent
- Source: `https://github.com/obra/superpowers`

The project informed the SessionStart bootstrap pattern, progressive Skill loading, and workflow-oriented packaging approach.

## Ponytail

- Project: `DietrichGebert/ponytail`
- Source revision: `16f29800fd2681bdf24f3eb4ccffe38be3baec6b`
- License: MIT
- Copyright: 2026 DietrichGebert
- Source: `https://github.com/DietrichGebert/ponytail`

The project informed implementation discipline.

## Giver Architecture

- Project: `sng2c/giver-architecture`
- Source version: `v0.1.1`
- Reference file: `giver-principles.md`
- License: MIT, as declared by the package metadata
- Author: sng2c
- Source: `https://github.com/sng2c/giver-architecture`

The reference informed the explicit steering and working-I/O partition, steering-only edge payloads, composed downstream history, result payloads without code bodies or test output, and cumulative breaking-change propagation.

## OpenAI Prompt Guidance

- Guide: "Using GPT-6 Astra"
- Source: <https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md>
- Article: "Rethinking skills and prompts for GPT-6 Astra"
- Publisher: OpenAI
- Source: <https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra.md>

These references informed concise activation descriptions, conditional workflows, proportional checks, and explicit authority and completion boundaries.
This is an attributed adaptation, not a quotation or evidence of measured performance.
Explicit user requirements and each contract's standalone authority rules remain binding.

## Graph Engineering Research

- "Graph Engineering in the Era of LLM Agents: From Individual Intelligence to System Intelligence" (2026):
  <https://arxiv.org/abs/2608.21156>
  The survey informed the separation of task dependencies, agent coordination, and execution state.
- "An LLM Compiler for Parallel Function Calling" (2023): <https://arxiv.org/abs/2312.04511>
  Dependency-aware scheduling informed ready-node execution, independent parallel work, and result-driven replanning.
- "Why Do Multi-Agent LLM Systems Fail?" (2025): <https://arxiv.org/abs/2503.13657>
  The MAST taxonomy informed explicit termination, prevention of repeated steps, communication boundaries, and evidence-based completion.
- "Towards a Science of Scaling Agent Systems" (2025): <https://arxiv.org/abs/2512.08296>
  Task-dependent coordination costs informed direct execution and selective delegation rather than mandatory multi-agent expansion.
- "Graph of Thoughts: Solving Elaborate Problems with Large Language Models" (2023): <https://arxiv.org/abs/2308.09687>
  The paper distinguishes reasoning graphs from the task and coordination graphs used here.
  Workgraph does not require exposing private reasoning or building thought graphs.
- "GRADE: Graph Representation of LLM Agent Dependency and Execution" (2026): <https://arxiv.org/abs/2606.22741>
  The abstract informed the distinction between observed dependencies, declared dependencies, and inferred relationships.
  Execution order alone does not establish a dependency or prove graph quality.
- "Verification-Aware Planning for Multi-Agent Systems" (EACL 2026): <https://aclanthology.org/2026.eacl-long.353/>
  The abstract informed planning acceptance evidence alongside subtask dependencies and handoff requirements.

These papers inform design choices, not claims of measured Workgraph performance or guaranteed model compliance.
Survey proposals and benchmark-specific findings are not universal runtime guarantees.

## Workflow Design References

- Anthropic, "Building effective agents": <https://www.anthropic.com/engineering/building-effective-agents>
  Informed simple composable workflows, bounded feedback, and evidence from tools.
- LangGraph, "Graph API overview": <https://docs.langchain.com/oss/python/langgraph/graph-api>
  Informed node, edge, state, and termination distinctions without adopting its runtime.
- LangChain, "3 Years of Graph Engineering with LangGraph":
  <https://www.langchain.com/blog/3-years-of-graph-engineering-with-langgraph>
  Informed conditional transitions, bounded cycles, and avoiding rigid graphs for open-ended work.
- Microsoft Agent Framework, "Workflow Builder & Execution":
  <https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/builder-and-execution>
  Informed explicit dependencies and synchronization costs; its superstep scheduler is not a Workgraph feature.
- `context4ai/agent-graph`, "Graph Engineering for Agent Skills":
  <https://github.com/context4ai/agent-graph/blob/main/docs/en/graph-engineering.md>
  Informed scoped context, observable evidence, and the distinction between contracts and runtime enforcement.
- `luxiaolei/graph-engineering`: <https://github.com/luxiaolei/graph-engineering>
  Reviewed as a governed graph-contract approach; its profiles, artifacts, and execution infrastructure are not adopted.
