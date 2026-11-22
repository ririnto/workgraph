import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  unlinkSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const kotlin = path.resolve("skills/development/assets/kotlin");
const fixtures = path.resolve("test/fixtures/ktlint");
const consumer = realpathSync(
  mkdtempSync(path.join(tmpdir(), "workgraph-ktlint-consumer-"))
);
const wrapper = path.join(consumer, "gradlew");
const gradleArgs = ["--no-daemon", "--console=plain"];
const checkTask = "ktlintMainSourceSetCheck";
const report = path.join(
  consumer,
  "build/reports/ktlint",
  checkTask,
  `${checkTask}.json`
);

/**
 * @param {number} status Expected Gradle exit status.
 */
const run = (status) => {
  const result = spawnSync(wrapper, [...gradleArgs, "ktlintCheck"], {
    cwd: consumer,
    encoding: "utf-8"
  });
  assert.ifError(result.error);
  assert.equal(result.status, status, result.stdout + result.stderr);
};

try {
  for (const entry of [
    ".editorconfig",
    "build.gradle.kts",
    "buildSrc/build.gradle.kts",
    "buildSrc/settings.gradle.kts",
    "buildSrc/src",
    "gradle",
    "gradlew",
    "settings.gradle.kts",
    "src"
  ]) {
    const target = path.join(consumer, entry);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(path.join(kotlin, entry), target, {
      recursive: true
    });
  }
  const sources = path.join(consumer, "src/main/kotlin");
  cpSync(
    path.join(fixtures, "TrailingComma.kt"),
    path.join(sources, "TrailingComma.kt")
  );
  cpSync(
    path.join(fixtures, "Preserved.kt"),
    path.join(sources, "Preserved.kt")
  );
  run(0);
  assert.deepEqual(JSON.parse(readFileSync(report, "utf-8")), []);
  unlinkSync(path.join(consumer, ".editorconfig"));
  run(1);
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
  cpSync(path.join(fixtures, "Matching.kt"), path.join(sources, "Matching.kt"));
  run(1);
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
  for (const file of ["Matching.kt", "Preserved.kt", "TrailingComma.kt"]) {
    assert.deepEqual(
      readFileSync(path.join(sources, file)),
      readFileSync(path.join(fixtures, file))
    );
  }
  assert.deepEqual(
    readFileSync(path.join(sources, "example/Labels.kt")),
    readFileSync(path.join(kotlin, "src/main/kotlin/example/Labels.kt"))
  );
  process.stdout.write(
    "The copied Gradle sample discovered .editorconfig and its buildSrc ruleset without changing source.\n"
  );
} finally {
  rmSync(consumer, { recursive: true });
}
