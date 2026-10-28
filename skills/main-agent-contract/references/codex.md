# Codex Guidance

## Orchestration

Complete authorized work under native Codex execution rules and report results directly.
Use available authorized host controls for independent and dependent assignments.
Inspect unreadable native-assignment failures and try a supported form that preserves the required task scope.
Use a plain read-only CLI context when it is an authorized, equivalent fallback.
Let Main review the full posted diff when independent review remains blocked and an authorized fallback permits it.
Use the host's supported wait controls to collect required results.
Codex does not provide Claude Code's native Workflow tool.

## Resource Cleanup

Before retiring sessions, worktrees, recovery copies, caches, or Worktree Artifact connections, read Codex Scoped Cleanup.
Skip this read when its complete content is already loaded.
Route cleanup through the authorized resource owner and supported host operations.

## Model Selection

Select model tier and effort from the concrete task's difficulty and boundedness, not its role or work kind.
For ordinary tasks, choose the lowest sufficient tier.
Choose a higher tier directly when likely failure and retry costs outweigh lower-tier per-call savings.
Resolve each tier at call time using the host's model list and supported controls.
For native Codex invocations, use the host-confirmed full model ID, never a bare alias or Claude-family name.

| Tier alias | Difficulty | Effort guidance |
| --- | --- | --- |
| `luna` | Simple exploration and extraction | Use `low`. |
| | Coding, debugging, refactoring, and code review | Use `xhigh`, or `max` for harder tasks. |
| | Other clear analysis and agentic work | Use `medium`, or `high` for harder tasks. |
| `terra` | Substantive coding and refactoring | Use `medium`, or `high` for harder tasks. |
| `sol` | Simple queries, conversions, and extraction | Use `low`. |
| | Ordinary development, review, and document analysis | Use `medium`. |
| | Complex debugging, algorithms, and architecture | Use `high`. |
| `astra` | Explicit request only | Follow the request. |

Where the host provides equivalent tier aliases, map each alias to its corresponding tier.
Verify that a response was produced at `xhigh` and `max` effort.
Reserve Terra and Sol `xhigh` and `max` for explicit or configured choices under host rules.
[Model Effort Evidence](../../../docs/model-effort-evidence.md) covers specific workloads, not universal optima.
Some coding evidence favors higher `luna` efforts without establishing a universal optimum.
The evidence does not establish the `terra` alias's model identity or effort performance.
Do not pin a specific model version.
If a requested or configured setting requires a version pin, report the incompatibility without substituting it.
When these models or effort levels are unavailable, report the limitation and use a supported alternative only when permitted.
Use supported agent and tool controls, honoring explicit user and configuration choices.
Report unavailable or substituted settings using host evidence.
