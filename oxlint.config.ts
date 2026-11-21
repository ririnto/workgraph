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
    "./plugins/spacing.ts",
    "./skills/development/assets/lint/comments.ts"
  ],
  options: { typeAware: true },
  overrides: [
    {
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: {
        "comments/no-body-comments": ["error", true]
      }
    },
    {
      files: ["**/*.{js,jsx,mjs,cjs}"],
      rules: {
        "jsdoc/require-param": "deny",
        "jsdoc/require-param-name": "deny",
        "jsdoc/require-param-type": "deny",
        "jsdoc/require-returns": "deny",
        "jsdoc/require-returns-type": "deny"
      }
    }
  ],
  rules: {
    "oxc/no-accumulating-spread": "deny",
    "test-style/no-blank-lines-in-functions": "deny",
    "test-style/sibling-test-spacing": "deny",
    "tsdoc/require-export-tsdoc": "deny",
    "typescript/consistent-type-imports": [
      "error",
      { fixStyle: "separate-type-imports", prefer: "type-imports" }
    ],
    "typescript/no-floating-promises": ["error", { ignoreVoid: false }]
  }
});
