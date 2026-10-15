import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Extend the official preset with mandatory Sinon source-style checks.
 */
export default defineConfig({
  extends: [core],
  ignorePatterns: core.ignorePatterns,
  jsPlugins: ["./plugins/style-plugin.ts", "./plugins/tsdoc-plugin.ts"],
  rules: {
    "style/no-blank-lines-in-functions": "deny",
    "style/no-inline-comments-in-functions": "deny",
    "tsdoc/require-export-tsdoc": "deny"
  }
});
