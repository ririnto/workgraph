import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Run the blank-line rule without repeating diagnostics from the root core pass.
 */
export default defineConfig({
  env: core.env,
  ignorePatterns: core.ignorePatterns,
  jsPlugins: ["./plugins/no-blank-lines-in-functions.ts"],
  rules: { "style/no-blank-lines-in-functions": "deny" }
});
