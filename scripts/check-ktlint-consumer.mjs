import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const kotlin = path.resolve("skills/development/assets/kotlin");
const fixtures = path.resolve("test/fixtures/ktlint");
const consumer = realpathSync(
  mkdtempSync(path.join(tmpdir(), "workgraph-ktlint-consumer-"))
);
const module = path.join(consumer, "lint");
const wrapper = path.join(module, "gradlew");
const gradleArgs = ["--no-daemon", "--console=plain"];
const checkTask = "ktlintMainSourceSetCheck";
const report = path.join(
  consumer,
  "build/reports/ktlint",
  checkTask,
  `${checkTask}.json`
);

/**
 * @param {string[]} args Gradle arguments.
 * @param {number} status Expected Gradle exit status.
 */
const run = (args, status) => {
  const result = spawnSync(wrapper, [...gradleArgs, ...args], {
    cwd: consumer,
    encoding: "utf-8"
  });
  assert.ifError(result.error);
  assert.equal(result.status, status, result.stdout + result.stderr);
};

try {
  mkdirSync(module);
  for (const entry of [
    "build.gradle.kts",
    "gradle",
    "gradlew",
    "settings.gradle.kts",
    "src/main"
  ]) {
    cpSync(path.join(kotlin, "ktlint", entry), path.join(module, entry), {
      recursive: true
    });
  }
  cpSync(
    path.join(module, "gradle/libs.versions.toml"),
    path.join(consumer, "gradle/libs.versions.toml")
  );
  for (const entry of ["build.gradle.kts", "settings.gradle.kts"]) {
    cpSync(path.join(fixtures, entry), path.join(consumer, entry));
  }
  const sources = path.join(consumer, "src/main/kotlin");
  const cases = ["Matching.kt", "Preserved.kt", "TrailingComma.kt"];
  mkdirSync(sources, { recursive: true });
  for (const file of cases) {
    cpSync(path.join(fixtures, file), path.join(sources, file));
  }
  run(["-p", module, "jar"], 0);
  run([checkTask], 1);
  assert.partialDeepStrictEqual(JSON.parse(readFileSync(report, "utf-8")), [
    {
      file: path.join(sources, "TrailingComma.kt"),
      errors: [{ rule: "standard:trailing-comma-on-declaration-site" }]
    }
  ]);
  cpSync(
    path.join(kotlin, ".editorconfig"),
    path.join(consumer, ".editorconfig")
  );
  run([checkTask], 0);
  assert.deepEqual(JSON.parse(readFileSync(report, "utf-8")), []);
  run([checkTask, "-PuseLocalRules"], 1);
  const message =
    "Remove dead code and workaround notes. Fix the underlying code or document the contract at its declaration.";
  assert.deepEqual(JSON.parse(readFileSync(report, "utf-8")), [
    {
      file: path.join(sources, "Matching.kt"),
      errors: [
        {
          line: 2,
          column: 5,
          message,
          rule: "comments:no-body-comments"
        },
        {
          line: 5,
          column: 9,
          message,
          rule: "comments:no-body-comments"
        }
      ]
    }
  ]);
  for (const file of cases) {
    assert.deepEqual(
      readFileSync(path.join(sources, file)),
      readFileSync(path.join(fixtures, file))
    );
  }
  process.stdout.write(
    "Gradle consumer discovered .editorconfig and the optional ruleset without changing source.\n"
  );
} finally {
  rmSync(consumer, { recursive: true });
}
