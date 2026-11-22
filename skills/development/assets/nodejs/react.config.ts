import { defineConfig } from "oxlint";

/**
 * Apply to browser product modules with named React imports and explicit integration ownership.
 */
export default defineConfig({
  overrides: [
    {
      files: ["src/product/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: {
        "no-restricted-globals": [
          "deny",
          {
            checkGlobalObject: true,
            globals: [
              {
                message:
                  "Use the owning lifecycle or an approved scheduling adapter.",
                name: "setTimeout"
              },
              {
                message:
                  "Use the owning lifecycle or an approved scheduling adapter.",
                name: "setInterval"
              },
              {
                message:
                  "Use the owning lifecycle or an approved scheduling adapter.",
                name: "requestAnimationFrame"
              },
              {
                message:
                  "Use the owning lifecycle or an approved scheduling adapter.",
                name: "requestIdleCallback"
              }
            ]
          }
        ],
        "no-restricted-imports": [
          "deny",
          {
            paths: [
              {
                importNames: ["useEffect", "default"],
                message:
                  "Use named React imports. Derive values during render, handle actions in event handlers, or use the owning integration API.",
                name: "react"
              }
            ]
          }
        ]
      }
    }
  ]
});
