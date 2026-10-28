# Workflow Script Authoring

## Map The Main Graph

Use Main's accepted node contracts and dependencies as script inputs.
Encode accepted dependencies in Workflow control flow, not progress labels.
Pass each agent its accepted inputs, bounded task, authority, and output evidence contract.
Pass each dependent call only the predecessor results it needs.
Do not assume local variables, progress labels, phases, or agent context transfer between calls.
Keep deterministic tool selection, path routing, and retry decisions in native script control flow.
Delegate filesystem and tool execution to agents because the script only coordinates them.
Use existing host capabilities without requiring another execution engine or claiming that one ran.

Pass Main's per-stage model and effort selections, respecting overrides and pinned agent definitions.
Keep scan stages read-only.
Follow Main's [editor isolation policy](../../main-agent-contract/SKILL.md#assignments).
Use a supported read-only `agentType` or existing host tool restrictions for scans, without inventing a `readOnly` option.
Set `isolation: 'worktree'` through the native tool contract for edits.
Return each edit's diff, checks, and worktree ownership to Main before integration and cleanup.
When explicit approval is required, end the proposal run before any edit and start edits only after approval.

## Partition By Domain

Evaluate each phase for independent work in actual domains, keyed by owned scope and required results.
Use bounded domain pipelines with only the stages each domain needs rather than a Cartesian domain-by-phase staffing matrix.
Keep deterministic routing and transformations in the script instead of assigning extra agents.
Pass each domain successor its key, relevant file references, accepted evidence, and unresolved requirements.
Load only needed source for that assignment rather than reloading the whole source at every domain-stage cell.
Join domains only for actual shared dependencies, integration, or acceptance decisions.
Follow Delivery's [Review And Publish](../../delivery/SKILL.md#review-and-publish) procedure for independent delivery reviews.

Use `pipeline()` by default when each item's later work depends only on that item's earlier result.
Pipeline stages receive the previous result, original item, and item index.
An awaited pipeline runs item chains independently and returns their results together.
Use `parallel()` only when downstream work needs the complete result set.
A barrier is justified for cross-item deduplication, comparison, or a decision based on all results.
Do not use a barrier merely to transform results between item-local stages.

## Author The Script

Begin the script with `export const meta = {...}` using a pure literal.
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
Return unresolved failures, evidence, and remaining authorized avenues to Main when its retry policy requires reassessment.
Keep this count separate from schema retries, stalled-agent restarts, inference sampling, and task-attempt limits.
Reassessment never waives blockers, required checks, or user approval.

## Resume Conservatively

Resume only in the same session, using the original `runId` and returned `scriptPath`.

Before editing, consider cache hits for completed earlier phases and agent calls.
Preserve their prompts, options, labels, and arguments when accepted inputs remain unchanged.
Edit the stored script and pass `scriptPath` with `resumeFromRunId` to append needed stages and reuse valid completed calls.
Preserve accepted evidence only while behavior, inputs, configuration, and toolchain remain relevant.
Inspect actual native cache-hit evidence before claiming reuse.
A cache hit avoids repeated work but does not prove acceptance.
