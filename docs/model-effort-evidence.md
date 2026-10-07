# Model Effort Evidence

## Scope

This record compares public evidence for seven exact models.
No local test establishes model quality.
The multi-task effort comparisons supply the main evidence.
The smaller workload studies supply supporting evidence and limits.
These results describe the authors' tasks, harnesses, and settings.
Use their methods and limits when choosing comparable local experiments.
Read [the research notes](research.md#model-effort-and-cost) for supported controls, official defaults, host settings, and pricing.
The selection implications below are workload-specific judgments.
Local behavior checks do not establish universal model-effort rankings.

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

Max adds three rounded index points over xhigh at about 61% more estimated cost, using unrounded source prices.
Its median first-answer latency is 132.77 seconds, versus xhigh at 22.23 seconds.
These latency measurements describe answer arrival, rather than task completion time.
The none variant scores 18 at $0.01 per task, so measured cost does not rise at every effort transition.

### Coding Effort Comparisons

The same release comparison publishes separate coding-component results.
These terminal cost estimates differ from the composite index costs above.

| Effort | Terminal-Bench 4.0 pass rate | SciCode pass rate | Estimated terminal dollars per task |
| --- | ---: | ---: | ---: |
| low | 0.00% | 46.88% | 0.00545 |
| medium | 2.53% | 50.93% | 0.07157 |
| high | 4.55% | 50.35% | 0.12040 |
| xhigh | 8.08% | 51.74% | 0.19818 |
| max | 12.63% | 54.63% | 0.23621 |

Max improves both scores over xhigh, while estimated terminal cost rises about 19%.
SciCode's high score falls below medium, so the component gains are not monotonic across all settings.
The [methodology](https://artificialanalysis.ai/methodology/intelligence-benchmarking) uses 288 SciCode subproblems with three repeats and a 300-second executor timeout.
These terminal and scientific Python tasks do not measure general repository review or refactoring.
The release page supplies no paired outcomes or Luna-specific terminal confidence intervals.

### Repository Coding Suite

[AI Coding Daily's Luna comparison](https://aicodingdaily.com/model/gpt-6-luna) reports an 80-point coding suite using Codex CLI.
The suite includes Laravel, React TypeScript, bug finding, PHP import and synchronization, Flutter bank feeds, and Go shipping quotes.

| Setting | Total points out of 80 | Average API dollars per prompt | Average seconds per prompt |
| --- | ---: | ---: | ---: |
| Luna medium | 43.74 | 0.01 | 133 |
| Luna high | 53.04 | 0.01 | 231 |
| Luna xhigh | 56.40 | 0.03 | 608 |
| Luna max | 59.07 | 0.03 | 663 |
| Sonnet medium | 60.54 | 0.20 | 58 |
| Sol medium | 67.09 | 0.14 | 233 |
| Sol high | 68.10 | 0.22 | 446 |

Luna max approaches Sonnet medium's total score on this suite, with lower estimated cost and longer runtime.
Sonnet uses Claude Code, while Luna and Sol use Codex CLI.
These results describe model-and-harness configurations rather than isolated model performance.
The [linked methodology](https://aicodingdaily.com/article/llm-coding-leaderboard-my-methodology-and-scoring-formulas) describes an older 40-point suite and five attempts per behavior project.
It does not document repeat and scoring details for the added React and bug-finding components.
The component scores do not all rise with effort, and rounded costs conceal smaller differences.
This suite supports Luna xhigh and max for coding without establishing equivalent performance across workloads.

### Diagram Generation And Coding

[GitDiagram's rollout record](https://github.com/ahmedkhaleel2004/gitdiagram/blob/main/docs/gpt-6-luna-rollout.md) compares two deployment configurations.
The initial eight medium calls reused four old fixtures, producing seven valid outputs and six recoveries.
Their median duration was 39.98 seconds.
The final low and Fast configuration used eight fresh calls across four repositories.
It produced eight valid outputs with no recoveries and a median duration of 6.97 seconds.
Complete cold calls cost $0.004764, excluding cancellations and repairs.
Changed fixtures and service tiers prevent an isolated low-versus-medium conclusion.
The final comparison also changes the model from GPT-5.6 Luna medium to GPT-6 Luna low with Fast mode.
Structural graph validity does not establish dependency accuracy.

[ElectricityBench's week 40 record](https://electricitybench.com/models/codex-cli-gpt-6-luna/) uses Codex CLI 0.157.1 at medium.
It reports 11 of 15 real coding tasks, 57% capability, and a 64-second median duration.
The capability score differs from the real-task pass fraction.
The authors keep outputs private, and earlier GPT-5.6 results concern another release.
The [real-world suite](https://electricitybench.com/suites/real-world@v3/) uses one repeat and reports two of five hardest tasks solved.
It supplies no controlled high, xhigh, or max comparison.

For bounded diagram generation, evaluate the complete deployment configuration with fresh fixtures and recovery costs.
Use Luna xhigh for coding and max for harder coding tasks.

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

Use Sol medium for ordinary development and high for complex debugging, algorithms, and architecture.

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

Use Astra medium for difficult terminal repairs and xhigh for harder tasks.
The reported max setting increases time and cost without improving its mean pass rate over high.

## Claude Haiku 5.5

Anthropic's [effort guide](https://platform.claude.com/docs/en/build-with-claude/effort) lists `low`, `medium`, `high`, `xhigh`, and `max`, with `medium` as the API default.
The guide specifies `output_config.effort` for API requests and says disabled thinking is valid only through `high`.
Claude Code supports the same five levels at `medium` by default and does not allow thinking to be disabled for this model.
Its [model configuration](https://code.claude.com/docs/en/model-config) requires Claude Code 2.1.293 or later and identifies the API model as `claude-haiku-5-5`.
The model has a 1M token context window, up to 128K output tokens, and API availability on the listed Claude and cloud platforms.
The [Haiku 5.5 prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5) recommends evaluating effort on the target task and warns that multi-turn `xhigh` responses may occasionally have no visible text.

### Coding Effort Comparisons

We read the supplied [October 7 system card](https://www.anthropic.com/document/claude-haiku-5-5-system-card), including every capability effort curve in Section 8.
Pages 112–114 report Cognition's FrontierCode comparison in Claude Code.
Main contains 100 harder tasks, while Extended contains all 150 tasks.
Each result averages five runs per task and combines functional blockers with code-quality rubric criteria.
The grading penalizes changes outside the task's scope.

The figures label effort levels but omit most exact scores and all Haiku dollar costs.
Values marked `~` below are rounded visual estimates, rather than recovered raw measurements.
Main's xhigh and max scores, and Extended's max score, are explicitly reported in the text or summary table.

| Effort | FrontierCode Main | FrontierCode Extended | Estimated output tokens per task |
| --- | ---: | ---: | ---: |
| low | ~35% | ~48% | ~24K |
| medium | ~42% | ~55% | ~36K |
| high | ~42% | ~56% | ~55K |
| xhigh | 45.8% | ~58% | ~100K |
| max | 46.4% | 58.4% | ~180K |

Medium and high have similar Main scores, while xhigh supplies the larger next gain.
Max adds 0.6 percentage points over xhigh on Main with about 80% more output tokens, estimated from the plot.
The result files supply no uncertainty intervals, so that difference does not establish statistical significance.
Output counts do not establish complete request cost, especially across Haiku's prompt-length pricing boundary.
These coding tasks do not separately measure debugging, refactoring, or code review.

Use Haiku xhigh for coding, max for harder tasks, and medium for small code changes.
The debugging, refactoring, and review recommendations extend the coding comparison as workload judgments.
Complex or broad coding can still require Sonnet or Opus.

### Research And Computer-Use Effort Sweeps

Pages 118–123 report the following labeled Haiku scores across all five effort levels.
HLE reports accuracy, DRACO reports normalized rubric scores, and WANDR reports soft F1.
These metrics describe different tasks and cannot be averaged into one effort ranking.

| Evaluation | low | medium | high | xhigh | max |
| --- | ---: | ---: | ---: | ---: | ---: |
| HLE with tools | 38.6% | 45.0% | 50.1% | 54.8% | 57.4% |
| HLE without tools | 30.9% | 35.5% | 39.7% | 44.1% | 45.9% |
| DRACO | 64.3% | 72.4% | 77.8% | 80.5% | 81.5% |
| WANDR | 3.5% | 12.9% | 37.3% | 45.9% | 49.9% |

HLE uses 2,500 questions, a 980K task-token budget, and no context compaction.
Its tool variant includes search, fetch, code execution, and contamination screening.
DRACO uses 100 tasks and five grading runs per response with an Opus judge instead of the paper's original judge.
WANDR uses 500 tasks, a frozen search index, modified prompts, and a different judge from Perplexity's setup.
The modified research harnesses prevent direct comparison with the original benchmark headlines.
Their Haiku costs use recorded token usage and omit web-search fees.
Their Sonnet and Opus costs assume perfect cache hits, which limits cross-model cost comparisons.

Pages 127–130 cover OSWorld's 82 offline tasks, with five attempts per task and a 500-action limit.
Its partial score measures checkpoint credit, while strict pass requires every checkpoint.
The caption orders effort points from low to max, but the graphs omit exact point labels.
The table retains rounded visual estimates and the explicitly reported max endpoints.

| Effort | Partial score | Strict pass rate | Estimated dollars per task |
| --- | ---: | ---: | ---: |
| low | ~42% | ~13% | ~0.07 |
| medium | ~53% | ~21% | ~0.13 |
| high | ~61% | ~27% | ~0.18 |
| xhigh | ~68% | ~31% | ~0.28 |
| max | 72.4% | 37.1% | ~0.61 |

The offline setup and two distinct success metrics limit transfer to other computer-use tasks.
Higher effort improves these reported means without establishing gains for simple extraction or every agentic task.

### Visual And Professional Work

We inspected Chartography's tool and no-tool curves on pages 124–125 and BenchCAD's curves on pages 126–127.
The plots show individual points without effort labels or exact lower-effort values.
We retain their observed trends and reported endpoints instead of inventing precise per-effort measurements.
Chartography's no-tool curve is not monotonic at its lowest-cost points.
Its max scores are 46.4% without tools and 86.2% with tools.
BenchCAD's Vision2Code curves improve with additional compute, reaching 0.670 voxel IoU without tools and 0.870 with tools at max.
Chartography uses 100 tasks, while BenchCAD uses a random 1,000-file subset.
Both average five runs and show 95% confidence intervals.
Their costs include actual cache reads and writes, per-request Haiku prompt-length pricing, and updated Sonnet cache prices.

Page 131 reports two effort settings for Artificial Analysis's independent professional-work evaluations.
It does not supply a complete numerical five-level sweep.

| Evaluation | medium Elo | max Elo | Output-token comparison |
| --- | ---: | ---: | --- |
| GDPval-AA v2.1 | 1277 | 1620 | Medium uses about one tenth of max's output tokens. |
| AA-Briefcase v1.1 | 1372 | 1578 | Medium uses less than one quarter of max's output tokens. |

GDPval-AA covers 220 tasks across 44 occupations and uses blind pairwise judging.
AA-Briefcase covers linked project tasks and combines rubric and pairwise grading.
The higher professional-work scores at max come with substantially more output tokens.
The launch-only GDPval and Terminal-Bench graph points remain unextracted and do not determine the coding recommendation.

### Healthcare Effort And Latency

Pages 132–134 report these five-level results.
HealthBench scores below are length-adjusted, while PhysicianBench reports attempt pass rates.
These measurements describe benchmark behavior and do not recommend medical decisions or model deployment.

| Evaluation | low | medium | high | xhigh | max |
| --- | ---: | ---: | ---: | ---: | ---: |
| HealthBench | 59.9% | 60.2% | 60.3% | 61.1% | 61.6% |
| HealthBench Professional | 57.9% | 59.9% | 61.3% | 61.0% | 64.8% |
| PhysicianBench | 17.8% | 25.2% | 31.6% | 35.8% | 43.0% |

HealthBench uses one run below max and five at max, with runs on different days.
HealthBench Professional uses five runs per level and reports high and xhigh as indistinguishable.
Its max response time is about 110 seconds, compared with 8–21 seconds below max.
PhysicianBench uses 100 tasks and five attempts per task at each level.
Its high-to-xhigh confidence interval reaches zero, while its xhigh-to-max comparison uses runs three days apart.
Its median model time rises from 48 seconds at low to about 11 minutes at max, excluding tools and judging.
These results show workload-dependent plateaus and time costs, rather than a universal high-effort advantage.

### Single-Setting Coding Results And Scope

Pages 111–117 also report coding evaluations that lack a lower-effort control.
Terminal-Bench 4.0 scores 39.2% at max in Claude Code's bare mode, with 66 tasks and ten trials per task.
Its standard error is 1.9 percentage points, treating trials as independent.
Haiku ran without internet egress or a fallback model, and safeguard interventions failed 1.8% of trials.
Terminal-Bench-Science scores 20.6% at max under the same host and network restrictions.
FrontierSWE scores 43.8% at max across 34 tasks with five trials and a 20-hour task budget in Proximal's harness.
ProgramBench reports 82.0% hidden-test passes on 166 filtered tasks in mini-swe-agent without its upstream six-hour limit.
The summary's standard Haiku configuration is adaptive thinking at max unless a section states another setting.
None of these single-setting results proves that lower effort would fail.

The inspected [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models), [AI Coding Daily effort comparison](https://aicodingdaily.com/compare/effort-levels), and [DeepSWE artifact](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json) contained no additional Haiku 5.5 effort sweep.
That inspection does not establish that no other public sweep exists.
The supplied model overview confirms defaults and limits, while the supplied app system prompt describes product behavior rather than benchmark performance.
Both remain reference material rather than consumer instructions.

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
Use Sonnet medium for routine coding and high for harder coding or reasoning.
They do not support prohibiting Sonnet xhigh or max across workloads.
Leave Astra and Fable outside automatic promotion because their use requires an explicit user request.
Use Luna max for harder coding tasks.

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

Use Opus medium for complex coding and reasoning, or high for harder tasks.
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

Use Fable high for long work and xhigh for difficult terminal tasks.
Use max for the hardest reasoning.
The captured request supports a latency experiment, but it supplies no acceptance evidence for lowering effort.
