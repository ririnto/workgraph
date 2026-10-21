import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Extend the official preset with mandatory Sinon source-style checks.
 */
export default defineConfig({
  env: core.env,
  extends: [core],
  ignorePatterns: core.ignorePatterns,
  jsPlugins: ["./plugins/tsdoc-plugin.ts"],
  rules: {
    "tsdoc/require-export-tsdoc": "deny"
  }
});
