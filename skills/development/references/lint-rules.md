# Lint rule guidance

For authorized lint setup, select tools compatible with the project's language, runtime, and requirements.

When lint automation is authorized, prefer built-in rules and supported configuration before custom rules.
Use the Kotlin and Node.js tooling guidance in the matching language references.
For other languages, use their existing standard tools.
Add a custom rule only for a demonstrated recurring failure that existing tools cannot prevent.
Verify tool-version support and realistic exceptions before adding it.
Scope rules through existing file or module boundaries when those boundaries carry the requirement.
Make rules AST-aware and preserve literals, comments, and automatic semicolon insertion where applicable.

## Validate lint rules

Use small positive and negative fixtures for intended matches and realistic exceptions.
Reuse adopted rule coverage instead of retesting the tool's implementation.
Offer automatic fixes only when evaluation, side effects, and program behavior remain unchanged.
Verify formatter idempotence and convergence between rule fixes and formatting.
Stage separately authorized rules on representative source before enabling them across the project.
Start with read-only checks and review their reports before any safe-fix rollout.
Do not add suppressions, disable rules, or weaken checks to make a rollout pass.

If a rule cannot detect violations safely, do not add it.
If only its automatic fix is unsafe, omit the fix and retain only a proven safe diagnostic.
Validate scheduling, control flow, and lifecycle effects before offering automatic fixes that change them.
