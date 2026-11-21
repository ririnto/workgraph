import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Extend the official preset with local lint rules.
 */
export default defineConfig({
  env: core.env,
  extends: [core],
  ignorePatterns: [...(core.ignorePatterns ?? []), "workflows/*.js"],
  jsPlugins: [
    "./plugins/tsdoc-plugin.ts",
    "./skills/development/assets/lint/function-comments.ts"
  ],
  options: { typeAware: true },
  overrides: [
    {
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: {
        "function-comments/no-function-body-line-comments": "deny"
      }
    }
  ],
  rules: {
    "tsdoc/require-export-tsdoc": "deny"
  }
});
