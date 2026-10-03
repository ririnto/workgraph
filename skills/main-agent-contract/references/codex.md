# Codex Guidance

## Orchestration

Use available native delegation tools for independent and dependent assignments.
Codex does not provide Claude Code's native Workflow tool.

## Model Selection

Use `luna` for clear tasks, including development, review, document analysis, and multistep agentic work.
Use `sol` when conflicting evidence, difficult tradeoffs, or acceptance failures justify stronger judgment.
Use each family's current model guidance and workload evidence to adjust these effort starting points.
Do not select the highest effort automatically.
Call `astra` only at the user's explicit request.
Compare Luna `high` through `max` with Sol `medium` or `high` for required quality, total cost, and latency.

| Model | Workload | Effort guidance |
| --- | --- | --- |
| `luna` | Simple exploration and extraction | Use `low`. |
| | Coding, debugging, refactoring, and code review | Use `xhigh` or `max`. |
| | Other clear analysis and agentic work | Use `medium` or `high`, increasing effort when required reasoning justifies it. |
| `sol` | Simple queries, conversions, and extraction | Use `low`. |
| | Ordinary development, review, and document analysis | Use `medium`. |
| | Complex debugging, algorithms, and architecture | Use `high`. |
| `astra` | Bounded work | Start at `low`. |
| | Difficult terminal repairs or agentic work | Compare `medium` and `xhigh` before testing `max`. |

For difficult mathematics, science, or long agent work, select Sol effort above `high` only after comparable-task evaluation.
Require quality gains that justify latency and cost over lower effort.
