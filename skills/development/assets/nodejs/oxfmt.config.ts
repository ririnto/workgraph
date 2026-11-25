import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

/**
 * Use the preset's formatting with the example's trailing-comma convention.
 */
export default defineConfig({
  ...ultracite,
  trailingComma: "none"
});
