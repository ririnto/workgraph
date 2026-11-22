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
 * @param {string} command Executable to run.
 * @param {string[]} args Command arguments.
 * @param {string} cwd Directory for tool discovery.
 * @param {number} [status] Expected process exit.
 * @returns {string} Standard output.
 */
const run = (command, args, cwd, status = 0) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, GOWORK: "off" }
  });
  assert.ifError(result.error);
  assert.equal(result.status, status, result.stdout + result.stderr);
  return result.stdout;
};

try {
  for (const entry of [
    ".custom-gcl.yml",
    ".golangci.yaml",
    "comments.go",
    "go.mod",
    "go.sum",
    "example"
  ]) {
    cpSync(path.join(asset, entry), path.join(consumer, entry), {
      recursive: true
    });
  }
  run(
    "go",
    ["tool", "-modfile=example/tools/go.mod", "golangci-lint", "custom"],
    consumer
  );
  const command = path.join(consumer, "custom-gcl");
  const report = path.join(consumer, "lint.json");
  const args = [
    "run",
    "--config",
    "../.golangci.yaml",
    `--output.json.path=${report}`,
    "--output.text.path=",
    "./..."
  ];
  run(command, args, example);
  const fixture = path.join(example, "fixture.go");
  const source =
    "package status\n\nfunc Probe() int {\n\t// Temporary workaround.\n\treturn 1\n}\n";
  writeFileSync(fixture, source);
  run(command, args, example, 1);
  assert.partialDeepStrictEqual(JSON.parse(readFileSync(report, "utf-8")), {
    Issues: [
      {
        FromLinter: "comments",
        Text: "Remove dead code and workaround notes. Fix the underlying code or document the contract at its declaration."
      }
    ]
  });
  assert.equal(readFileSync(fixture, "utf-8"), source);
  const script = path.join(example, "fixture.sh");
  const shell = '#!/bin/sh\nif true; then\n  printf "%s\\n" ok\nfi\n';
  writeFileSync(script, shell);
  assert.equal(
    run(
      "go",
      ["tool", "-modfile=tools/go.mod", "shfmt", "-i", "2", "-d", "fixture.sh"],
      example
    ),
    ""
  );
  assert.equal(readFileSync(script, "utf-8"), shell);
  process.stdout.write(
    "The copied Go sample ran its declared custom linter and formatter without changing source.\n"
  );
} finally {
  rmSync(consumer, { recursive: true });
}
