import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const assets = path.resolve("skills/development/assets");
const consumer = mkdtempSync(path.join(tmpdir(), "workgraph-node-consumer-"));

/**
 * @param {string[]} args pnpm arguments.
 * @param {number} [status] Expected process exit.
 * @returns {string} Standard output.
 */
const run = (args, status = 0) => {
  const result = spawnSync("pnpm", args, {
    cwd: consumer,
    encoding: "utf-8",
    timeout: 120_000
  });
  assert.ifError(result.error);
  assert.equal(result.status, status, result.stdout + result.stderr);
  return result.stdout;
};

try {
  for (const entry of [
    "oxfmt.config.ts",
    "oxlint.config.ts",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "rules",
    "src",
    "tsconfig.json"
  ]) {
    cpSync(path.join(assets, "nodejs", entry), path.join(consumer, entry), {
      recursive: true
    });
  }
  run(["install", "--frozen-lockfile"]);
  const caller = path.join(consumer, "src/use-task.ts");
  const dependency = path.join(consumer, "src/task.ts");
  const call =
    'import { readCount } from "./task.js";\n\nexport const check = (): void => {\n  readCount();\n};\n';
  writeFileSync(caller, call);
  writeFileSync(dependency, "export const readCount = (): number => 1;\n");
  run(["run", "check"]);
  run(["run", "check:typescript"]);
  const asynchronous =
    "export const readCount = async (): Promise<number> => {\n  const count = await Promise.resolve(1);\n  return count + 1;\n};\n";
  writeFileSync(dependency, asynchronous);
  const lint = run(["run", "check", "--format", "json"], 1);
  const start = lint.search(/\{\s*"diagnostics"\s*:/u);
  assert.notEqual(start, -1, lint);
  assert.partialDeepStrictEqual(
    JSON.parse(lint.slice(start, lint.lastIndexOf("}") + 1)),
    {
      diagnostics: [
        {
          code: "typescript(no-floating-promises)",
          filename: "src/use-task.ts"
        }
      ]
    }
  );
  assert.equal(readFileSync(caller, "utf-8"), call);
  assert.equal(readFileSync(dependency, "utf-8"), asynchronous);
  cpSync(
    path.join(assets, "typescript/tsconfig.json"),
    path.join(consumer, "tsconfig.json")
  );
  const hidden = path.join(consumer, ".hidden");
  mkdirSync(hidden);
  const outside = path.join(hidden, ".entry.ts");
  const mistyped = "export const marker: string = 1;\n";
  writeFileSync(outside, mistyped);
  assert.equal(
    run(["run", "check:typescript", "--pretty", "false"], 1).trim(),
    ".hidden/.entry.ts(1,14): error TS2322: Type 'number' is not assignable to type 'string'."
  );
  assert.equal(readFileSync(outside, "utf-8"), mistyped);
  process.stdout.write(
    "The copied Node sample checked its project graph and the TypeScript preset included hidden source.\n"
  );
} finally {
  rmSync(consumer, { recursive: true });
}
