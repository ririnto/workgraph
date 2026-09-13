import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

/**
 * Extends the shared ultracite Oxlint core configuration with Markdown
 * exclusion.
 */
export default defineConfig({
  extends: [core],
  ignorePatterns: [...(core.ignorePatterns ?? []), "**/*.md"]
});
