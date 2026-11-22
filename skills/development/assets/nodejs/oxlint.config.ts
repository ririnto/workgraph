import { fileURLToPath } from "node:url";

import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Apply source-scoped lint rules with the project's TypeScript graph.
 */
export default defineConfig({
  extends: [core],
  jsPlugins: [
    fileURLToPath(new URL("rules/comments.ts", import.meta.url)),
    "eslint-plugin-regexp"
  ],
  options: { typeAware: true },
  overrides: [
    {
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: { "comments/no-body-comments": "error" }
    },
    {
      files: ["src/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: { "regexp/prefer-result-array-groups": "error" }
    }
  ]
});
