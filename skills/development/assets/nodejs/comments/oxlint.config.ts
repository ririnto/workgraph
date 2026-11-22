import { fileURLToPath } from "node:url";

import { defineConfig } from "oxlint";

/**
 * Enable body-comment diagnostics across JavaScript and TypeScript source.
 */
export default defineConfig({
  jsPlugins: [fileURLToPath(new URL("comments.ts", import.meta.url))],
  overrides: [
    {
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: {
        "comments/no-body-comments": "error"
      }
    }
  ]
});
