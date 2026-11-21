# Lint rule guidance

For authorized lint setup, select tools compatible with the project's language, runtime, and requirements.

When lint automation is authorized, prefer built-in rules and supported configuration before custom rules.
Add a custom rule only for a demonstrated recurring failure that existing tools cannot prevent.
Verify tool-version support and realistic exceptions before adding it.
Scope rules through existing file or module boundaries when those boundaries carry the requirement.
Make rules AST-aware and preserve literals, comments, and automatic semicolon insertion where applicable.

## Adopt a lint asset

Treat each Workgraph lint asset as a template owned by the project that adopts it.
Copy the [function-body comment rule](../assets/lint/function-comments.ts) into the consuming repository, such as `lint/function-comments.ts`, and retain the [MIT license notice](../../../LICENSE) with the copy.
Commit the copy and register it by a path relative to the consuming project's Oxlint config.
Keep Workgraph URLs, package references, and shared filesystem paths out of lint configuration and dependencies.
Update the committed copy through that project's normal review process.

Use the project's local Oxlint and Ultracite tooling, with `@oxlint/plugins` as a development dependency for type checking the template.
The following example shows the configuration for a project that already uses the Ultracite core preset.
In an existing config, add the local plugin and the applicable file overrides alongside the project's presets, plugins, rules, and ignores.

```ts
import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

export default defineConfig({
  env: core.env,
  extends: [core],
  jsPlugins: ["./lint/function-comments.ts"],
  overrides: [
    {
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: {
        "workgraph-comments/no-function-body-line-comments": "deny"
      }
    }
  ]
});
```

Use the file matching and examples for [JavaScript](lint-javascript.md) and [TypeScript](lint-typescript.md).
Run the consuming project's normal lint command against the copied asset with both matching and non-matching examples.
Keep the project's formatter and existing checks enabled.

## Keep context-dependent guidance in prose

Choose API and module boundaries that make recurring mistakes hard to express.
Apply restrictions on React effects, browser timers, and Electron process imports where the project defines the corresponding lifecycle or process boundaries.
Workgraph has no React or Electron application boundaries.
Review whether an explanation describes a contract or merely justifies a workaround.
Use runtime checks, property tests, or formal verification when the risk requires evidence that source lint cannot provide.

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
