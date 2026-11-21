# Runtime and formal evidence

## Runtime verification

Start from the user's entry point and identify the action and observable result.
Keep a feature map when repeated tests need shared vocabulary.
List the user-visible feature, its access path, required state, and observable outcome.
Update affected entries when behavior changes.

Use the project's reusable driver or CLI to exercise the running feature.
For Chrome-based applications, use the Chrome DevTools Protocol or an existing browser driver to inspect state, console output, network activity, or performance as the case requires.
Use Playwright for browser actions and traces when the project needs a reusable driver.
Reuse testable driver operations across runs.
Keep repeatable setup, commands, and results beside the evidence used in review.
Choose screenshots or recordings for visible behavior and traces for timing, event order, and diagnostics.

## Invariants and generated actions

Use TLA+ with a model checker such as TLC for flows whose correctness depends on state transitions or interleavings.
Record the modeled actors, actions, bounds, invariants, checked properties, and any counterexample.
Use Lean when an algorithm has a precise statement worth proving.
Record the theorem, assumptions, and proof check.
Tie models and proofs to the behavior exercised at the running interface.

Use a statechart when reviewers need to inspect user-visible states, transitions, guards, and failure paths.
Use pstack's `statechart` skill when installed to render user-visible transitions from a TLA+ model.
Check the diagram against the model, TLC results, and the observed flow.
Review the statechart alongside recordings or screenshots when both kinds of evidence answer the acceptance criteria.

Use Bombadil for authorized property-based testing of web or terminal UIs.
Define meaningful properties, give the driver actions that exercise the relevant states, and check them against the intended build.
Keep the specification, initial conditions, run arguments, and failure trace needed to replay a violation.
For browser traces, use Bombadil's `browser test --reproduce` with the original settings and record any divergence.
Record the explored scope and keep deterministic regressions for confirmed failures.

## Release-triggered verification

Before broadening automation, establish that the inner development loop can prevent recurring faults and reproduce behavioral failures.
When release-triggered testing is authorized, use the existing host or CI event for the release and pass the immutable build identifier to runtime checks.
Run authorized exploration against an isolated instance and keep the reports with the checked build.
Route confirmed failures to owned follow-up work with a reproduction and regression evidence.
Open fix requests only within publication authority.
Apply [Main's outcome rules](../../main-agent-contract/SKILL.md#coordinate-outcomes) and [Delivery's integration gates](../../delivery/SKILL.md#establish-merge-authority) before enabling unattended fixes or integration.
Verify the resulting target state through the release or repository's normal interface.
