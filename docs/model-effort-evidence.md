# Model Effort Evidence

## Scope

This record compares public evidence for seven exact models.
No local Workgraph test establishes model quality.
The six multi-task effort tables supply the main comparisons.
The smaller workload studies supply supporting evidence and limits.
These results describe the authors' tasks, harnesses, and settings.
Use their methods and limits when choosing comparable local experiments.
Read [the research notes](research.md#model-effort-and-cost) for supported controls, official defaults, host settings, and pricing.
The selection implications below are workload-specific judgments.
We have not evaluated Workgraph adherence or established universal effort rankings.

### Shared Measurement Limits

[Artificial Analysis](https://artificialanalysis.ai/methodology/intelligence-benchmarking) uses Intelligence Index v4.3.2, a ten-evaluation composite.
It weights agent tasks at 30%, coding at 20%, scientific reasoning at 20%, and general tasks at 30%.
Its estimated cost per task includes input, output, and cache prices with measured typical cache behavior.
Its decode-time estimates exclude first-token latency and tool overhead.
Rounded index differences do not establish paired statistical significance.

Artificial Analysis uses 66 Terminal-Bench 4.0 tasks with three repeats each, totaling 198 attempts per setting.
It runs mini-swe-agent with a 500-step cap, upstream task timeouts, and no context compaction.
A task passes if all tests pass in its separate verifier container.
Its scores differ from Claude Code and Codex harness scores.

Anthropic permits [default fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) to answer through another Claude model.
Artificial Analysis labels the Fable, Opus, and Sonnet variants below with default fallback.
Their curves therefore describe that deployment configuration.
The inspected aggregate pages omit per-effort fallback counts and targets, except for Sonnet's release article.

## GPT-6 Luna

[Artificial Analysis's release comparison](https://artificialanalysis.ai/models/releases/gpt-6-luna) reports the following rounded effort results.
The output column covers the whole index run, rather than output per task.

| Effort | Intelligence Index | Estimated dollars per task | Index output tokens |
| --- | ---: | ---: | ---: |
| low | 22 | 0.0045 | 8.2M |
| medium | 30 | 0.02 | 29M |
| high | 33 | 0.03 | 47M |
| xhigh | 35 | 0.04 | 69M |
| max | 38 | 0.07 | 140M |

Max adds three rounded index points over xhigh at 75% more estimated cost.
Its median first-answer latency is 124.2 seconds, versus xhigh at 20.86 seconds.
These latency measurements describe answer arrival, rather than task completion time.
The none variant scores 18 at $0.01 per task, so measured cost does not rise at every effort transition.

### Diagram Generation And Coding

[GitDiagram's rollout record](https://github.com/ahmedkhaleel2004/gitdiagram/blob/main/docs/gpt-6-luna-rollout.md) compares two deployment configurations.
The initial eight medium calls reused four old fixtures, producing seven valid outputs and six recoveries.
Their median duration was 39.98 seconds.
The final low and Fast configuration used eight fresh calls across four repositories.
It produced eight valid outputs with no recoveries and a median duration of 6.97 seconds.
Complete cold calls cost $0.004764, excluding cancellations and repairs.
Changed fixtures and service tiers prevent an isolated low-versus-medium conclusion.

[ElectricityBench's week 40 record](https://electricitybench.com/models/codex-cli-gpt-6-luna/) uses Codex CLI 0.157.1 at medium.
It reports 11 of 15 real coding tasks, 57% capability, and a 64-second median duration.
The capability score differs from the real-task pass fraction.
The authors keep outputs private, and earlier GPT-5.6 results concern another release.

For bounded diagram generation, evaluate the complete deployment configuration with fresh fixtures and recovery costs.
Use the composite curve to budget Luna escalation, then test the target task's required quality.

## GPT-6.1 Sol

[Artificial Analysis's release comparison](https://artificialanalysis.ai/models/releases/gpt-6-1-sol) reports these effort variants without a fallback label.
It reports the following rounded composite scores and estimated costs.

| Effort | Intelligence Index | Estimated dollars per task |
| --- | ---: | ---: |
| low | 42 | 0.13 |
| medium | 48 | 0.21 |
| high | 50 | 0.32 |
| xhigh | 51 | 0.39 |
| max | 52 | 0.72 |

High to max adds two rounded index points while estimated cost rises 125%.
That comparison does not establish a coding-specific plateau.

### Public Coding And Reasoning Runs

[Joonlab's study](https://github.com/joonlab/gpt-6.1-sol-benchmark/blob/main/README.md) reports ten Python tasks with two repeats each.
Low, medium, high, and xhigh each passed 20 of 20 calls.
Mean output tokens were 821.85, 1,113.2, 1,598.6, and 4,067 in that order.
Median completion times were 21.845, 26.45, 35.17, and 61.175 seconds.
The study supplies [per-call coding results](https://github.com/joonlab/gpt-6.1-sol-benchmark/blob/main/data/coding/results.csv) but omits the harness, grader, and hidden tests.
The author relaxed one regex grading rule after observing outputs.
The coding sample reaches its score ceiling and omits max.

The same study repeats one [reasoning prompt](https://github.com/joonlab/gpt-6.1-sol-benchmark/blob/main/data/speed/speed_calls.csv) three times at each of five efforts.
The author marks all attempts correct.
High's medians were 516 reasoning tokens and 26.837 seconds, compared with max at 1,399 tokens and 53.478 seconds.
One prompt cannot establish performance on harder reasoning tasks.

For small Python tasks like the ceiling sample, test lower effort before paying for extra reasoning.
Use harder acceptance cases before deciding whether Sol xhigh or max improves required outcomes.

## GPT-6 Astra

[DeepSWE's live artifact](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json) reports 113 tasks with four attempts each.
The authors used one bash tool through mini-swe-agent, rather than the Codex harness.

| Effort | Pass rate | Estimated dollars per task | Mean wall seconds per task |
| --- | ---: | ---: | ---: |
| low | 67.04% | 1.595 | 613 |
| medium | 72.79% | 3.075 | 884 |
| high | 73.23% | 3.924 | 1,039 |
| xhigh | 74.12% | 4.429 | 1,132 |
| max | 73.23% | 7.498 | 1,983 |

The authors describe their method in [the DeepSWE article](https://deepswe.datacurve.ai/blog/deepswe).
Their [README](https://github.com/datacurve-ai/deep-swe/blob/main/README.md) supplies the harness details.
The four-run confidence intervals overlap for medium, high, xhigh, and max.
The artifact date is September 22, while its job date is September 1, before the September 3 public release.
The authors identify an alias rather than a dated model snapshot and omit the mode.
They normalize costs at one context rate and omit current surcharges above 272K tokens.
Cumulative input counts do not establish each request's context length.

### Application Building

[Dyad's study](https://github.com/dyad-sh/dyad/blob/main/benchmarks/app-builder/RESULTS.md) covers three applications with three milestones each.
The authors run each case once per setting.
Low scored 94.7% for $25.43 and 50 minutes, versus medium at 85.5% for $43.53 and 83 minutes.
The composite weights user journeys at 60%, security at 25%, and one Sol judge at 15%.
The authors estimate token costs and keep the generated outputs private.
This small application sample needs repetition before selecting low for another workload.

For DeepSWE-style terminal repairs, compare medium and xhigh against the same local acceptance tests.
The reported max setting increases time and cost without improving its mean pass rate over high.

## Claude Haiku 4.5

[Artificial Analysis's release comparison](https://artificialanalysis.ai/models/releases/claude-4-5-haiku) reports reasoning at index 17 and $0.28 per task.
That run produced 78M output tokens, with no published thinking budget.
The non-reasoning variant has an estimated index of 15.411 and no cost result.
The two variants do not establish a controlled quality gain from thinking.
Haiku does not support the effort control used in the preceding tables.
Its thinking budget is a separate control.

### Structured Output And Knowledge Retrieval

[Career Ops' report](https://github.com/career-ops-hq/career-ops/blob/claude/keen-albattani-oehpz5/evals/results/README.md) describes structured-output experiments.
The author supplies [call records](https://github.com/career-ops-hq/career-ops/blob/claude/keen-albattani-oehpz5/evals/results/claude-runs.jsonl).
The study records 108 calls, including 45 exact Haiku calls with null effort metadata.
The synthetic workload uses 15 posts, one profile, and an Opus 5 reference rather than human ground truth.
Schema success is 0/30 for baseline and 6/15 for inline instructions, with repeat drift of 0.38.
The reported Haiku totals are 0.76M processed tokens and 12K output tokens.
The median CLI duration is 2.6 minutes, with an estimated cost of $0.25.
The study changes instruction structure without controlling a thinking-budget sweep.

[Strauss Agent Tools' analysis](https://github.com/saasontools/strauss-agent-tools/blob/assafkamil/saa-597-research-control-arm-benchmark-for-standing-fields-does/packages/strauss-kb/bench/results/full-claude-x3-2026-09-05-analysis.md) compares knowledge-retrieval configurations.
The study covers 744 calls: 31 questions, four arms, two models, and three repeats.
The authors disable thinking and verify zero thinking tokens.
Haiku's 26 core questions score 98.7%, 94.9%, 87.2%, and 100% across information structures.
The study supplies no thinking-enabled sweep.

[Caty's benchmark](https://github.com/caty-ai/caty-agent-harness/blob/main/docs/benchmark.md) compares bare and harness runs of headless `claude-haiku-4-5`.
The authors supply aggregate results in `docs/benchmark/ev006-aggregate.json` and identify the model in issue 100.
They cover three genres, three sizes, and five instances per combination.
On medium and large cases, bare runs pass 4/30 and harness runs pass 13/30.
On small cases, bare runs pass 10/15 and harness runs pass 9/15.
Both configurations pass 0/10 medium and large CSV cases.
The authors change the turn caps from 10 to 16 or 24 and omit the thinking budget.
Raw transcripts remain offline, and the comparison isolates neither effort nor thinking budget.

For structured output and retrieval, measure instruction structure before assigning extra thinking budget.
Record the budget and observed thinking tokens because an effort label cannot describe Haiku's configuration.

## Claude Sonnet 5.5

[Artificial Analysis's live release comparison](https://artificialanalysis.ai/models/releases/claude-sonnet-5-5) reports these rounded values with default fallback.

| Effort | Intelligence Index | Estimated dollars per task |
| --- | ---: | ---: |
| low | 36 | 0.42 |
| medium | 41 | 0.59 |
| high | 47 | 1.12 |
| xhigh | 52 | 2.75 |
| max | 56 | 7.67 |

### Compare Higher Effort With Opus

The same release pages report the following configurations under Artificial Analysis's shared method.

| Model and effort | Intelligence Index | Estimated index dollars per task | Terminal pass rate | Estimated terminal dollars per task |
| --- | ---: | ---: | ---: | ---: |
| Sonnet high | 46.75 | 1.12 | 43.94% | 3.06 |
| Sonnet xhigh | 51.90 | 2.75 | 57.07% | 8.87 |
| Sonnet max | 56.00 | 7.67 | 63.64% | 18.76 |
| Opus medium | 51.24 | 1.34 | 52.53% | 4.04 |
| Opus high | 53.58 | 1.82 | 56.57% | 5.12 |
| Opus xhigh | 55.99 | 3.46 | 59.60% | 8.78 |
| Opus max | 57.62 | 5.98 | 59.60% | 13.11 |

Opus high exceeds Sonnet xhigh's composite score at about 34% lower estimated cost.
Their terminal pass rates differ by 0.51 percentage points, without a paired significance result.
Opus medium costs about half as much as Sonnet xhigh, with lower composite and terminal scores.
Sonnet max exceeds every reviewed Opus setting on terminal pass rate, although its estimated terminal cost is higher.
These comparisons support testing an Opus delegate before Sonnet's highest efforts when model substitution is allowed.
They do not support prohibiting Sonnet xhigh or max across workloads.
Leave Astra and Fable outside automatic promotion because their use requires an explicit user request.
Luna's measured gains through max keep that setting valid when its required quality and cost fit the task.

The [September 28 release article](https://artificialanalysis.ai/articles/claude-sonnet-5-5) reports about 0.1% fallback, mainly on Terminal-Bench.
Those fallback calls went to Sonnet 5.
The authors encountered a prerelease structured-output bug, report a fix before public release, and planned reruns.
Its max cost of $7.60 differs from the live $7.67 estimate above.
Keep each dated measurement with its source.

### Practitioner Runs And A Long Kernel Task

[Claude Subagent Router's study](https://github.com/stas4000/claude-subagent-router/blob/main/README.md) covers 72 runs.
It uses three tasks, three models, four effort levels, and two repeats, giving Sonnet six runs per setting.
The author reports hidden-test totals of 39/40 at medium and 40/40 at high, xhigh, and max.
The denominator's relationship to the six runs is unclear, and the author omits raw graders and harness details.
Reported output tokens per task are 1.2K, 2K, 3.1K, and 23K in that order.
Output-only cost calculations omit input and cache costs.

The [Kernelbench annotation](https://github.com/Infatoshi/kernelbench.com/blob/master/benchmarks/mega/results/annotations/20260928_122208_claude_claude-sonnet-5-5_02_kimi_linear_decode.yaml) records one no-fallback max run.
The author reports 358 minutes, 1,174,141 output tokens, 389 turns, and $56.48 estimated cost.
The resulting isolated megakernel passes correctness checks and runs 32.13 times faster than PyTorch.
GPU contention, out-of-memory events, 52 operator skills, and the absence of a lower-effort control limit the comparison.

For the practitioner's small coding sample, test high against medium before increasing output expenditure.
The kernel run establishes one completed long task at max, without evidence that lower effort would fail.

## Claude Opus 5.5

[Artificial Analysis's release comparison](https://artificialanalysis.ai/models/releases/claude-opus-5-5) labels all variants with default fallback.
The terminal columns use its shared mini-swe-agent method.

| Effort | Intelligence Index | Estimated index dollars per task | Terminal pass rate | Estimated terminal dollars per task |
| --- | ---: | ---: | ---: | ---: |
| low | 42.31 | 0.55 | 31.31% | 2.08 |
| medium | 51.24 | 1.34 | 52.53% | 4.04 |
| high | 53.58 | 1.82 | 56.57% | 5.12 |
| xhigh | 55.99 | 3.46 | 59.60% | 8.78 |
| max | 57.62 | 5.98 | 59.60% | 13.11 |

Xhigh and max tie on mean terminal pass rate, while estimated terminal cost rises about 49% at max.
The index still improves, which makes the terminal plateau workload-specific.
The [vendor release](https://www.anthropic.com/claude-opus-5-5) reports xhigh at 66.4% under another benchmark setup.
Keep that result separate from Artificial Analysis's scores.

### Public Generation Logs And Code Review

[Simon Willison's article](https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/) links his exact-model generation logs.
He uses the same SVG-generation prompt with `anthropic/claude-opus-5-5` at five effort settings.
High returns an SVG with 3,366 output tokens in 29.462 seconds.
Max consumes 128,000 thinking tokens, returns no final response, and takes 1,141.552 seconds.
The article reports a second max failure and $2.56 per failed attempt.
The public log contains one max attempt and one call per other setting.
This simple generation task demonstrates output-budget failure without establishing a general coding ranking.

[CodeRabbit's review](https://www.coderabbit.ai/blog/opus-5-5-model-review) evaluates product Standard and Max modes in a mixed pipeline.
Those modes do not identify API effort settings.
On 80 open-source cases, Standard versus Max recall is 51/80 versus 50/80, with precision of 38.6% versus 35.7%.
On 13 hard Signal cases, actionable findings are 8/13 versus 10/13, with precision of 66.7% versus 52%.
The authors omit total cost and time.

Prefer medium or high for Opus, and discourage xhigh or max without comparable-task evidence of required gains.
This default does not establish that higher effort cannot improve reasoning or other workloads.
For SVG generation, check output-budget failures when evaluating max.
Choose review pipeline modes against the desired precision and recall, with API effort recorded apart from those modes.

## Claude Fable 5.1

[Artificial Analysis's release comparison](https://artificialanalysis.ai/models/releases/claude-fable-5-1) labels each effort variant with default fallback.
The terminal columns use the shared 66-task, three-repeat method.

| Effort | Intelligence Index | Estimated index dollars per task | Terminal pass rate | Estimated terminal dollars per task |
| --- | ---: | ---: | ---: | ---: |
| low | 46.816 | 2.371 | 40.40% | 7.324 |
| medium | 48.921 | 2.983 | 44.95% | 9.124 |
| high | 51.152 | 3.913 | 52.02% | 11.640 |
| xhigh | 53.203 | 5.978 | 55.05% | 15.783 |
| max | 53.355 | 7.630 | 52.02% | 19.218 |

Max adds 0.152 index points over xhigh while estimated index cost rises about 28%.
Its terminal pass rate falls by 3.03 percentage points.
Per-level fallback counts and targets remain unknown.

### Host Coding And A Captured Request

[ElectricityBench](https://electricitybench.com/models/claude-code-claude-fable-5-1/) uses Claude Code 2.1.283 at medium.
It reports 14 of 15 real tasks, 87% capability, and a 218-second median duration.
Weekly capability records range from 53% to 87%, with private outputs and changing samples.

[FaultMaven's captured request](https://github.com/FaultMaven/faultmaven/issues/1800#issuecomment-5944320196) compares one call per configuration.
Both calls have an 8,000-token output cap.
Omitted thinking configuration produced 5,463 output tokens, including 1,720 thinking tokens, in 67 seconds.
Low produced 4,124 output tokens, including 893 thinking tokens, in 52 seconds.
The author supplies neither quality grading nor cost for these calls.
Low therefore still permits thinking on this request.

For terminal work, measure whether xhigh's score gain justifies its cost over high.
The captured request supports a latency experiment, but it supplies no acceptance evidence for lowering effort.
