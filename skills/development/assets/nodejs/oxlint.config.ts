import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

import comments from "./comments/oxlint.config.ts";
import regexp from "./regexp/oxlint.config.ts";

/**
 * Compose both opt-in groups with the project's Ultracite preset.
 */
export default defineConfig({
  extends: [core, comments, regexp]
});
