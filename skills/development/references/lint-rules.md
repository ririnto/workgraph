# Lint rule guidance

For authorized lint setup, select tools compatible with the project's language, runtime, and requirements.

When lint automation is authorized, prefer built-in rules and supported configuration before custom rules.
Use the Kotlin and Node.js tooling guidance in the matching language references.
For other languages, use their existing standard tools.
Verify tool-version support and edge cases before adding a custom rule.
Make rules AST-aware and preserve literals, comments, and automatic semicolon insertion where applicable.

## Validate lint rules

Provide positive and negative fixtures covering intended matches and cases that must remain unchanged.
Offer automatic fixes only when evaluation, side effects, and program behavior remain unchanged.
Verify formatter idempotence and convergence between rule fixes and formatting.
Stage separately authorized rules on representative source before enabling them across the project.
Start with read-only checks and review their reports before any safe-fix rollout.
Do not add suppressions, disable rules, or weaken checks to make a rollout pass.

If a rule cannot detect violations safely, do not add it.
If only its automatic fix is unsafe, omit the fix and retain only a proven safe diagnostic.
Validate scheduling, control flow, and lifecycle effects before offering automatic fixes that change them.
