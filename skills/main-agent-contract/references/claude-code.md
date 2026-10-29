# Claude Code guidance

## Orchestration

Use supported callback and wait controls for pending host operations.
Read Workflow for phase selection and execution.

## Model selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `haiku` | Extraction | Use `low`. |
| | Coding, debugging, refactoring, and code review | Use `xhigh`. |
| | Other clear analysis and agentic work | Use `medium`, or `high` for harder tasks. |
| `sonnet` | Edits and code review | Use `medium`, or `high` for harder tasks. |
| `opus` | Planning and complex reasoning | Use `medium`, or `high` for harder tasks. |
| `fable` | Explicitly requested work | Use `high`, `xhigh` for difficult terminal work, or `max` for the hardest reasoning. |

Where the host provides equivalent tier aliases, map each alias to its corresponding tier.
Subagent effort frontmatter overrides session effort unless `CLAUDE_CODE_EFFORT_LEVEL` is set.
Subagents inherit session thinking configuration without a separate toggle.
Set `max` only per session, in effort frontmatter, or through `CLAUDE_CODE_EFFORT_LEVEL`.
Never persist `max` in `effortLevel` or `modelSettings`.
Haiku defaults to adaptive `medium` and cannot disable thinking.
With Haiku, multi-turn `xhigh` can return no visible response.
Verify that a response was produced at `xhigh` effort.
Reserve Sonnet and Opus `xhigh` and `max` for explicit or configured choices under host rules.
[Model Effort Evidence](../../../docs/model-effort-evidence.md) covers specific workloads, not universal optima.
Do not pin a specific model version.
If a requested or configured setting requires a version pin, report the incompatibility without substituting it.
When these models or effort levels are unavailable, report the limitation and use a supported alternative only when permitted.
Use supported agent and tool controls, honoring explicit user and configuration choices.
Report unavailable or substituted settings using host evidence.
