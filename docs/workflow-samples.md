# Workflow Samples

Workgraph bundles two launchable native Workflow samples that run an authorized engineering delivery graph end to end.
Each sample is a self-contained script with a default model per phase, and every phase prompt accepts an injected part through `args` at dispatch time.
The samples exercise the native Workflow interface and add no scheduler, execution engine, or repository dependency.

| Variant | Source | Shape |
| --- | --- | --- |
| Simple task | [delivery-simple.workflow.txt](../skills/workflow/scripts/delivery-simple.workflow.txt) | At most two scopes, exactly one work unit on the task branch, and integration conditionally skipped. |
| Complex task | [delivery-complex.workflow.txt](../skills/workflow/scripts/delivery-complex.workflow.txt) | Up to four scopes, a plan-decided unit split with per-unit worktrees, and integration only when split. |

## Launch

Run a sample from a checkout the session can read, passing the goal and dispatch choices through `args`.
The Workflow tool accepts the stored file through `scriptPath` or its complete text through `script`.
The first invocation executes the source directly and registers no named workflow command.

```js
Workflow({
  scriptPath: 'skills/workflow/scripts/delivery-simple.workflow.txt',
  args: {
    task: 'Fix the parser bug and verify the original trigger.',
    baseBranch: 'main',
    issue: '#12'
  }
})
```

For a repeatable command, save a run from `/workflows` or copy a sample into `.claude/workflows/` in the project, and the host then runs it by name.
The sample sources stay plain script bodies, so they need no wrapper, transform, dependency, or lint exception.

## Dispatch Inputs

| Input | Contract |
| --- | --- |
| `task` | Required nonempty string holding the delivery goal. |
| `issue` | Optional issue reference string included in the publication prompt. |
| `baseBranch` | Optional base branch string used by the sweep, publication, and review prompts. |
| `skips` | Optional object of boolean phase flags that skip dispatch without waiving acceptance. |
| `models` | Optional object of per-phase model selector strings overriding the defaults. |
| `promptParts` | Optional object of per-phase instruction strings injected into the composed prompts. |
| `maxFixRounds` | Optional integer from 0 through 3 bounding review-driven fix rounds. |

## Phases

| Phase | Default model | Required predecessor data | Completion evidence |
| --- | --- | --- | --- |
| Scope | `opus` | The delivery goal. | Disjoint scopes with keys, descriptions, and owned paths. |
| Explore | `haiku` | One scope per explorer. | Per-scope summary, consumer risks, and evidence. |
| Plan | `opus` | The scopes and exploration findings. | Work units with disjoint owned paths and instructions. |
| Implement | `sonnet` | One unit per agent, with matching exploration only. | Changed files, diff summary, checks, and evidence. |
| Integrate | `sonnet` | All unit results, only when the plan split units. | Merge outcome with conflicts and evidence. |
| Sweep | `haiku` | The branch diff and untracked files only. | Exposure list that is empty when the change is clean. |
| Publish | `sonnet` | A clean sweep, the change summary, and the issue reference. | PR or MR URL with a created or updated action. |
| Review | `sonnet` | The change summary and integration outcome. | Verdict with concrete findings and evidence. |

Implementation runs each unit in its own isolated native worktree exactly when the plan defines more than one unit.
A single-unit plan edits the task branch directly, so integration is skipped as not required.

## Skip, Failure, And Recovery

Each phase records `completed`, `skipped`, or `failed` with a reason, and the run returns `complete` only when every required phase completed and review passed.
A skipped phase never counts as passing, so a dispatch that skips implementation or publication returns `complete: false` with the skips recorded.
Integration is the one conditionally required phase, and a single-unit plan skips it without blocking completion.
A failed or missing predecessor skips its dependent phases instead of fabricating their results.
A `fix-required` review returns to implementation for the affected units, bounded by `maxFixRounds`, and then repeats integration, sweep, publication, and review so earlier evidence is replaced rather than reused.
The affected-unit mapping falls back to every unit when no finding names an owned path, and the fallback is logged.

## Models

Every phase has a default functional model selector, and `args.models` overrides any phase for one dispatch.
The defaults are host-resolved aliases, so the samples carry no specific model identity or routing.
An override must be a nonempty selector string the host supports for agent calls.

## Cache Reuse

Resume a run in the same session with the stored `scriptPath` and `resumeFromRunId`, and unchanged agent calls return their saved results.
A changed prompt, model, or predecessor result re-runs its call and every later call, which is what invalidates stale sweep, publication, and review evidence after a fix round.
A cached result avoids repeated work but does not prove acceptance, so a resumed run still needs its phase evidence checked.
Sibling agents with matching settings can share the host prompt-cache prefix, which affects cost and speed but not the recorded phase evidence.
Inspect the run journal when a result is missing or unexpected, as the [authoring reference](../skills/workflow/references/authoring.md) describes.
