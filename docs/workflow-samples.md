# Workflow Samples

Workgraph bundles two native Workflow delivery samples and one read-only agent-authored design workflow.
The delivery samples provide per-phase model defaults, while design selectors come from runtime inputs or host configuration.
All three use the native Workflow interface without adding a scheduler, execution engine, or repository dependency.

| Variant | Source | Shape |
| --- | --- | --- |
| Simple task | [delivery-simple.js](../workflows/delivery-simple.js) | At most two scopes, exactly one work unit, and integration landing the unit branch. |
| Complex task | [delivery-complex.js](../workflows/delivery-complex.js) | Up to four scopes, a plan-decided unit split with per-unit worktrees, and integration of the named unit branches. |
| Agent design | [design.js](../workflows/design.js) | Parallel architecture and evidence work, followed by composition, challenge, and independent verification. |

## Launch

Run a sample from a checkout the session can read, passing the goal and dispatch choices through `args`.
Pass the registered workflow name on the first invocation.
Use the `scriptPath` and run ID the run returns, with `resumeFromRunId`, for a same-session continuation.
The plugin exposes each workflow by its metadata name.

```js
Workflow({
  name: 'workgraph:delivery-simple',
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
  args: {
    task: 'Fix the parser bug and verify the original trigger.',
    baseBranch: 'main',
    candidateBranch: 'task/fix-parser',
    issue: '#12'
  },
  resumeFromRunId: '<run ID returned by the first run>',
  scriptPath: '<scriptPath returned by the first run>'
})
```

The plugin discovers the bundled `.js` definitions in `workflows/`.
The dispatching session owns the task branch, initial candidate inspection, and any required issue.

## Agent Design

Run `/workgraph:workflow` with a design goal to launch the bundled source through native Workflow.
The `workgraph:design-lead` plugin agent is an optional main-session coordinator that uses the same skill and source.
The skill invokes the registered `workgraph:design` workflow.
Run the skill again for a fresh design, or continue the same session with the returned `scriptPath` and run ID.

| Phase | Specialist | Runtime model input | Completion evidence |
| --- | --- | --- | --- |
| Design | `workgraph:design-architect` and `workgraph:design-evidence` run in parallel. | `args.models.architecture` and `args.models.evidence`. | Both schema-valid architecture and evidence results cover every requirement. |
| Compose | `workgraph:design-composer` consumes both Design results. | `args.models.compose`. | One design, decisions, implementation steps, requirement mapping, and test plan. |
| Challenge | `workgraph:design-challenger` tests the composed design with counterexamples. | `args.models.challenge`. | Evidence-backed findings and substantive coverage, including when findings are empty. |
| Verify | `workgraph:design-verifier` independently assesses findings and requirements. | `args.models.verify`. | One disposition per finding and evidence-backed status for every requirement. |
| Acceptance | The workflow computes status from validated phase results. | No model call. | `complete` records phase completion, while `accepted` requires no unresolved blocker or requirement gap. |

The task input requires a nonempty `args.task` string.
Optional `requirements`, `constraints`, and `context` fields carry the design brief.
Optional `sources` must contain unique canonical repository-relative paths.
The `models` object accepts one host-supported selector per specialist role, with no workflow defaults.
When a selector is omitted, the agent call leaves its model unset for host configuration.

```js
Workflow({
  name: 'workgraph:design',
  args: {
    task: 'Design a reliable event-replay boundary.',
    requirements: ['Retries must not duplicate effects.'],
    models: {
      architecture: '<runtime selector>',
      evidence: '<runtime selector>',
      compose: '<runtime selector>',
      challenge: '<runtime selector>',
      verify: '<runtime selector>'
    }
  }
})
```

A failed or malformed specialist result blocks dependent phases and preserves successful sibling results.
Verified blocking or major findings, inconclusive findings, and unmet requirements make `accepted` false.
The workflow returns the candidate design, phase evidence, findings, blockers, and requested model inputs without performing implementation.

## Dispatch Inputs

| Input | Contract |
| --- | --- |
| `task` | Required nonempty string holding the delivery goal. |
| `issue` | Optional nonempty issue reference included in the publication and review prompts. |
| `baseBranch` | Optional base branch string used by the sweep, publication, and review prompts. |
| `candidateBranch` | Required before any implementation dispatch, naming the task branch the worker must verify as its starting reference. |
| `skips` | Optional object of boolean phase flags that skip dispatch without waiving required acceptance. |
| `models` | Optional object of per-phase model selector strings overriding the defaults. |
| `promptParts` | Optional object of per-phase instruction strings injected into the composed prompts. |
| `maxFixRounds` | Optional integer from 0 through 3 bounding review-driven fix rounds. |

## Phases

| Phase | Default model | Required predecessor data | Completion evidence |
| --- | --- | --- | --- |
| Scope | `opus` | The delivery goal. | Disjoint scopes with keys, descriptions, and owned paths. |
| Explore | `haiku` | One scope per explorer. | Per-scope summary, consumer risks, and evidence. |
| Plan | `opus` | The scopes and any exploration findings. | Work units with disjoint owned paths and instructions. |
| Implement | `sonnet` | One unit per agent, with any matching exploration. | Owned-path changed files, the unit branch with its verified start, and checks that all passed. |
| Integrate | `sonnet` | All accepted unit results after implementation completes. | Named unit branches merged, their resource states, and combined-candidate checks. |
| Sweep | `haiku` | The branch diff and untracked files only. | Exposure list that is empty when the change is clean. |
| Publish | `sonnet` | Completed implementation, completed integration, a clean sweep, the change summary, and any issue reference. | PR or MR URL with a created or updated action. |
| Review | `sonnet` | The change summary, integration outcome, and posted request URL. | Verdict with concrete findings and evidence. |

Implementation runs every unit in its own isolated native worktree, including a single-unit plan.
Each isolated worker verifies its worktree starts from the named task candidate before editing and synchronizes first when it does not.
Implementation requires `args.candidateBranch` to name the task candidate, which stays distinct from the publication base branch.
A missing candidate fails implementation before dispatch, so no editor edits from an unverified worktree start.
A repair round carries the integrated task branch as its required starting reference.
Unit ownership uses canonical repository-relative paths, so aliases, absolute paths, and escaping paths are rejected before dispatch, and every changed file must stay inside its unit.
Checks report explicit passed, failed, or skipped statuses, and a gate passes only when every required check passed.
Every unit commits to a branch named for the unit, so each attempt retains its known branch identity even when its checks fail.
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
A single unit lands through the same integration step, so missing integration is never treated as not required.
Publication always precedes review, and review requires the request posted by the completed publication phase.
Publication and review receive the per-unit checks and the combined-candidate checks.
A fix round updates the same posted request, replaces only the repaired units' results by key, and reviews the posted candidate again.
The scope, exploration, and sweep stages run with the built-in read-only Explore agent type, while review keeps the default agent and a read-only instruction.

## Skip, Failure, And Recovery

Each phase records `completed`, `skipped`, or `failed` with a reason.
The run returns `complete` only when every required phase completed and review passed or all findings were refuted.
Exploration may be explicitly skipped when the accepted task does not need it.
A skipped required phase does not pass, so skipping implementation or publication returns `complete: false`.
Integration is required after any completed implementation, so a skipped or failed integration blocks publication.
The run result retains the branch identity and state of every attempt, and a superseded branch stays listed because the samples retire nothing.
A retained resource never counts as passing evidence.
A failed or missing predecessor skips its dependent phases instead of fabricating their results.
A separate read-only agent verifies every `fix-required` finding before repair.
The verifier uses the Review phase model selector, including any `args.models.review` override.
It reports a confirmed, refuted, or unverified disposition with evidence for each finding.
Missing, malformed, failed, or unverified dispositions block repairs and acceptance.
Confirmed findings alone go to their owning units, bounded by `maxFixRounds`.
Each repair repeats integration, sweep, publication, review, and finding verification.
A fully refuted review can pass, and the result retains the review and disposition evidence.
A fix round replaces the repaired units' results by key, so unaffected unit evidence stays while combined-candidate evidence is regenerated.
A confirmed finding outside one unambiguous owned unit blocks the round for replanning.

## Models

The two delivery samples provide per-phase defaults, and `args.models` overrides a phase for one dispatch.
Their defaults are host-resolved aliases, so those sources carry no specific model identity or routing.
The design workflow has no model defaults and accepts optional selectors by specialist role through `args.models`.
An omitted design selector stays unset so the host can apply its current configuration.
Every override must be a nonempty selector string the host supports for agent calls.

## Cache Reuse

Resume a run in the same session with the stored `scriptPath` and `resumeFromRunId`, and native continuation may reuse unchanged agent calls.
Check the native run journal for actual cache hits and their relevance before reusing evidence.
A changed candidate, destination, owned path, finding set, or verification contract invalidates affected evidence and dependent decisions.
Before resuming, check the live checkout, the named task and base branch refs, the toolchain configuration, and the posted request against what the recorded run used, because native cache keys carry none of that state.
A changed input invalidates the affected cached calls, so pass the changed state through the affected prompts or arguments and expect those calls to re-run.
Never reuse a sweep or a posted review for a changed accepted candidate, because the recorded evidence describes the earlier candidate.
A repair round keeps the candidate branch name, so a repair sweep prompt can match an earlier one while the branch content differs.
Claude Code documents native continuation as reusing the longest unchanged prefix of calls, so a cached repair sweep also implies cached repair and integration results from the same recorded run.
A stale repair sweep therefore needs branch movement outside the recorded run, which the pre-resume ref check must catch, and the journal still confirms the actual cache hits.
A cached result avoids repeated work but does not prove acceptance, so a resumed run still needs its phase evidence checked.
Sibling agents with matching settings can share the host prompt-cache prefix, which affects cost and speed but not the recorded phase evidence.
Inspect the run journal when a result is missing or unexpected, as the [authoring reference](../skills/workflow/references/authoring.md) describes.
