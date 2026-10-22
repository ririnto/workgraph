import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Isolate this supplemental rule while the root pass keeps the full core preset.
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
  jsPlugins: ["./plugins/no-inline-comments-in-functions.ts"],
  rules: { "style/no-inline-comments-in-functions": "deny" }
});
