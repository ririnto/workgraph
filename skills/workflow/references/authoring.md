# Workflow Script Authoring

Use this reference when authoring, extending, or resuming a native Workflow script.

The native Workflow tool description defines its current API and takes precedence over examples here.
This reference adds Workgraph's graph mapping, result acceptance, and recovery rules.

## Map The Main Graph

Use Main's accepted node contracts and dependencies as script inputs.
Encode accepted dependencies in Workflow control flow, not progress labels.
Pass each agent its accepted inputs, bounded task, authority, and output evidence contract.
Pass each dependent call only the predecessor results it needs.
Do not assume local variables, progress labels, phases, or agent context transfer between calls.
Keep deterministic tool selection, path routing, and retry decisions in native script control flow.
Delegate filesystem and tool execution to agents because the script only coordinates them.
Use existing host capabilities without requiring JEV, installing an engine, or claiming JEV execution.

Pass Main's per-stage model and effort selections, respecting overrides and pinned agent definitions.
Keep scan stages read-only and give each edit agent a separate host-supported isolated worktree.
Use a supported read-only `agentType` or existing host tool restrictions for scans, without inventing a `readOnly` option.
Use native `isolation: 'worktree'` for edits when supported by the current tool contract.
Return each edit's diff, checks, and worktree ownership to Main before integration and cleanup.
When explicit approval is required, end the proposal run before any edit and start edits only after approval.

## Partition By Domain

Evaluate each phase for independent work in actual domains, keyed by owned scope and required results.
Use bounded domain pipelines with only the stages each domain needs rather than a Cartesian domain-by-phase staffing matrix.
Keep deterministic routing and transformations in the script instead of assigning extra agents.
Pass each domain successor its key, relevant file references, accepted evidence, and unresolved requirements.
Load only needed source for that assignment rather than reloading the whole source at every domain-stage cell.
Join domains only for actual shared dependencies, integration, or acceptance decisions.
Keep one complete independent review per cohesive delivery unit instead of repeating it for every domain and phase.
Refresh only affected coverage unless the earlier complete review becomes insufficient.

Use `pipeline()` by default when each item's later work depends only on that item's earlier result.
Pipeline stages receive the previous result, original item, and item index.
An awaited pipeline runs item chains independently and returns their results together.
Use `parallel()` only when downstream work needs the complete result set.
A barrier is justified for cross-item deduplication, comparison, or a decision based on all results.
Do not use a barrier merely to transform results between item-local stages.

## Author The Script

Pass the first script inline through Workflow's `script` input.
Begin it with `export const meta = {...}` using a pure literal.
The required metadata fields are `name` and `description`.
Add `phases` when progress groups help, and match each title to a `phase()` call.
The tool returns a `scriptPath` and `runId` for later inspection or continuation.
Edit the returned `scriptPath` for iterations instead of creating an unrelated script.

Pass structured data through `args` as actual JSON values, not JSON-encoded strings.
The script runs as JavaScript and cannot access Node.js APIs, files, or external packages.
Use only the standard JavaScript syntax and built-ins supported by the host runtime.
Do not use TypeScript annotations or syntax.

`agent(prompt, options)` returns a promise and may return `null` after a skip or terminal API failure.
Await each required `agent()`, `pipeline()`, `parallel()`, and nested `workflow()` call.
A schema requests structured output, but the script must validate required fields and acceptance criteria.
Check native descriptions before using optional settings or a custom agent type.

`phase(title)` and agent options such as `label` and `phase` group progress for display.
They do not create dependency edges or guarantee that work ran.
Set `opts.phase` explicitly inside concurrent stages to avoid global phase races.
`meta.phases` describes progress and does not schedule or enforce phases.

Choose another permitted family or limit fan-out items when a caller enforces a per-family concurrency cap.
Workflow fan-out does not enforce that caller's family cap.
For a multi-model assessment, exclude a model whose evaluation request actually fails and finish with the remaining authorized available models.
Retain failed attempts, exclusions, and unrun coverage without counting them as passing evidence.
Preserve unmet acceptance when exclusions leave required coverage unverified.

Without a token target, `budget.total` is `null` and `budget.remaining()` is `Infinity`.
Serialization may display that `Infinity` as `null`, which does not mean zero.
`budget.spent()` covers Main and Workflow agent calls across the turn.
When a token target exists, treat it as a hard ceiling for further agent calls.
Keep retry limits independent of the token budget.

## Validate Phases And Results

Treat `null`, missing fields, malformed values, and unsupported evidence as incomplete.
Do not filter required results by truthiness to turn failures into success.
Distinguish a valid empty result, such as `{ findings: [] }`, from a failed or missing result.
Validate every required result before starting its dependent stage.
A malformed JSON Schema can fail before the agent runs.
A required name missing from a schema's `properties` may not fail as expected.
Treat schema validation as a format check, not proof of acceptance.
Validate finding identifiers and evidence before passing candidates to a verifier independent of the finder and fixer.
Require a verification result for every candidate before synthesis or confirmed reporting.
Retain confirmed, refuted, and unverified outcomes separately, including missing or inconclusive verifier results.
Do not replace independent verification with schema validation, majority votes, or the finder's self-check.

A pipeline stage that throws drops that item's result to `null` and skips its later stages.
A parallel thunk that throws resolves to `null`, while Workflow can still finish.
Failure diagnostics may therefore coexist with a completed Workflow result.
A script that returns after an all-null guard can skip later phases and still return normally.
Throw when required work cannot continue and no explicit empty-input path is valid.
When an empty input is valid, run the later phase and record why it had no items.

Record explicit phase outcomes such as `completed`, `skipped`, or `failed` with a reason.
A skipped required phase must fail the final acceptance check.
Return success only when every required phase has validated completion evidence.
Validate returned outcomes against a script-local list matching the declared phases before returning success.

```js
const declaredTitles = ['Count', 'Verify']
const requiredTitles = new Set(declaredTitles)
const completedTitles = phaseEvidence
  .filter(item => item.status === 'completed')
  .map(item => item.title)
const completedTitleSet = new Set(completedTitles)

if (
  requiredTitles.size !== declaredTitles.length ||
  phaseEvidence.length !== requiredTitles.size ||
  completedTitles.length !== requiredTitles.size ||
  completedTitleSet.size !== requiredTitles.size ||
  [...requiredTitles].some(title => !completedTitleSet.has(title))
) {
  throw new Error('Required phase evidence is incomplete')
}
```

Inspect `${transcriptDir}/journal.jsonl` before diagnosing unexpected or empty results.
The journal records agent starts, results, labels, and phases, but not every `phase()` call.
Compare agent-backed phase entries, returned values, failure diagnostics, and usage counters with planned nodes.
Check returned phase evidence for deterministic phases that have no agent journal entries.
Read relevant agent transcripts when journal results are missing or unexpected.
A completion notification or successful top-level return alone proves neither execution nor acceptance.

## Bound Fix Loops

Choose an observable progress measure before the first fix, such as remaining diagnostic identities or failing checks.
Compare each completed fix-and-check round against its predecessor using the same acceptance criteria.
Reset the consecutive no-progress count when verified results improve.
After two consecutive rounds without improvement, return unresolved failures, evidence, and remaining authorized avenues to Main.
Reconsider the approach instead of repeating the same ineffective loop.
Keep this count separate from schema retries, stalled-agent restarts, inference sampling, and task-attempt limits.
Reassessment never waives blockers, required checks, or user approval.

## Resume Conservatively

Resume only in the same session, using the original `runId` and returned `scriptPath`.
Inspect the journal and relevant transcripts before explaining unexpected results or deciding what to rerun.

Edit the stored script and pass `scriptPath` with `resumeFromRunId` to continue the same run.
Preserve accepted evidence only while behavior, inputs, configuration, and toolchain remain relevant.
A cache hit avoids repeated work but does not prove acceptance.

## Anti-Patterns

- Do not call an agent or pipeline without awaiting its result.
- Do not treat `null`, an empty failed pipeline, or failure diagnostics as successful empty findings.
- Do not assume `phase()` or `meta.phases` enforces execution order.
- Do not return successfully before required verification or synthesis runs.
- Do not start the same outcome through both Agent and Workflow.
- Do not trust a schema without checking the returned fields and evidence.
- Do not resume a Workflow from another session.

## Append-Only Example

The first script counts source files and validates its structured result.
Main selects `args.model` and `args.effort` under its active host reference before the run.
Pass those settings as structured arguments on the initial invocation and continuation.

```js
export const meta = {
  name: 'count-then-check',
  description: 'Count source files and verify the accepted count',
  phases: [{ title: 'Count' }]
}

const COUNT = {
  type: 'object',
  properties: { count: { type: 'integer' } },
  required: ['count']
}

phase('Count')
const inventory = await agent('Count source files and return {count: integer}.', {
  label: 'inventory',
  phase: 'Count',
  schema: COUNT,
  model: args.model,
  effort: args.effort
})
if (inventory === null || !Number.isInteger(inventory.count)) {
  throw new Error('Count result is incomplete')
}
return { inventory }
```

After accepting the count, append a `Verify` phase and preserve the original `inventory` call unchanged.
Replace its first-run terminal return with `const prior = { inventory }` so the new stage remains reachable.
Add `{ title: 'Verify' }` after the unchanged `Count` entry in `meta.phases`.

```js
const prior = { inventory }
phase('Verify')
const VERIFY = {
  type: 'object',
  properties: { accepted: { type: 'boolean' } },
  required: ['accepted']
}
const verification = await agent(
  `Check prior=${JSON.stringify(prior)} against ${args.criteria}. Return {accepted: boolean}.`,
  {
    label: 'verify',
    phase: 'Verify',
    schema: VERIFY,
    model: args.model,
    effort: args.effort
  }
)
if (verification === null || verification.accepted !== true) {
  throw new Error('Verification did not pass')
}
const phaseEvidence = [
  { title: 'Count', status: 'completed' },
  { title: 'Verify', status: 'completed' }
]
const declaredTitles = ['Count', 'Verify']
if (JSON.stringify(phaseEvidence.map(item => item.title)) !==
    JSON.stringify(declaredTitles)) {
  throw new Error('Required phase evidence is incomplete')
}
return { complete: true, phaseEvidence, prior, verification }
```

Resume with the same session's `scriptPath` and `resumeFromRunId`.
Retain the original `model` and `effort` arguments when resuming.
Add the new `criteria` argument, such as `'equals 3'`.
The new prompt carries both the accepted predecessor data and the new criterion.
Accept the result only when it includes both completed phase records and `{ accepted: true }`.
