import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const asset = path.resolve("skills/development/assets/lint/ktlint-comments");
const version = spawnSync("ktlint", ["--version"], { encoding: "utf-8" });
const ktlintVersion = /^ktlint version (?<version>\S+)$/u.exec(
  version.stdout?.trim() ?? ""
)?.groups?.version;
assert.ifError(version.error);
assert.equal(version.status, 0, version.stderr);
assert.ok(
  ktlintVersion !== undefined,
  "Could not identify the consumer ktlint version."
);

const consumer = realpathSync(
  mkdtempSync(path.join(tmpdir(), "workgraph-ktlint-consumer-"))
);
try {
  const module = path.join(consumer, "lint");
  for (const entry of [
    "settings.gradle.kts",
    "build.gradle.kts",
    "gradle",
    "src/main"
  ]) {
    cpSync(path.join(asset, entry), path.join(module, entry), {
      recursive: true
    });
  }
  const build = spawnSync(
    "gradle",
    ["--no-daemon", "-p", module, `-PktlintVersion=${ktlintVersion}`, "jar"],
    { stdio: "inherit" }
  );
  assert.ifError(build.error);
  assert.equal(build.status, 0, "The copied consumer ruleset did not build.");
  cpSync(path.join(asset, "src/test/fixtures"), consumer, { recursive: true });
  writeFileSync(
    path.join(consumer, ".editorconfig"),
    `root = true\n\n[*.kt]\nktlint_standard = disabled\n\n${readFileSync(path.join(asset, "../kotlin.editorconfig"), "utf-8")}`
  );
  const jar = path.join(module, "build/libs/workgraph-ktlint-comments.jar");
  const unregistered = spawnSync("ktlint", ["--reporter=json", "Matching.kt"], {
    cwd: consumer,
    encoding: "utf-8"
  });
  assert.ifError(unregistered.error);
  assert.equal(unregistered.status, 0, unregistered.stderr);
  assert.deepEqual(JSON.parse(unregistered.stdout), []);
  const registered = spawnSync(
    "ktlint",
    ["--reporter=json", `--ruleset=${jar}`, "Matching.kt", "Preserved.kt"],
    { cwd: consumer, encoding: "utf-8" }
  );
  assert.ifError(registered.error);
  assert.equal(registered.status, 1, registered.stderr);
  const message =
    "Remove dead code and workaround notes. Fix the underlying code or document the contract at its declaration.";
  assert.deepEqual(JSON.parse(registered.stdout), [
    {
      file: path.join(consumer, "Matching.kt"),
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
} finally {
  rmSync(consumer, { recursive: true });
}
