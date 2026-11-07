# Workflow samples

Workgraph bundles one adaptive native Workflow delivery sample.
It accepts optional model and effort selectors and otherwise uses host configuration.
It uses the native Workflow interface without adding a scheduler, execution engine, or repository dependency.
This optional complete-delivery recipe declares its own phases and review coverage.
The plan decides whether the accepted unit branch is the candidate or named unit branches integrate into the candidate working branch.
The sample finishes with a reviewed PR or MR and does not merge that request into its target branch, which follows [Delivery's separate merge authority](../skills/delivery/SKILL.md#establish-merge-authority).
Choose a smaller graph or direct execution when the requested outcome does not need this process.
Its scope count and repair limit are sample-specific choices, not global Workgraph requirements.

| Workflow | Source | Shape |
| --- | --- | --- |
| Delivery | [delivery.js](../workflows/delivery.js) | Up to four scopes and four disjoint units, with integration conditional on the plan defining several units. |

## Launch

Run a sample from a checkout the session can read, passing the goal and dispatch choices through `args`.
Pass the registered workflow name on the first invocation.
Use the `scriptPath` and run ID the run returns, with `resumeFromRunId`, for a same-session continuation.
The plugin exposes each workflow by its metadata name.

```js
Workflow({
  name: 'workgraph:delivery',
  args: {
    task: 'Fix the parser bug and verify the original trigger.',
    baseBranch: 'main',
    candidateBranch: 'task/fix-parser',
    issue: '#12',
    models: { scope: '<model>', explore: '<model>', plan: '<model>', implement: '<model>', integrate: '<model>', sweep: '<model>', publish: '<model>', review: '<model>', verify: '<model>' },
    efforts: { scope: '<effort>', explore: '<effort>', plan: '<effort>', implement: '<effort>', integrate: '<effort>', sweep: '<effort>', publish: '<effort>', review: '<effort>', verify: '<effort>' }
  }
})
```

```js
Workflow({
  args: {
    task: 'Fix the parser bug and verify the original trigger.',
    baseBranch: 'main',
    candidateBranch: 'task/fix-parser',
    issue: '#12',
    models: { scope: '<model>', explore: '<model>', plan: '<model>', implement: '<model>', integrate: '<model>', sweep: '<model>', publish: '<model>', review: '<model>', verify: '<model>' },
    efforts: { scope: '<effort>', explore: '<effort>', plan: '<effort>', implement: '<effort>', integrate: '<effort>', sweep: '<effort>', publish: '<effort>', review: '<effort>', verify: '<effort>' }
  },
  resumeFromRunId: '<run ID returned by the first run>',
  scriptPath: '<scriptPath returned by the first run>'
})
```

The plugin discovers the bundled `.js` definitions in `workflows/`.
The dispatching session owns the task branch, initial candidate inspection, and any required issue.

## Read-only design

For read-only design work, use the [Workflow skill](../skills/workflow/SKILL.md), which admits only the Claude Code Main Agent before loading its read-only design procedure.
That procedure describes requirement coverage, challenge, verification selected for the task, and the tool boundaries needed for delegation.

## Dispatch inputs

| Input | Contract |
| --- | --- |
| `task` | Required nonempty string holding the delivery goal. |
| `issue` | Optional nonempty issue reference included in the publication and review prompts. |
| `baseBranch` | Optional base branch string used by the sweep, publication, and review prompts. |
| `candidateBranch` | Required before any implementation dispatch, naming the task branch the worker must verify as its starting reference and the exact integration destination for several units. |
| `skips` | Optional object of boolean phase flags that skip dispatch without waiving required acceptance. |
| `models` | Optional object of per-phase model selector strings and a separate `verify` selector. |
| `efforts` | Optional object of per-phase effort strings and a separate `verify` selector. |
| `promptParts` | Optional object of per-phase instruction strings injected into the composed prompts. |
| `maxFixRounds` | Optional integer from 0 through 3 bounding review-driven fix rounds, defaulting to 1. |

## Phases

| Phase | Required predecessor data | Completion evidence |
| --- | --- | --- |
| Scope | The delivery goal. | Disjoint scopes with keys, descriptions, and owned paths. |
| Explore | One scope per explorer. | Per-scope summary, consumer risks, and evidence. |
| Plan | The scopes and any exploration findings with evidence. | Work units with disjoint owned paths and instructions. |
| Implement | One unit per agent, with any matching exploration. | Owned-path changed files, the unit branch with its verified start, and checks that all passed. |
| Integrate | All accepted unit results after implementation completes. | For several units, named unit branches merged, their resource states, and combined-candidate checks; for one unit, an explicit conditional skip and the accepted unit branch. |
| Sweep | The branch diff and untracked files only. | Exposure list that is empty when the change is clean. |
| Publish | Completed implementation, completed or conditionally unnecessary integration, a clean sweep, the change summary, and any issue reference. | PR or MR URL with a created or updated action. |
| Review | The change summary, integration outcome, and posted request URL. | Verdict with concrete findings and evidence. |

Implementation runs every unit in its own isolated native worktree, including a single-unit plan.
Each isolated worker verifies its worktree starts from the named task candidate before editing and synchronizes first when it does not.
Implementation requires `args.candidateBranch` to name the task candidate, which stays distinct from the publication base branch.
A missing candidate fails implementation before dispatch, so no editor edits from an unverified worktree start.
A repair round carries the current accepted candidate as its required starting reference.
Unit ownership is normalized to canonical repository-relative paths, absolute and escaping paths are rejected before dispatch, and every reported changed file must normalize to a path inside its unit.
Checks report explicit passed, failed, or skipped statuses, and a gate passes only when every required check passed.
Each implementation worker is instructed to commit to a branch named for its unit, so the result records a reported branch even when its checks fail, while a failed or missing worker result can leave the branch identity unknown.
Integration receives the named candidate and each planned unit path.
It checks the destination, resolved base, protections, and actual branch diffs before writing.
Each unit is judged by its own changes since its merge base with the destination, because the destination advances as other units integrate.
A direct comparison with the advanced destination would show another unit's integrated files as deletions and could reject a valid unit or repair.
A retained unit branch that the destination already contains has no new changes and reports as merged.
It merges only the named unit branches and reports changed paths and actual diff evidence.
The result must name the candidate, keep changed paths within ownership, account for every named branch, and pass combined checks.
These reports are evidence claims, not independent proof of Git state.
Resource states apply only when every claim names a current unit branch and agrees with the merge outcome and conflicts.
A rejected, contradictory, superseded-branch, malformed, or duplicate claim changes no known state.
A consistent partial failure keeps its reported states, and a completed merge with failed combined checks keeps its merged states.
For one accepted unit, integration records `skipped` with the reason that no cross-unit integration is required, and the accepted unit branch becomes the candidate for sweep, publication, and review.
Its resource stays `implemented`, not `merged`, because no merge occurred.
Publication always precedes review, and review requires the request posted by the completed publication phase.
Publication and review receive the per-unit checks and the combined-candidate checks.
A fix round updates the same posted request, replaces only the repaired units' results by key, and reviews the posted candidate again.
The scope, exploration, and sweep stages run with the built-in read-only Explore agent type, while review keeps the default agent and a read-only instruction.

## Executed graph

The result includes `graph.nodes` and `graph.edges` using the [Main contract's graph vocabulary](../skills/main-agent-contract/SKILL.md#coordinate-outcomes) and [dependency design](design.md#compose-work-through-the-host).
Each node records `key`, `operation`, `prerequisites`, `inputs`, `outputs`, `owner`, `authority`, `completionEvidence`, `status`, and `reason`.
Result edges require accepted predecessor evidence, and condition edges evaluate `units.length > 1` or the explicit exploration choice.
Readiness derives from these edges rather than phase order alone.
Scope explorers, unit workers, finding verifiers, and repair attempts retain their own node records.
Every dispatch receives a compact graph-position block rendered from its node, including prerequisite statuses and evidence locations, input contracts, downstream outputs, and owned unit or scope when applicable.

## Skip, failure, and recovery

Each phase records `completed`, `skipped`, or `failed` with a reason.
The run returns `complete` only when every required phase completed and review passed or all findings were refuted.
That result establishes the sample's publication and review outcome, not a merge into the target branch.
Exploration may be explicitly skipped when the accepted task does not need it.
A skipped required phase does not pass, so skipping implementation or publication returns `complete: false`.
Integration is required for several units, so an explicit skip or failed integration blocks publication.
The one-unit conditional skip does not block delivery, while an explicit `skips.integrate` still blocks it.
The run result returns the separated scopes, each explorer's summary, risks, and evidence, and the sweep evidence so Main can check predecessor results.
The run result retains each branch identity reported by an implementation attempt and its recorded state, and superseded reported branches stay listed because the sample retires nothing.
A retained resource never counts as passing evidence.
A failed or missing predecessor skips its dependent phases instead of fabricating their results.
A separate read-only agent verifies every `fix-required` finding before repair.
The verifier uses `args.models.verify` and `args.efforts.verify` when supplied, independently of the review selectors.
Without a verifier selector, the agent call leaves that setting unset for host configuration.
It reports a confirmed, refuted, or unverified disposition with evidence for each finding.
Missing, malformed, failed, or unverified dispositions block repairs and acceptance.
Confirmed findings alone go to their owning units, bounded by `maxFixRounds`.
Each repair repeats the same unit-count integration decision, sweep, publication, review, and finding verification.
A fully refuted review can pass, and the result retains the review and disposition evidence.
A fix round replaces the repaired units' results by key, so unaffected unit evidence stays while combined-candidate evidence is regenerated.
A confirmed finding outside one unambiguous owned unit blocks the round for replanning.

## Models and effort

The delivery sample accepts optional selectors by phase through `args.models` and `args.efforts`, plus `verify` selectors for finding verification.
Main supplies both selectors for each phase it runs, following the [Main Agent Contract](../skills/main-agent-contract/SKILL.md#models).
An omitted selector stays unset so the host can apply its current configuration.
Every selector must be a nonempty string the host supports for agent calls.

## Cache reuse

Follow the [Workflow authoring reference](../skills/workflow/references/authoring.md) for continuation and cache reuse.
A changed candidate, destination, owned path, finding set, or verification contract invalidates affected evidence and dependent decisions.
Before resuming, check the live checkout, the named task and base branch refs, the toolchain configuration, and the posted request against what the recorded run used, because native cache keys carry none of that state.
A changed input invalidates the affected cached calls, so pass the changed state through the affected prompts or arguments and expect those calls to re-run.
Never reuse a sweep or a posted review for a changed accepted candidate, because the recorded evidence describes the earlier candidate.
A repair round keeps the candidate branch name, so a repair sweep prompt can match an earlier one while the branch content differs.
Continuation replays cached results without replaying their Git effects, so a cached sweep describes the candidate as it stood when that sweep first ran.
A later round inside the same recorded run can advance the candidate, so the live branch can match the run's final state while an earlier cached sweep describes an earlier candidate.
Before publishing from a resumed run, confirm that the gating sweep ran live against the current candidate, or change its inputs so it re-runs.
