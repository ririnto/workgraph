import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Extend the official preset with mandatory TSDoc checks.
 */
export default defineConfig({
  env: core.env,
  extends: [core],
  ignorePatterns: [...(core.ignorePatterns ?? []), "workflows/*.js"],
  jsPlugins: ["./plugins/tsdoc-plugin.ts"],
  rules: {
    "tsdoc/require-export-tsdoc": "deny"
  }
});
