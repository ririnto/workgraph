# Workflow Samples

Workgraph bundles two launchable native Workflow samples that run an authorized engineering delivery graph end to end.
Each sample is a self-contained script with a default model per phase, and every phase prompt accepts an injected part through `args` at dispatch time.
The samples exercise the native Workflow interface and add no scheduler, execution engine, or repository dependency.

| Variant | Source | Shape |
| --- | --- | --- |
| Simple task | [delivery-simple.workflow.txt](../skills/workflow/scripts/delivery-simple.workflow.txt) | At most two scopes, exactly one work unit, and integration landing the unit branch. |
| Complex task | [delivery-complex.workflow.txt](../skills/workflow/scripts/delivery-complex.workflow.txt) | Up to four scopes, a plan-decided unit split with per-unit worktrees, and integration of the named unit branches. |

## Launch

Run a sample from a checkout the session can read, passing the goal and dispatch choices through `args`.
Pass the complete source text through `script` on the first invocation, as the Workflow skill requires.
Use the `scriptPath` and run ID the run returns, with `resumeFromRunId`, for a same-session continuation.
The first invocation executes the source directly and registers no named workflow command.

```js
Workflow({
  script: '<complete text of skills/workflow/scripts/delivery-simple.workflow.txt>',
  args: {
    task: 'Fix the parser bug and verify the original trigger.',
    baseBranch: 'main',
    candidateBranch: 'task/fix-parser',
    issue: '#12'
  }
})
```

```js
Workflow({
  args: { task: 'Fix the parser bug and verify the original trigger.', baseBranch: 'main', issue: '#12' },
  resumeFromRunId: '<run ID returned by the first run>',
  scriptPath: '<scriptPath returned by the first run>'
})
```

For a repeatable command, save a run from `/workflows`, or copy a sample source to `.claude/workflows/delivery-simple.js` or `.claude/workflows/delivery-complex.js` in the project.
Named discovery reads `.js` files, so a copied `.workflow.txt` resource needs its `.js` destination name.
The sample sources stay plain script bodies, so they need no wrapper, transform, dependency, or lint exception.
The dispatching session owns the linked issue, the task branch, and the initial complete-candidate scan before it authorizes implementation, as its Delivery procedure requires.

## Dispatch Inputs

| Input | Contract |
| --- | --- |
| `task` | Required nonempty string holding the delivery goal. |
| `issue` | Required issue reference string included in the publication and review prompts. |
| `baseBranch` | Optional base branch string used by the sweep, publication, and review prompts. |
| `candidateBranch` | Required before any implementation dispatch, naming the task branch the worker must verify as its starting reference. |
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
| Implement | `sonnet` | One unit per agent, with matching exploration only. | Owned-path changed files, the unit branch with its verified start, and checks that all passed. |
| Integrate | `sonnet` | All accepted unit results after implementation completes. | Named unit branches merged, their resource states, and combined-candidate checks. |
| Sweep | `haiku` | The branch diff and untracked files only. | Exposure list that is empty when the change is clean. |
| Publish | `sonnet` | Completed implementation, completed integration, a clean sweep, the change summary, and the issue reference. | PR or MR URL with a created or updated action. |
| Review | `sonnet` | The change summary, integration outcome, and posted request URL. | Verdict with concrete findings and evidence. |

Implementation runs every unit in its own isolated native worktree, including a single-unit plan.
Each isolated worker verifies its worktree starts from the named task candidate before editing and synchronizes first when it does not.
Implementation requires `args.candidateBranch` to name the task candidate, which stays distinct from the publication base branch.
A missing candidate fails implementation before dispatch, so no editor edits from an unverified worktree start.
A repair round carries the integrated task branch as its required starting reference.
Unit ownership uses canonical repository-relative paths, so aliases, absolute paths, and escaping paths are rejected before dispatch, and every changed file must stay inside its unit.
Checks report explicit passed, failed, or skipped statuses, and a gate passes only when every required check passed.
Every unit commits to a branch named for the unit, so each attempt retains its known branch identity even when its checks fail.
Integration merges exactly the named unit branches into the authorized task branch, requires each resource to match its named branch exactly, and runs the checks on the combined candidate.
Resource states apply only from a consistent ledger, so a rejected, malformed, or duplicate claim never overrides the known identity.
A single unit lands through the same integration step, so missing integration is never treated as not required.
Publication always precedes review, and review requires the request posted by the completed publication phase.
Publication and review receive the per-unit checks and the combined-candidate checks.
A fix round updates the same posted request, replaces only the repaired units' results by key, and reviews the posted candidate again.
The scope, exploration, and sweep stages run with the built-in read-only Explore agent type, while review keeps the default agent and a read-only instruction.

## Skip, Failure, And Recovery

Each phase records `completed`, `skipped`, or `failed` with a reason, and the run returns `complete` only when every required phase completed and review passed.
A skipped phase never counts as passing, so a dispatch that skips implementation or publication returns `complete: false` with the skips recorded.
Integration is required after any completed implementation, so a skipped or failed integration blocks publication.
The run result retains the branch identity and state of every attempt, and a superseded branch stays listed because the samples retire nothing.
A retained resource never counts as passing evidence.
A failed or missing predecessor skips its dependent phases instead of fabricating their results.
A `fix-required` review returns to implementation for the affected units, bounded by `maxFixRounds`, and then repeats integration, sweep, publication, and review.
A fix round replaces the repaired units' results by key, so unaffected unit evidence stays while combined-candidate evidence is regenerated.
The affected-unit mapping falls back to every unit when no finding names an owned path, and the fallback is logged.

## Models

Every phase has a default functional model selector, and `args.models` overrides any phase for one dispatch.
The defaults are host-resolved aliases, so the samples carry no specific model identity or routing.
An override must be a nonempty selector string the host supports for agent calls.

## Cache Reuse

Resume a run in the same session with the stored `scriptPath` and `resumeFromRunId`, and unchanged agent calls return their saved results.
A changed prompt, model, or predecessor result re-runs its call and every later call, which is what invalidates stale sweep, publication, and review evidence after a fix round.
Before resuming, check the live checkout, the named task and base branch refs, the toolchain configuration, and the posted request against what the recorded run used, because native cache keys carry none of that state.
A changed input invalidates the affected cached calls, so pass the changed state through the affected prompts or arguments and expect those calls to re-run.
Never reuse a sweep or a posted review for a changed accepted candidate, because the recorded evidence describes the earlier candidate.
A cached result avoids repeated work but does not prove acceptance, so a resumed run still needs its phase evidence checked.
Sibling agents with matching settings can share the host prompt-cache prefix, which affects cost and speed but not the recorded phase evidence.
Inspect the run journal when a result is missing or unexpected, as the [authoring reference](../skills/workflow/references/authoring.md) describes.
