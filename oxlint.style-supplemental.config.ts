import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Provide supplemental style checks without changing the root preset.
 */
export default defineConfig({
  categories: {
    correctness: "off",
    nursery: "off",
    pedantic: "off",
    perf: "off",
    restriction: "off",
    style: "off",
    suspicious: "off"
  },
  env: core.env,
  ignorePatterns: core.ignorePatterns,
  jsPlugins: [
    {
      name: "style-blank-lines",
      specifier: "./plugins/no-blank-lines-in-functions.ts"
    },
    {
      name: "style-inline-comments",
      specifier: "./plugins/no-inline-comments-in-functions.ts"
    }
  ],
  rules: {
    "style-blank-lines/no-blank-lines-in-functions": "deny",
    "style-inline-comments/no-inline-comments-in-functions": "deny"
  }
});
