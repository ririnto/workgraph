import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

/**
 * Preserve Ultracite ignores, Markdown exclusion, and the trailing-comma ban.
 */
export default defineConfig({
  ...ultracite,
  ignorePatterns: [...(ultracite.ignorePatterns ?? []), "**/*.md"],
  trailingComma: "none"
});
