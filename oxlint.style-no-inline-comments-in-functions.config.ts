import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Run the inline-comment rule without repeating diagnostics from the root core pass.
 */
export default defineConfig({
  env: core.env,
  ignorePatterns: core.ignorePatterns,
  jsPlugins: ["./plugins/no-inline-comments-in-functions.ts"],
  rules: { "style/no-inline-comments-in-functions": "deny" }
});
