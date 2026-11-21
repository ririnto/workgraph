import { spawnSync } from "node:child_process";
import path from "node:path";

/**
 * @param {string} command Executable to run.
 * @param {string[]} args Arguments passed without shell expansion.
 * @param {boolean} [capture] Return command stdout.
 * @returns {string} Captured stdout, or an empty string when inherited.
 */
const run = (command, args, capture = false) => {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
    stdio: ["inherit", capture ? "pipe" : "inherit", "inherit"]
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  return result.stdout ?? "";
};

run("git", ["diff", "--cached", "--check"]);
const staged = run(
  "git",
  ["diff", "--cached", "--name-only", "-z", "--no-renames"],
  true
).split("\0");
const checks = [
  "check:issue-forms",
  "check:markdownlint-cli2",
  "check:plugin-version",
  "check:skill-metadata",
  "check:typescript",
  "check:ultracite"
];
const tests = ["test/validation.test.mjs"];
for (const { patterns, check, test } of [
  { patterns: ["**/*.{go,mod,sum}", ".golangci.yaml"], check: "check:go" },
  { patterns: ["**/*.{kt,kts}", ".editorconfig"], check: "check:kotlin" },
  { patterns: [".husky/*", "**/*.sh", ".editorconfig"], check: "check:shell" },
  { patterns: [".github/workflows/*.yaml"], check: "check:workflows" },
  {
    patterns: ["hooks/**", "skills/**", "**/plugin.json"],
    test: "hooks/*.test.mjs"
  },
  {
    patterns: [
      "scripts/skill-metadata.mjs",
      "skills/**",
      "test/skill-metadata.test.mjs"
    ],
    test: "test/skill-metadata.test.mjs"
  },
  {
    patterns: [
      "plugins/**",
      "workflows/**",
      "rules/**",
      "scripts/pre-commit-scope.mjs",
      ".husky/*",
      "*.config.ts",
      ".markdownlint-cli2.jsonc",
      "test/tooling.test.mjs",
      "package.json",
      "pnpm-*.yaml",
      "tsconfig.json"
    ],
    test: "test/tooling.test.mjs"
  }
]) {
  if (
    staged.some((filename) =>
      patterns.some((pattern) => path.matchesGlob(filename, pattern))
    )
  ) {
    if (check !== undefined) {
      checks.push(check);
    }
    if (test !== undefined) {
      tests.push(test);
    }
  }
}
run("pnpm", ["exec", "run-p", ...checks]);
run(process.execPath, ["--test", ...tests]);
