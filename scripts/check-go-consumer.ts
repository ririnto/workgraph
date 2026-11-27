import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const asset = path.resolve("skills/development/assets/golang");
const consumer = mkdtempSync(path.join(tmpdir(), "workgraph-go-consumer-"));
const example = path.join(consumer, "example");

/**
 * @param args Go subcommand and arguments.
 * @param status Expected process exit.
 * @returns Captured stdout.
 */
const run = (args: string[], status = 0): string => {
  const result = spawnSync("go", args, {
    cwd: consumer,
    encoding: "utf-8",
    env: { ...process.env, GOWORK: "off" }
  });
  assert.ifError(result.error);
  assert.equal(result.status, status, result.stdout + result.stderr);
  return result.stdout;
};

try {
  cpSync(asset, consumer, { recursive: true });
  const report = path.join(consumer, "lint.json");
  const args = [
    "tool",
    "golangci-lint",
    "run",
    "--config",
    ".golangci.yaml",
    `--output.json.path=${report}`,
    "--output.text.path=",
    "./example/..."
  ];
  run(args);
  const fixture = path.join(example, "fixture.go");
  const source =
    "package status\n\nfunc obsolete() int { return 0 }\n\nfunc Probe() int {\n\t// Temporary workaround.\n\treturn 1\n}\n";
  writeFileSync(fixture, source);
  run(args, 1);
  assert.partialDeepStrictEqual(JSON.parse(readFileSync(report, "utf-8")), {
    Issues: [
      {
        FromLinter: "comments",
        Text: "Remove dead code and workaround notes. Fix the underlying code or document the contract at its declaration."
      },
      { FromLinter: "unused", Text: "func obsolete is unused" }
    ]
  });
  assert.equal(readFileSync(fixture, "utf-8"), source);
  const script = path.join(example, "fixture.sh");
  const shell = '#!/bin/sh\nif true; then\n  printf "%s\\n" ok\nfi\n';
  writeFileSync(script, shell);
  const format = ["tool", "shfmt", "-i", "2", "-d", "example/fixture.sh"];
  assert.equal(run(format), "");
  assert.equal(readFileSync(script, "utf-8"), shell);
  const misindented = shell.replace("  printf", "    printf");
  writeFileSync(script, misindented);
  run(format, 1);
  assert.equal(readFileSync(script, "utf-8"), misindented);
  process.stdout.write(
    "The copied Go sample ran its declared custom linter and formatter without changing source.\n"
  );
} finally {
  rmSync(consumer, { recursive: true });
}
