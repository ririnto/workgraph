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
const stagedPackage = staged.includes("package.json");
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
  {
    patterns: [
      "**/*.{go,mod,sum}",
      "go.work",
      ".golangci.yaml",
      "skills/development/assets/golang/.golangci.yaml",
      "scripts/check-go-consumer.mjs",
      "scripts/check-go-workspace.mjs"
    ],
    check: "check:go"
  },
  {
    patterns: [
      "**/*.{kt,kts}",
      ".editorconfig",
      "skills/development/assets/gradle/.editorconfig",
      "skills/development/assets/gradle/gradle/libs.versions.toml",
      "skills/development/assets/gradle/gradle/wrapper/**",
      "skills/development/assets/gradle/gradlew",
      "skills/development/assets/gradle/gradlew.bat",
      "skills/development/assets/gradle/buildSrc/src/main/resources/**",
      "scripts/check-ktlint-consumer.mjs"
    ],
    check: "check:kotlin"
  },
  {
    patterns: [
      "skills/development/assets/nodejs/**",
      "skills/development/assets/typescript/tsconfig.json",
      "scripts/check-node-consumer.mjs"
    ],
    check: "check:node-consumer"
  },
  {
    patterns: [
      ".husky/*",
      "**/*.sh",
      ".editorconfig",
      "go.{mod,sum}",
      "scripts/check-shell-policy.mjs"
    ],
    check: "check:shell"
  },
  {
    patterns: [".github/workflows/*.{yaml,yml}", "go.{mod,sum}"],
    check: "check:workflows"
  },
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
      "scripts/check-go-workspace.mjs",
      "scripts/check-shell-policy.mjs",
      ".husky/*",
      "*.config.ts",
      ".markdownlint-cli2.jsonc",
      "test/tooling.test.mjs",
      "package.json",
      "pnpm-*.yaml",
      "skills/development/assets/markdown/.markdownlint-cli2.jsonc",
      "skills/development/assets/markdown/*.{json,yaml}",
      "skills/development/assets/markdown/rules/**/*.ts",
      "skills/development/assets/nodejs/*.{json,ts,yaml}",
      "skills/development/assets/nodejs/plugins/**/*.ts",
      "skills/development/assets/nodejs/src/**",
      "skills/development/assets/nodejs/.dependency-cruiser.json",
      "skills/development/assets/typescript/tsconfig.json",
      "tsconfig.json"
    ],
    test: "test/tooling.test.mjs"
  }
]) {
  if (
    (stagedPackage && check !== undefined) ||
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
