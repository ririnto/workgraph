import { defineConfig } from "oxlint";

/**
 * Check indexed named captures only in the consumer's opted-in sources.
 */
export default defineConfig({
  jsPlugins: ["eslint-plugin-regexp"],
  overrides: [
    {
      files: ["src/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: {
        "regexp/prefer-result-array-groups": "error"
      }
    }
  ]
});
