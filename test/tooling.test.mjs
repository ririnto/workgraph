import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stripVTControlCharacters } from "node:util";

import { lint } from "markdownlint/sync";

import tableSeparators from "../rules/table-separators.ts";

test("Git hooks invoke pnpm directly and propagate its status", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "workgraph-hooks-"));
  try {
    await writeFile(
      path.join(directory, "pnpm"),
      '#!/bin/sh\nprintf "%s\\n" "$@"\nexit "$HOOK_STATUS"\n',
      { mode: 0o755 }
    );
    for (const hook of ["pre-commit", "pre-push"]) {
      for (const status of [0, 17]) {
        const result = spawnSync(
          "sh",
          [
            "-c",
            'PATH=$1; export PATH; . "$2"',
            "sh",
            directory,
            path.resolve(import.meta.dirname, "../.husky", hook)
          ],
          {
            encoding: "utf-8",
            env: { ...process.env, HOOK_STATUS: String(status) }
          }
        );
        assert.ifError(result.error);
        assert.equal(result.status, status, result.stderr);
        assert.equal(result.stdout, `run\n${hook}\n`);
      }
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("Ultracite check and fix entry points preserve diagnostics and formatter convergence", async () => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = await mkdtemp(path.join(tmpdir(), "workgraph-tooling-"));
  try {
    await Promise.all(
      ["package.json", "oxlint.config.ts", "oxfmt.config.ts", "plugins"].map(
        (entry) =>
          cp(path.join(root, entry), path.join(directory, entry), {
            recursive: true
          })
      )
    );
    await symlink(
      path.join(root, "node_modules"),
      path.join(directory, "node_modules")
    );
    await mkdir(path.join(directory, "dist"));
    await writeFile(
      path.join(directory, "dist/ignored.ts"),
      "not valid TypeScript {"
    );
    const markdown = "# Unformatted\n\n|A|B|\n|-|-|\n|1|2|\n";
    await writeFile(path.join(directory, "ignored.md"), markdown);
    await writeFile(
      path.join(directory, "sample.ts"),
      'export const sample = () => {\n// explain\n\nreturn 1;\n};\nconst tripwires = () => {\n  debugger;\n  if (true) {\n    eval("run()");\n  }\n  const unused = 0;\n};\ntripwires();\nconst directiveGap = () => {\n  "use strict";\n\n  return 1;\n};\nconst expression = () => ({\n  first: true,\n\n  second: true\n});\ndirectiveGap();\nexpression();\nconst literal = () => `first\n\nsecond`;\nliteral();\nconst expressionComment = () => String(1 /* ordinary expression comment */);\nconst expressionDirective = () => String(\n  /* c8 ignore next */\n  1\n);\nexpressionComment();\nexpressionDirective();\nconst documented = () => {\n  /** Attached documentation. */\n  const documentedValue = 1;\n  /** Free-standing documentation. */\n  return documentedValue;\n};\ndocumented();\nsetTimeout("run()", 0);\n'
    );
    const command = path.join(root, "node_modules/ultracite/dist/index.js");
    const lintResult = spawnSync(
      process.execPath,
      [command, "check", "sample.ts", "dist/ignored.ts", "--format", "json"],
      {
        cwd: directory,
        encoding: "utf-8",
        timeout: 30_000
      }
    );
    assert.ifError(lintResult.error);
    assert.equal(lintResult.status, 1, lintResult.stderr);
    const start = lintResult.stdout.search(/\{\s*"diagnostics"\s*:/u);
    assert.notEqual(start, -1, lintResult.stdout);
    const diagnostics = JSON.parse(
      lintResult.stdout.slice(start, lintResult.stdout.lastIndexOf("}") + 1)
    ).diagnostics.map(({ code, severity }) => `${code} ${severity}`);
    assert.deepEqual(diagnostics.toSorted(), [
      "eslint(arrow-body-style) error",
      "eslint(no-constant-condition) error",
      "eslint(no-debugger) error",
      "eslint(no-eval) error",
      "eslint(no-implied-eval) error",
      "eslint(no-inline-comments) error",
      "eslint(no-unused-vars) error",
      "tsdoc(require-export-tsdoc) error",
      "unicorn(prefer-module) error"
    ]);
    const reporterEnvironment = {
      ...process.env,
      FORCE_COLOR: "3",
      GITHUB_ACTIONS: "false"
    };
    const configuredCheck = spawnSync("pnpm", ["run", "check:ultracite"], {
      cwd: directory,
      encoding: "utf-8",
      env: reporterEnvironment,
      timeout: 60_000
    });
    assert.ifError(configuredCheck.error);
    const configuredCheckOutput = stripVTControlCharacters(
      `${configuredCheck.stdout}\n${configuredCheck.stderr}`
    );
    assert.equal(configuredCheck.status, 1, configuredCheckOutput);
    assert.deepEqual(
      [
        ...configuredCheckOutput.matchAll(
          /(?:(?<severity>error|warning) |(?<glyph>×|⚠) )(?<code>(?:eslint|tsdoc|unicorn)\([^)]+\))/gu
        )
      ]
        .map(
          ({ groups: { code, glyph, severity } }) =>
            `${code} ${severity ?? (glyph === "×" ? "error" : "warning")}`
        )
        .toSorted(),
      diagnostics.toSorted(),
      configuredCheckOutput
    );
    const valid =
      "/**\n * Expose fixture settings.\n */\nexport const settings = {\n  firstSettingEnabled: true,\n  secondSettingEnabled: true,\n  thirdSettingEnabled: true\n};\n";
    const unformatted =
      "/**\n * Expose fixture settings.\n */\nexport const settings = {\n  firstSettingEnabled: true,\n  secondSettingEnabled: true,\n  thirdSettingEnabled: true,\n};\n";
    await writeFile(
      path.join(directory, "style-only.ts"),
      "/**\n * Preserve this exported declaration.\n */\nexport const styleOnly = () => {\n  // explain\n\n  return 1;\n};\n"
    );
    const configuredFix = spawnSync("pnpm", ["run", "fix:ultracite"], {
      cwd: directory,
      encoding: "utf-8",
      env: reporterEnvironment,
      timeout: 60_000
    });
    assert.ifError(configuredFix.error);
    const configuredFixOutput = stripVTControlCharacters(
      `${configuredFix.stdout}\n${configuredFix.stderr}`
    );
    assert.equal(configuredFix.status, 1, configuredFixOutput);
    assert.deepEqual(
      [
        ...configuredFixOutput.matchAll(
          /(?:(?<severity>error|warning) |(?<glyph>×|⚠) )(?<code>(?:eslint|tsdoc)\([^)]+\))/gu
        )
      ]
        .map(
          ({ groups: { code, glyph, severity } }) =>
            `${code} ${severity ?? (glyph === "×" ? "error" : "warning")}`
        )
        .toSorted(),
      [
        "eslint(no-constant-condition) error",
        "eslint(no-debugger) error",
        "eslint(no-eval) error",
        "eslint(no-implied-eval) error",
        "eslint(no-inline-comments) error",
        "eslint(no-unused-vars) error",
        "tsdoc(require-export-tsdoc) error"
      ].toSorted(),
      configuredFixOutput
    );
    await writeFile(path.join(directory, "sample.ts"), unformatted);
    for (const action of ["fix", "fix", "check"]) {
      const result = spawnSync(
        process.execPath,
        [command, action, "sample.ts", "ignored.md"],
        {
          cwd: directory,
          encoding: "utf-8",
          timeout: 30_000
        }
      );
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stdout + result.stderr);
      assert.equal(
        readFileSync(path.join(directory, "sample.ts"), "utf-8"),
        valid
      );
      assert.equal(
        readFileSync(path.join(directory, "ignored.md"), "utf-8"),
        markdown
      );
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("table separator traversal handles deeply nested blockquotes", () => {
  const quote = "> ".repeat(2000);
  const source = [
    `${quote}| Header | Value |`,
    `${quote}| --- | --- |`,
    `${quote}| one | two |`
  ].join("\n");
  assert.deepEqual(
    lint({
      config: { default: false, "docs/table-separators": true },
      customRules: [tableSeparators],
      strings: { "input.md": source }
    })["input.md"] ?? [],
    []
  );
});

test("table separator diagnostics retain fix information", () => {
  const source = "| Left | Right |\n| -- | ----: |\n| one | two |\n";
  const errors =
    lint({
      config: { default: false, "docs/table-separators": true },
      customRules: [tableSeparators],
      strings: { "input.md": source }
    })["input.md"] ?? [];
  assert.equal(errors.length, 2);
  assert.deepEqual(
    errors.map(({ errorDetail, errorRange, fixInfo, lineNumber }) => ({
      detail: errorDetail,
      fixInfo,
      lineNumber,
      range: errorRange
    })),
    [
      {
        detail: "Separator cell 1 must use exactly ---.",
        fixInfo: { deleteCount: 2, editColumn: 3, insertText: "---" },
        lineNumber: 2,
        range: [3, 2]
      },
      {
        detail: "Separator cell 2 must use exactly ---.",
        fixInfo: { deleteCount: 4, editColumn: 8, insertText: "---" },
        lineNumber: 2,
        range: [8, 4]
      }
    ]
  );
});

test("search-replace covers box drawing in all Markdown with first UTF-16 match and no fix", async () => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = await mkdtemp(
    path.join(tmpdir(), "workgraph-box-drawing-")
  );
  const boxCharacters = Array.from({ length: 128 }, (_, index) =>
    String.fromCodePoint(0x25_00 + index)
  );
  const markdown = `# Fixture\n\n😀 ${boxCharacters.join("")}\r\ntext\u257F\n${boxCharacters.join("\n")}\n\n\`\`\`text\n😀 \u257F\n\`\`\`\n`;
  try {
    await cp(
      path.join(root, ".markdownlint-cli2.jsonc"),
      path.join(directory, ".markdownlint-cli2.jsonc")
    );
    await cp(path.join(root, "rules"), path.join(directory, "rules"), {
      recursive: true
    });
    await symlink(
      path.join(root, "node_modules"),
      path.join(directory, "node_modules")
    );
    await writeFile(path.join(directory, "fixture.md"), markdown);
    const command = path.join(
      root,
      "node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs"
    );
    const result = spawnSync(
      process.execPath,
      [command, "--no-globs", "fixture.md"],
      { cwd: directory, encoding: "utf-8", timeout: 30_000 }
    );
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    const diagnostics = `${result.stdout}${result.stderr}`;
    assert.match(
      diagnostics,
      /fixture\.md:3:4 error search-replace Custom rule \[no-box-drawing:/u
    );
    assert.match(
      diagnostics,
      /fixture\.md:4:5 error search-replace Custom rule \[no-box-drawing:/u
    );
    assert.match(
      diagnostics,
      /fixture\.md:135:4 error search-replace Custom rule \[no-box-drawing:/u
    );
    assert.deepEqual(
      [
        ...diagnostics.matchAll(
          /fixture\.md:(?<line>\d+):\d+ error search-replace Custom rule/gu
        )
      ].map(({ groups }) => Number(groups.line)),
      [3, 4, ...Array.from({ length: 128 }, (_, index) => index + 5), 135]
    );
    const fixed = spawnSync(
      process.execPath,
      [command, "--no-globs", "fixture.md", "--fix"],
      { cwd: directory, encoding: "utf-8", timeout: 30_000 }
    );
    assert.ifError(fixed.error);
    assert.equal(fixed.status, 1, fixed.stdout + fixed.stderr);
    assert.equal(
      readFileSync(path.join(directory, "fixture.md"), "utf-8"),
      markdown
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("TSDoc reports exposed TypeScript members once and excludes documented, private, and JavaScript members", async (t) => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = await mkdtemp(path.join(tmpdir(), "workgraph-tsdoc-"));
  t.after(() => rm(directory, { force: true, recursive: true }));
  await Promise.all(
    ["oxlint.config.ts", "oxfmt.config.ts", "plugins"].map((entry) =>
      cp(path.join(root, entry), path.join(directory, entry), {
        recursive: true
      })
    )
  );
  await symlink(
    path.join(root, "node_modules"),
    path.join(directory, "node_modules")
  );
  await writeFile(
    path.join(directory, "source.ts"),
    `export class Store {
  constructor() {}
  protected read() { return 1; }
  protected status = 1;
  enabled = true;
  /**
   * Expose a documented property.
   */
  documented = true;
  private secret = 1;
  #hidden() { return 1; }
}
const Direct = class {
  run() { return 1; }
};
const Internal = class {
  status = 1;
  /**
   * Expose a documented property.
   */
  documented = true;
};
export { Direct };
export { Internal as Public };
export { Store as Again };
`
  );
  await writeFile(
    path.join(directory, "source.js"),
    "export class JavaScript { read() { return 1; } }\n"
  );
  const result = spawnSync(
    process.execPath,
    [
      path.join(root, "node_modules/ultracite/dist/index.js"),
      "check",
      "source.ts",
      "source.js",
      "--format",
      "json"
    ],
    { cwd: directory, encoding: "utf-8", timeout: 30_000 }
  );
  assert.ifError(result.error);
  assert.equal(result.status, 1, result.stderr);
  const start = result.stdout.search(/\{\s*"diagnostics"\s*:/u);
  assert.notEqual(start, -1, result.stdout);
  assert.deepEqual(
    JSON.parse(result.stdout.slice(start, result.stdout.lastIndexOf("}") + 1))
      .diagnostics.filter(({ code }) => code === "tsdoc(require-export-tsdoc)")
      .map(({ message }) => message)
      .toSorted(),
    [
      'Missing TSDoc for exported public API class "Store".',
      'Missing TSDoc for exported public API export list "Again".',
      'Missing TSDoc for exported public API export list "Direct".',
      'Missing TSDoc for exported public API export list "Public".',
      'Missing TSDoc for exported public API method "constructor".',
      'Missing TSDoc for exported public API method "read".',
      'Missing TSDoc for exported public API method "run".',
      'Missing TSDoc for exported public API property "enabled".',
      'Missing TSDoc for exported public API property "status".',
      'Missing TSDoc for exported public API property "status".'
    ]
  );
});

const compileWorkflowSource = (file) => {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  const source = readFileSync(file, "utf-8").replace(/^export /mu, "");
  return new AsyncFunction(
    "args",
    "agent",
    "parallel",
    "pipeline",
    "phase",
    "log",
    "workflow",
    "budget",
    source
  );
};
const dispatchTable = (table) => (options) => {
  const entry = table[options.phase];
  if (options.phase === "Verify" && entry === undefined) {
    return {
      dispositions: [
        {
          evidence: "Verified against source.",
          id: `review-${options.label.split(":")[1]}-finding-1`,
          status: "confirmed"
        }
      ]
    };
  }
  if (entry === undefined) {
    throw new Error(`unexpected phase ${options.phase}`);
  }
  return entry(options);
};
const sequence = (...payloads) => {
  let served = 0;
  return () => {
    const payload = payloads[Math.min(served, payloads.length - 1)];
    served += 1;
    return payload;
  };
};
const runWorkflowSample = async (file, args, payloadFor) => {
  const calls = [];
  const environment = {
    agent: (prompt, options) => {
      calls.push({
        agentType: options.agentType,
        isolation: options.isolation,
        label: options.label,
        model: options.model,
        modelProvided: Object.hasOwn(options, "model"),
        phase: options.phase,
        prompt
      });
      try {
        const payload = payloadFor(options);
        return payload === null
          ? Promise.reject(new Error("agent failure"))
          : Promise.resolve(payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    budget: { remaining: () => Infinity, spent: () => 0, total: null },
    log: () => null,
    parallel: (thunks) => Promise.all(thunks.map((thunk) => thunk())),
    phase: () => null,
    pipeline: () => {
      throw new Error("pipeline must not run in these samples");
    },
    workflow: () => {
      throw new Error("workflow must not run in these samples");
    }
  };
  const result = await compileWorkflowSource(file)(
    args,
    environment.agent,
    environment.parallel,
    environment.pipeline,
    environment.phase,
    environment.log,
    environment.workflow,
    environment.budget
  );
  return { calls, result };
};

const sampleRoot = path.resolve(import.meta.dirname, "..");
const samplePaths = {
  complex: path.join(sampleRoot, "workflows/delivery-complex.js"),
  simple: path.join(sampleRoot, "workflows/delivery-simple.js")
};
const scopeResult = {
  evidence: "e",
  scopes: [{ description: "d", key: "s1", paths: ["docs"] }]
};
const exploreResult = { evidence: "e", risks: ["r"], summary: "s" };
const singleUnits = {
  evidence: "e",
  units: [{ instructions: "i", key: "u1", paths: ["docs/guide.md"] }]
};
const nestedUnits = {
  evidence: "e",
  units: [
    { instructions: "i", key: "u1", paths: ["docs"] },
    { instructions: "i", key: "u2", paths: ["./docs/guide.md"] }
  ]
};
const absoluteUnits = {
  evidence: "e",
  units: [{ instructions: "i", key: "u1", paths: ["/repository/docs"] }]
};
const escapingUnits = {
  evidence: "e",
  units: [{ instructions: "i", key: "u1", paths: ["docs/../../outside"] }]
};
const splitUnits = {
  evidence: "e",
  units: [
    { instructions: "i", key: "u1", paths: ["docs/guide.md"] },
    { instructions: "i", key: "u2", paths: ["src/main.js"] }
  ]
};
const simpleImplement = {
  branch: "unit-u1",
  changedFiles: ["docs/guide.md"],
  checks: [{ command: "pnpm run check:markdownlint-cli2", status: "passed" }],
  diffSummary: "d",
  evidence: "e",
  startRef: "task-branch"
};
const simpleRepair = { ...simpleImplement, startRef: "task-branch" };
const splitImplement = (options) => {
  const secondUnit = options.label.startsWith("implement:u2");
  const repair = options.label.includes(":fix-");
  return {
    branch: secondUnit ? "unit-u2" : "unit-u1",
    changedFiles: secondUnit ? ["src/main.js"] : ["docs/guide.md"],
    checks: [
      {
        command: repair ? "check-u1-fixed" : `check-u${secondUnit ? 2 : 1}`,
        status: "passed"
      }
    ],
    diffSummary: "d",
    evidence: "e",
    startRef: "task-branch"
  };
};
const wrongStart = (options) => {
  const result = splitImplement(options);
  return options.label.includes(":fix-")
    ? { ...result, startRef: "wrong-ref" }
    : result;
};
const failedRepair = (options) =>
  options.label.includes(":fix-")
    ? {
        ...splitImplement(options),
        branch: "unit-u1-r2",
        checks: [{ command: "check-failed", status: "failed" }]
      }
    : splitImplement(options);
const multiRound = (options) => {
  if (options.label.includes(":fix-1")) {
    return { ...splitImplement(options), branch: "unit-u1-r1" };
  }
  if (options.label.includes(":fix-2")) {
    return { ...splitImplement(options), branch: "unit-u1-r2" };
  }
  return splitImplement(options);
};
const integrateResult = {
  branch: "task-branch",
  changedFiles: ["docs/guide.md", "src/main.js"],
  checks: [{ command: "pnpm run check", status: "passed" }],
  conflicts: [],
  evidence: "e",
  merged: true,
  resources: [
    { branch: "unit-u1", key: "u1", state: "merged" },
    { branch: "unit-u2", key: "u2", state: "merged" }
  ]
};
const integrateSingle = {
  branch: "task-branch",
  changedFiles: ["docs/guide.md"],
  checks: [{ command: "pnpm run check:hooks", status: "passed" }],
  conflicts: [],
  evidence: "e",
  merged: true,
  resources: [{ branch: "unit-u1", key: "u1", state: "merged" }]
};
const integrateFirstRepair = {
  ...integrateResult,
  resources: [
    { branch: "unit-u1-r1", key: "u1", state: "merged" },
    { branch: "unit-u2", key: "u2", state: "merged" }
  ]
};
const integrateSecondRepair = {
  ...integrateResult,
  resources: [
    { branch: "unit-u1-r2", key: "u1", state: "merged" },
    { branch: "unit-u2", key: "u2", state: "merged" }
  ]
};
const sweepResult = { evidence: "e", exposures: [] };
const publishCreated = {
  action: "created",
  evidence: "e",
  url: "https://example.invalid/pr/1"
};
const publishUpdated = {
  action: "updated",
  evidence: "e",
  url: "https://example.invalid/pr/1"
};
const reviewFix = {
  evidence: "e",
  findings: [{ detail: "d", file: "docs/guide.md", scenario: "s" }],
  verdict: "fix-required"
};
const reviewPass = { evidence: "e", findings: [], verdict: "pass" };

test("delivery samples name the integrated candidate in sweep and publication on repair", async () => {
  await Promise.all(
    Object.entries(samplePaths).map(async ([variant, file]) => {
      const candidate = "delivery/accepted-candidate";
      const { calls, result } = await runWorkflowSample(
        file,
        { candidateBranch: candidate, issue: "#1", maxFixRounds: 1, task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: (options) => ({
            ...(variant === "simple"
              ? simpleImplement
              : splitImplement(options)),
            startRef: candidate
          }),
          Integrate: () => ({
            ...(variant === "simple" ? integrateSingle : integrateResult),
            branch: candidate
          }),
          Plan: () => (variant === "simple" ? singleUnits : splitUnits),
          Publish: sequence(publishCreated, publishUpdated),
          Review: sequence(reviewFix, reviewPass),
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, true);
      const integrateCalls = calls.filter((call) => call.phase === "Integrate");
      assert.equal(integrateCalls.length, 2);
      for (const call of integrateCalls) {
        assert.ok(
          call.prompt.includes(
            "as `git diff <destination>...<unit branch>` reports them"
          )
        );
      }
      for (const phase of ["Sweep", "Publish"]) {
        const phaseCalls = calls.filter((call) => call.phase === phase);
        assert.equal(phaseCalls.length, 2);
        for (const call of phaseCalls) {
          assert.ok(call.prompt.includes(`Candidate branch: ${candidate}`));
          assert.ok(
            call.prompt.includes(
              phase === "Sweep"
                ? "Inspect the candidate branch diff against the base branch"
                : "Push and create or update the review request for this exact candidate branch"
            )
          );
        }
      }
    })
  );
});

test("delivery samples reject a passing review with unresolved findings", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const { result } = await runWorkflowSample(
        file,
        {
          candidateBranch: "task-branch",
          issue: "#1",
          maxFixRounds: 0,
          task: "t"
        },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: () => simpleImplement,
          Integrate: () => integrateSingle,
          Plan: () => singleUnits,
          Publish: () => publishCreated,
          Review: () => ({ ...reviewFix, verdict: "pass" }),
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, false);
    })
  );
});

test("delivery samples explain a fix-required review without findings", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const { result } = await runWorkflowSample(
        file,
        {
          candidateBranch: "task-branch",
          issue: "#1",
          maxFixRounds: 0,
          task: "t"
        },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: () => simpleImplement,
          Integrate: () => integrateSingle,
          Plan: () => singleUnits,
          Publish: () => publishCreated,
          Review: () => ({
            evidence: "e",
            findings: [],
            verdict: "fix-required"
          }),
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      const review = result.phaseEvidence.find(
        (record) => record.title === "Review"
      );
      assert.equal(result.complete, false);
      assert.equal(review.status, "failed");
      assert.match(review.reason, /fix-required.*findings/iu);
    })
  );
});

test("delivery workflow samples inherit host models and honor model overrides", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      [
        {},
        { scope: "configured-selector" },
        Object.fromEntries(
          [
            "scope",
            "explore",
            "plan",
            "implement",
            "integrate",
            "sweep",
            "publish",
            "review"
          ].map((phase) => [phase, `custom-${phase}`])
        )
      ].map(async (models) => {
        const { calls } = await runWorkflowSample(
          file,
          { candidateBranch: "task-branch", models, task: "t" },
          dispatchTable({
            Explore: () => exploreResult,
            Implement: () => simpleImplement,
            Integrate: () => integrateSingle,
            Plan: () => singleUnits,
            Publish: () => publishCreated,
            Review: () => reviewPass,
            Scope: () => scopeResult,
            Sweep: () => sweepResult
          })
        );
        assert.deepEqual(
          Object.fromEntries(calls.map((call) => [call.phase, call.model])),
          {
            Explore: models.explore,
            Implement: models.implement,
            Integrate: models.integrate,
            Plan: models.plan,
            Publish: models.publish,
            Review: models.review,
            Scope: models.scope,
            Sweep: models.sweep
          }
        );
        for (const call of calls) {
          assert.equal(call.modelProvided, call.model !== undefined);
        }
      })
    )
  );
});

test("delivery workflow samples allow explicitly omitted exploration", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const { calls, result } = await runWorkflowSample(
        file,
        { candidateBranch: "task-branch", skips: { explore: true }, task: "t" },
        dispatchTable({
          Implement: () => simpleImplement,
          Integrate: () => integrateSingle,
          Plan: () => singleUnits,
          Publish: () => publishCreated,
          Review: () => reviewPass,
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(
        calls.some((call) => call.phase === "Explore"),
        false
      );
      assert.equal(result.complete, true);
      assert.equal(
        result.phaseEvidence.find((record) => record.title === "Explore")
          .status,
        "skipped"
      );
      const refuted = await runWorkflowSample(
        file,
        { candidateBranch: "task-branch", skips: { explore: true }, task: "t" },
        dispatchTable({
          Implement: () => simpleImplement,
          Integrate: () => integrateSingle,
          Plan: () => singleUnits,
          Publish: () => publishCreated,
          Review: () => reviewFix,
          Scope: () => scopeResult,
          Sweep: () => sweepResult,
          Verify: () => ({
            dispositions: [
              {
                evidence: "Source disproves it.",
                id: "review-1-finding-1",
                status: "refuted"
              }
            ]
          })
        })
      );
      assert.equal(refuted.result.complete, true);
      assert.equal(refuted.result.review.accepted, true);
      const failed = await runWorkflowSample(
        file,
        { candidateBranch: "task-branch", skips: { explore: true }, task: "t" },
        dispatchTable({ Scope: () => null })
      );
      assert.equal(failed.result.complete, false);
      assert.equal(
        failed.calls.some((call) => call.phase === "Plan"),
        false
      );
    })
  );
});

test("delivery workflow samples stop planning when exploration fails", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const { calls, result } = await runWorkflowSample(
        file,
        { candidateBranch: "task-branch", task: "t" },
        dispatchTable({ Explore: () => null, Scope: () => scopeResult })
      );
      assert.equal(
        calls.some((call) => call.phase === "Explore"),
        true
      );
      assert.equal(
        result.phaseEvidence.find((record) => record.title === "Explore")
          .status,
        "failed"
      );
      assert.equal(
        calls.some((call) => call.phase === "Plan"),
        false
      );
      assert.equal(result.complete, false);
    })
  );
});

test("delivery workflow samples preserve post-then-review ordering and honest phase records", async () => {
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.simple,
      {
        candidateBranch: "task-branch",
        issue: "#1",
        maxFixRounds: 1,
        task: "t"
      },
      dispatchTable({
        Explore: () => exploreResult,
        Implement: sequence(simpleImplement, simpleRepair),
        Integrate: sequence(integrateSingle, integrateSingle),
        Plan: () => singleUnits,
        Publish: sequence(publishCreated, publishUpdated),
        Review: sequence(reviewFix, reviewPass),
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    const phases = calls.map((call) => call.phase);
    assert.equal(result.complete, true);
    assert.deepEqual(
      result.phaseEvidence.map((record) => record.status),
      [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed"
      ]
    );
    assert.deepEqual(result.fixRounds, { max: 1, used: 1 });
    assert.equal(phases.filter((phase) => phase === "Implement").length, 2);
    assert.equal(phases.filter((phase) => phase === "Publish").length, 2);
    assert.equal(phases.filter((phase) => phase === "Review").length, 2);
    assert.ok(phases.indexOf("Publish") < phases.indexOf("Review"));
    assert.ok(phases.lastIndexOf("Publish") < phases.lastIndexOf("Review"));
    for (const call of calls.filter((entry) => entry.phase === "Review")) {
      assert.ok(call.prompt.includes("https://example.invalid/pr/1"));
    }
    const publishCalls = calls.filter((entry) => entry.phase === "Publish");
    assert.ok(publishCalls[0].prompt.includes("Create a review request"));
    assert.ok(
      publishCalls[1].prompt.includes(
        "Update the existing open request at https://example.invalid/pr/1"
      )
    );
    assert.ok(
      calls
        .filter((entry) => entry.phase === "Implement")
        .every((call) => call.isolation === "worktree")
    );
    const implementCalls = calls.filter((entry) => entry.phase === "Implement");
    assert.ok(
      implementCalls[0].prompt.includes(
        "Required starting reference: task-branch"
      )
    );
    assert.ok(!implementCalls[0].prompt.includes("Base branch:"));
    assert.ok(
      implementCalls[1].prompt.includes(
        "Required starting reference: task-branch"
      )
    );
    for (const call of calls.filter((entry) => entry.phase === "Publish")) {
      assert.ok(call.prompt.includes("pnpm run check:markdownlint-cli2"));
      assert.ok(call.prompt.includes("pnpm run check:hooks"));
    }
    assert.deepEqual(result.units, [
      { branch: "unit-u1", key: "u1", paths: ["docs/guide.md"] }
    ]);
    assert.deepEqual(result.resources, [
      { branch: "unit-u1", key: "u1", startRef: "task-branch", state: "merged" }
    ]);
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.simple,
      {
        candidateBranch: "task-branch",
        issue: "#1",
        maxFixRounds: 0,
        task: "t"
      },
      dispatchTable({
        Explore: () => exploreResult,
        Implement: () => simpleImplement,
        Integrate: () => integrateSingle,
        Plan: () => singleUnits,
        Publish: () => publishCreated,
        Review: () => reviewFix,
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    const phases = calls.map((call) => call.phase);
    assert.equal(result.complete, false);
    assert.equal(phases.filter((phase) => phase === "Publish").length, 1);
    assert.equal(phases.filter((phase) => phase === "Review").length, 1);
    const reviewRecord = result.phaseEvidence.find(
      (record) => record.title === "Review"
    );
    assert.equal(reviewRecord.status, "completed");
    assert.equal(
      reviewRecord.reason,
      "Verdict fix-required after 0 of 0 fix rounds"
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.simple,
      {
        candidateBranch: "task-branch",
        issue: "#1",
        maxFixRounds: 1,
        task: "t"
      },
      dispatchTable({
        Explore: () => exploreResult,
        Implement: sequence(simpleImplement, simpleRepair),
        Integrate: () => integrateSingle,
        Plan: () => singleUnits,
        Publish: sequence(publishCreated, {
          action: "created",
          evidence: "e",
          url: "https://example.invalid/pr/2"
        }),
        Review: sequence(reviewFix, reviewPass),
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    const phases = calls.map((call) => call.phase);
    assert.equal(result.complete, false);
    assert.equal(phases.filter((phase) => phase === "Publish").length, 2);
    assert.equal(phases.filter((phase) => phase === "Review").length, 1);
    const publishRecord = result.phaseEvidence.find(
      (record) => record.title === "Publish"
    );
    assert.equal(publishRecord.status, "failed");
    assert.equal(
      publishRecord.reason,
      "Publication did not update the previously posted request, so publication is blocked"
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.complex,
      {
        candidateBranch: "task-branch",
        issue: "#1",
        maxFixRounds: 1,
        skips: { sweep: true },
        task: "t"
      },
      dispatchTable({
        Explore: () => exploreResult,
        Implement: splitImplement,
        Integrate: () => integrateResult,
        Plan: () => splitUnits,
        Scope: () => scopeResult
      })
    );
    const phases = calls.map((call) => call.phase);
    assert.equal(result.complete, false);
    assert.equal(result.split, true);
    assert.equal(phases.filter((phase) => phase === "Sweep").length, 0);
    assert.equal(phases.filter((phase) => phase === "Publish").length, 0);
    assert.equal(phases.filter((phase) => phase === "Review").length, 0);
    assert.equal(phases.filter((phase) => phase === "Integrate").length, 1);
    assert.equal(phases.filter((phase) => phase === "Implement").length, 2);
    assert.ok(
      calls
        .filter((entry) => entry.phase === "Implement")
        .every((call) => call.isolation === "worktree")
    );
    const integrateCall = calls.find((entry) => entry.phase === "Integrate");
    assert.ok(integrateCall.prompt.includes("unit-u1"));
    assert.ok(integrateCall.prompt.includes("unit-u2"));
    assert.ok(!integrateCall.prompt.includes("git worktree list"));
    const sweepRecord = result.phaseEvidence.find(
      (record) => record.title === "Sweep"
    );
    assert.equal(sweepRecord.status, "skipped");
    const publishRecord = result.phaseEvidence.find(
      (record) => record.title === "Publish"
    );
    assert.equal(
      publishRecord.reason,
      "Required Sweep predecessor is incomplete"
    );
    const reviewRecord = result.phaseEvidence.find(
      (record) => record.title === "Review"
    );
    assert.equal(reviewRecord.status, "skipped");
    assert.equal(
      reviewRecord.reason,
      "Required Publish predecessor is incomplete, so there is no posted request to review"
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.complex,
      {
        candidateBranch: "task-branch",
        issue: "#1",
        maxFixRounds: 1,
        task: "t"
      },
      dispatchTable({
        Explore: () => exploreResult,
        Implement: splitImplement,
        Integrate: () => integrateResult,
        Plan: () => splitUnits,
        Publish: sequence(publishCreated, publishUpdated),
        Review: sequence(reviewFix, reviewPass),
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    const phases = calls.map((call) => call.phase);
    assert.equal(result.complete, true);
    assert.equal(result.split, true);
    assert.equal(phases.filter((phase) => phase === "Implement").length, 3);
    assert.equal(phases.filter((phase) => phase === "Integrate").length, 2);
    assert.equal(phases.filter((phase) => phase === "Sweep").length, 2);
    assert.equal(phases.filter((phase) => phase === "Publish").length, 2);
    assert.equal(phases.filter((phase) => phase === "Review").length, 2);
    assert.ok(phases.indexOf("Publish") < phases.indexOf("Review"));
    assert.ok(phases.lastIndexOf("Publish") < phases.lastIndexOf("Review"));
    const fixCall = calls.find(
      (entry) =>
        entry.phase === "Implement" &&
        entry.prompt.includes("Fix these review findings")
    );
    assert.ok(
      fixCall.prompt.includes("Required starting reference: task-branch")
    );
    assert.ok(fixCall.prompt.includes("Synchronize to it"));
    const publishCalls = calls.filter((entry) => entry.phase === "Publish");
    for (const call of publishCalls) {
      assert.ok(call.prompt.includes("pnpm run check"));
    }
    assert.ok(publishCalls[1].prompt.includes("check-u2"));
    assert.ok(publishCalls[1].prompt.includes("check-u1-fixed"));
    assert.ok(!publishCalls[1].prompt.includes('"check-u1"'));
    assert.equal(
      result.units.find((unit) => unit.key === "u2").branch,
      "unit-u2"
    );
    assert.deepEqual(
      result.resources.map((resource) => resource.state),
      ["merged", "merged"]
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.simple,
      {
        issue: "#1",
        maxFixRounds: 0,
        models: { scope: "configured-selector" },
        skips: { implement: true, integrate: true, publish: true },
        task: "t"
      },
      dispatchTable({
        Explore: () => exploreResult,
        Plan: () => singleUnits,
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    const phases = calls.map((call) => call.phase);
    assert.equal(result.complete, false);
    assert.equal(phases.filter((phase) => phase === "Implement").length, 0);
    assert.equal(phases.filter((phase) => phase === "Publish").length, 0);
    assert.equal(phases.filter((phase) => phase === "Integrate").length, 0);
    assert.equal(phases.filter((phase) => phase === "Review").length, 0);
    const models = Object.fromEntries(
      calls.map((call) => [call.phase, call.model])
    );
    assert.equal(models.Scope, "configured-selector");
    assert.equal(models.Plan, undefined);
    const reviewRecord = result.phaseEvidence.find(
      (record) => record.title === "Review"
    );
    assert.equal(reviewRecord.status, "skipped");
    assert.equal(
      reviewRecord.reason,
      "Required Publish predecessor is incomplete, so there is no posted request to review"
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.simple,
      { issue: "#1", skips: { implement: true }, task: "t" },
      dispatchTable({
        Explore: () => exploreResult,
        Plan: () => singleUnits,
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    assert.equal(result.complete, false);
    assert.equal(calls.filter((call) => call.phase === "Implement").length, 0);
    assert.equal(
      result.phaseEvidence.find((record) => record.title === "Implement")
        .reason,
      "Explicit dispatch skip, so source changes did not run"
    );
  }
  {
    const { result } = await runWorkflowSample(
      samplePaths.simple,
      { candidateBranch: "task-branch", issue: "#1", task: "t" },
      dispatchTable({
        Explore: () => exploreResult,
        Implement: () => null,
        Plan: () => singleUnits,
        Review: () => reviewPass,
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    assert.equal(result.complete, false);
    const implementRecord = result.phaseEvidence.find(
      (record) => record.title === "Implement"
    );
    assert.equal(implementRecord.status, "failed");
    const publishRecord = result.phaseEvidence.find(
      (record) => record.title === "Publish"
    );
    assert.equal(publishRecord.status, "skipped");
    assert.equal(
      publishRecord.reason,
      "Implementation did not complete, so publication is blocked"
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.complex,
      { issue: "#1", task: "t" },
      dispatchTable({
        Explore: () => exploreResult,
        Plan: () => nestedUnits,
        Review: () => reviewPass,
        Scope: () => scopeResult,
        Sweep: () => sweepResult
      })
    );
    assert.equal(result.complete, false);
    const planRecord = result.phaseEvidence.find(
      (record) => record.title === "Plan"
    );
    assert.equal(planRecord.status, "failed");
    const implementRecord = result.phaseEvidence.find(
      (record) => record.title === "Implement"
    );
    assert.equal(implementRecord.status, "skipped");
    assert.equal(calls.filter((call) => call.phase === "Implement").length, 0);
  }
  await assert.rejects(
    () =>
      runWorkflowSample(
        samplePaths.simple,
        { issue: "", task: "t" },
        dispatchTable({ Scope: () => scopeResult })
      ),
    /args.issue/u
  );
});

test("delivery workflow samples reject unsafe ownership and contradictory evidence", async () => {
  await Promise.all(
    [absoluteUnits, escapingUnits, nestedUnits].map(async (planPayload) => {
      const { calls, result } = await runWorkflowSample(
        samplePaths.complex,
        { issue: "#1", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Plan: () => planPayload,
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, false);
      const planRecord = result.phaseEvidence.find(
        (record) => record.title === "Plan"
      );
      assert.equal(planRecord.status, "failed");
      assert.equal(
        calls.filter((call) => call.phase === "Implement").length,
        0
      );
    })
  );
  const legacySummary = {
    ...simpleImplement,
    checks: [{ command: "pnpm run check", status: "failed" }],
    checksPassed: true
  };
  const badOwnership = { ...simpleImplement, changedFiles: ["src/other.js"] };
  const skippedCheck = {
    ...simpleImplement,
    checks: [
      { command: "pnpm run check:a", status: "passed" },
      { command: "pnpm run check:b", status: "skipped" }
    ]
  };
  await Promise.all(
    [
      [badOwnership, /outside the owned paths/u],
      [legacySummary, /did not all pass/u],
      [skippedCheck, /did not all pass/u]
    ].map(async ([payload, pattern]) => {
      const { result } = await runWorkflowSample(
        samplePaths.simple,
        { candidateBranch: "task-branch", issue: "#1", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: () => payload,
          Plan: () => singleUnits,
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, false);
      const implementRecord = result.phaseEvidence.find(
        (record) => record.title === "Implement"
      );
      assert.equal(implementRecord.status, "failed");
      assert.match(implementRecord.reason, pattern);
      const publishRecord = result.phaseEvidence.find(
        (record) => record.title === "Publish"
      );
      assert.equal(publishRecord.status, "skipped");
      assert.equal(
        publishRecord.reason,
        "Implementation did not complete, so publication is blocked"
      );
    })
  );
  const integrateUnmerged = {
    ...integrateResult,
    conflicts: ["docs/guide.md"],
    merged: false
  };
  const integrateConflicted = {
    ...integrateResult,
    conflicts: ["docs/guide.md"]
  };
  const integratePartialLedger = {
    ...integrateResult,
    resources: [{ branch: "unit-u1", key: "u1", state: "merged" }]
  };
  const integrateNoChecks = { ...integrateResult, checks: [] };
  const integrateRetained = {
    ...integrateResult,
    resources: [
      { branch: "unit-u1", key: "u1", state: "merged" },
      { branch: "unit-u2", key: "u2", state: "retained" }
    ]
  };
  const integrateWrongBranch = {
    ...integrateResult,
    resources: [
      { branch: "other-branch", key: "u1", state: "merged" },
      { branch: "unit-u2", key: "u2", state: "merged" }
    ]
  };
  const integratePartialFailure = {
    ...integrateResult,
    conflicts: ["docs/guide.md"],
    merged: false,
    resources: [
      { branch: "unit-u1", key: "u1", state: "merged" },
      { branch: "unit-u2", key: "u2", state: "failed" }
    ]
  };
  const integrateDuplicate = {
    ...integrateResult,
    resources: [
      { branch: "unit-u1", key: "u1", state: "retained" },
      { branch: "unit-u1", key: "u1", state: "merged" },
      { branch: "unit-u2", key: "u2", state: "merged" }
    ]
  };
  await Promise.all(
    [
      [integrateUnmerged, /contradicts/u, ["implemented", "implemented"]],
      [integrateConflicted, /contradicts/u, ["implemented", "implemented"]],
      [integratePartialFailure, /unmerged/u, ["merged", "failed"]],
      [
        integratePartialLedger,
        /every named unit branch/u,
        ["implemented", "implemented"]
      ],
      [
        integrateWrongBranch,
        /every named unit branch/u,
        ["implemented", "implemented"]
      ],
      [
        integrateDuplicate,
        /every named unit branch/u,
        ["implemented", "implemented"]
      ],
      [integrateNoChecks, /combined candidate/u, ["merged", "merged"]],
      [integrateRetained, /contradicts/u, ["implemented", "implemented"]],
      [null, /Integration agent failed/u, ["implemented", "implemented"]]
    ].map(async ([payload, pattern, states]) => {
      const { result } = await runWorkflowSample(
        samplePaths.complex,
        { candidateBranch: "task-branch", issue: "#1", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: splitImplement,
          Integrate: () => payload,
          Plan: () => splitUnits,
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, false);
      const integrateRecord = result.phaseEvidence.find(
        (record) => record.title === "Integrate"
      );
      assert.equal(integrateRecord.status, "failed");
      assert.match(integrateRecord.reason, pattern);
      assert.deepEqual(
        result.resources.map((resource) => resource.state),
        states
      );
      const publishRecord = result.phaseEvidence.find(
        (record) => record.title === "Publish"
      );
      assert.equal(
        publishRecord.reason,
        "Required Integration predecessor is incomplete, so publication is blocked"
      );
    })
  );
});

test("delivery workflow samples carry named candidates and per-key repair evidence", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.complex,
    { candidateBranch: "task-branch", issue: "#1", maxFixRounds: 1, task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: wrongStart,
      Integrate: () => integrateResult,
      Plan: () => splitUnits,
      Publish: sequence(publishCreated, publishUpdated),
      Review: sequence(reviewFix, reviewPass),
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  const phases = calls.map((call) => call.phase);
  assert.equal(result.complete, false);
  assert.equal(phases.filter((phase) => phase === "Implement").length, 3);
  assert.equal(phases.filter((phase) => phase === "Publish").length, 1);
  assert.equal(phases.filter((phase) => phase === "Review").length, 1);
  const implementRecord = result.phaseEvidence.find(
    (record) => record.title === "Implement"
  );
  assert.equal(implementRecord.status, "failed");
  assert.match(implementRecord.reason, /start from task-branch/u);
  const fixCall = calls.find(
    (entry) =>
      entry.phase === "Implement" &&
      entry.prompt.includes("Fix these review findings")
  );
  assert.ok(
    fixCall.prompt.includes("Required starting reference: task-branch")
  );
  assert.ok(fixCall.prompt.includes("Synchronize to it"));
  assert.deepEqual(
    result.resources.find((resource) => resource.key === "u1"),
    { branch: "unit-u1", key: "u1", startRef: "wrong-ref", state: "attempted" }
  );
  const repairRun = await runWorkflowSample(
    samplePaths.complex,
    { candidateBranch: "task-branch", issue: "#1", maxFixRounds: 1, task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: failedRepair,
      Integrate: () => integrateResult,
      Plan: () => splitUnits,
      Publish: sequence(publishCreated, publishUpdated),
      Review: sequence(reviewFix, reviewPass),
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  assert.equal(repairRun.result.complete, false);
  assert.equal(
    repairRun.result.phaseEvidence.find(
      (record) => record.title === "Implement"
    ).status,
    "failed"
  );
  assert.deepEqual(
    repairRun.result.resources.filter((resource) => resource.key === "u1"),
    [
      {
        branch: "unit-u1",
        key: "u1",
        startRef: "task-branch",
        state: "merged"
      },
      {
        branch: "unit-u1-r2",
        key: "u1",
        startRef: "task-branch",
        state: "attempted"
      }
    ]
  );
  assert.equal(
    repairRun.result.resources.find((resource) => resource.key === "u2").state,
    "merged"
  );
  assert.equal(
    repairRun.calls.filter((call) => call.phase === "Publish").length,
    1
  );
  const candidateRun = await runWorkflowSample(
    samplePaths.simple,
    { candidateBranch: "wg-candidate", issue: "#1", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: () => simpleImplement,
      Integrate: () => integrateSingle,
      Plan: () => singleUnits,
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  const initialCall = candidateRun.calls.find(
    (entry) => entry.phase === "Implement"
  );
  assert.ok(
    initialCall.prompt.includes("Required starting reference: wg-candidate")
  );
  assert.ok(!initialCall.prompt.includes("Base branch:"));
  assert.equal(candidateRun.result.complete, false);
  const candidateRecord = candidateRun.result.phaseEvidence.find(
    (record) => record.title === "Implement"
  );
  assert.equal(candidateRecord.status, "failed");
  assert.match(candidateRecord.reason, /start from wg-candidate/u);
  assert.deepEqual(candidateRun.result.resources, [
    {
      branch: "unit-u1",
      key: "u1",
      startRef: "task-branch",
      state: "attempted"
    }
  ]);
  const multiRun = await runWorkflowSample(
    samplePaths.complex,
    { candidateBranch: "task-branch", issue: "#1", maxFixRounds: 2, task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: multiRound,
      Integrate: sequence(
        integrateResult,
        integrateFirstRepair,
        integrateSecondRepair
      ),
      Plan: () => splitUnits,
      Publish: sequence(publishCreated, publishUpdated, publishUpdated),
      Review: sequence(reviewFix, reviewFix, reviewPass),
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  assert.equal(multiRun.result.complete, true);
  assert.deepEqual(multiRun.result.fixRounds, { max: 2, used: 2 });
  const integrateCalls = multiRun.calls.filter(
    (call) => call.phase === "Integrate"
  );
  assert.equal(integrateCalls.length, 3);
  for (const [round, call] of integrateCalls.entries()) {
    assert.ok(
      call.prompt.includes(
        "its own changes since its merge base with the destination, as `git diff <destination>...<unit branch>` reports them"
      )
    );
    assert.ok(
      call.prompt.includes(
        "Do not judge a unit by a direct comparison with the current destination"
      )
    );
    assert.ok(
      call.prompt.includes(
        "A unit branch the destination already contains has no new changes, so report it merged without merging it again."
      )
    );
    assert.ok(call.prompt.includes('"branch":"unit-u2"'));
    assert.ok(
      call.prompt.includes(
        `"branch":"${["unit-u1", "unit-u1-r1", "unit-u1-r2"][round]}"`
      )
    );
  }
  assert.equal(
    multiRun.calls.filter((call) => call.phase === "Implement").length,
    4
  );
  assert.deepEqual(multiRun.result.resources, [
    { branch: "unit-u1", key: "u1", startRef: "task-branch", state: "merged" },
    { branch: "unit-u2", key: "u2", startRef: "task-branch", state: "merged" },
    {
      branch: "unit-u1-r1",
      key: "u1",
      startRef: "task-branch",
      state: "merged"
    },
    {
      branch: "unit-u1-r2",
      key: "u1",
      startRef: "task-branch",
      state: "merged"
    }
  ]);
  const supersededRun = await runWorkflowSample(
    samplePaths.complex,
    { candidateBranch: "task-branch", issue: "#1", maxFixRounds: 1, task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: multiRound,
      Integrate: sequence(integrateResult, {
        ...integrateResult,
        conflicts: ["docs/guide.md"],
        merged: false,
        resources: [
          { branch: "unit-u1", key: "u1", state: "failed" },
          { branch: "unit-u2", key: "u2", state: "merged" }
        ]
      }),
      Plan: () => splitUnits,
      Publish: sequence(publishCreated, publishUpdated),
      Review: sequence(reviewFix, reviewPass),
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  assert.equal(supersededRun.result.complete, false);
  assert.match(
    supersededRun.result.phaseEvidence.find(
      (record) => record.title === "Integrate"
    ).reason,
    /every named unit branch/u
  );
  assert.deepEqual(supersededRun.result.resources, [
    { branch: "unit-u1", key: "u1", startRef: "task-branch", state: "merged" },
    { branch: "unit-u2", key: "u2", startRef: "task-branch", state: "merged" },
    {
      branch: "unit-u1-r1",
      key: "u1",
      startRef: "task-branch",
      state: "implemented"
    }
  ]);
  const missingRun = await runWorkflowSample(
    samplePaths.complex,
    { issue: "#1", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: splitImplement,
      Integrate: () => integrateResult,
      Plan: () => splitUnits,
      Publish: () => publishCreated,
      Review: () => reviewPass,
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  assert.equal(missingRun.result.complete, false);
  assert.equal(
    missingRun.calls.filter((call) => call.phase === "Implement").length,
    0
  );
  const missingRecord = missingRun.result.phaseEvidence.find(
    (record) => record.title === "Implement"
  );
  assert.equal(missingRecord.status, "failed");
  assert.match(missingRecord.reason, /args.candidateBranch/u);
  assert.deepEqual(missingRun.result.resources, []);
  assert.equal(
    missingRun.result.phaseEvidence.find((record) => record.title === "Publish")
      .reason,
    "Implementation did not complete, so publication is blocked"
  );
});

test("delivery samples validate integration destination and verify findings before repairs", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const { calls, result } = await runWorkflowSample(
        file,
        { candidateBranch: "other-task", issue: "#1", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: () => ({ ...simpleImplement, startRef: "other-task" }),
          Integrate: () => integrateSingle,
          Plan: () => singleUnits,
          Publish: () => publishCreated,
          Review: () => reviewFix,
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, false);
      assert.equal(
        calls.some(({ phase }) => phase === "Publish"),
        false
      );
    })
  );
});

test("delivery samples gate repairs on independent finding dispositions", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      await Promise.all(
        [
          [
            [
              {
                evidence: "Source disproves it.",
                id: "review-1-finding-1",
                status: "refuted"
              }
            ],
            true,
            0
          ],
          [
            [
              {
                evidence: "Source confirms it.",
                id: "review-1-finding-1",
                status: "confirmed"
              }
            ],
            true,
            1
          ],
          [
            [
              {
                evidence: "Cannot determine.",
                id: "review-1-finding-1",
                status: "unverified"
              }
            ],
            false,
            0
          ],
          [[], false, 0],
          [
            [{ evidence: "Source.", id: "unknown", status: "confirmed" }],
            false,
            0
          ],
          [
            [{ evidence: "", id: "review-1-finding-1", status: "confirmed" }],
            false,
            0
          ],
          [null, false, 0]
        ].map(async ([dispositions, expectedComplete, expectedRepairs]) => {
          const { calls, result } = await runWorkflowSample(
            file,
            { candidateBranch: "task-branch", issue: "#1", task: "t" },
            dispatchTable({
              Explore: () => exploreResult,
              Implement: sequence(simpleImplement, simpleRepair),
              Integrate: () => integrateSingle,
              Plan: () => singleUnits,
              Publish: sequence(publishCreated, publishUpdated),
              Review: sequence(reviewFix, reviewPass),
              Scope: () => scopeResult,
              Sweep: () => sweepResult,
              Verify: () => (dispositions === null ? null : { dispositions })
            })
          );
          assert.equal(result.complete, expectedComplete);
          assert.equal(
            calls.filter(({ phase }) => phase === "Implement").length,
            1 + expectedRepairs
          );
          assert.equal(
            calls.filter(({ phase }) => phase === "Publish").length,
            1 + expectedRepairs
          );
          const verify = calls.find(({ phase }) => phase === "Verify");
          assert.match(verify.prompt, /read-only/u);
          assert.match(verify.prompt, /Candidate branch: task-branch/u);
          assert.deepEqual(
            result.reviewHistory[0].verification.dispositions,
            dispositions
          );
        })
      );
      const unowned = await runWorkflowSample(
        file,
        { candidateBranch: "task-branch", issue: "#1", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: () => simpleImplement,
          Integrate: () => integrateSingle,
          Plan: () => singleUnits,
          Publish: () => publishCreated,
          Review: () => ({
            ...reviewFix,
            findings: [{ detail: "d", file: "README.md", scenario: "s" }]
          }),
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(unowned.result.complete, false);
      const reviewRecord = unowned.result.phaseEvidence.find(
        (record) => record.title === "Review"
      );
      assert.equal(reviewRecord.status, "failed");
      assert.equal(
        reviewRecord.reason,
        "Confirmed findings do not map to exactly one owned unit"
      );
      assert.equal(unowned.result.fixRounds.used, 0);
      for (const phase of ["Implement", "Integrate", "Publish", "Review"]) {
        assert.equal(
          unowned.calls.filter((call) => call.phase === phase).length,
          1
        );
      }
    })
  );
});

test("delivery samples reject invalid integration path evidence and base destinations", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      await Promise.all(
        [["../outside"], ["src/other.js"], null].map(async (changedFiles) => {
          const { calls, result } = await runWorkflowSample(
            file,
            { candidateBranch: "task-branch", issue: "#1", task: "t" },
            dispatchTable({
              Explore: () => exploreResult,
              Implement: () => simpleImplement,
              Integrate: () => ({ ...integrateSingle, changedFiles }),
              Plan: () => singleUnits,
              Publish: () => publishCreated,
              Review: () => reviewPass,
              Scope: () => scopeResult,
              Sweep: () => sweepResult
            })
          );
          assert.equal(result.complete, false);
          assert.equal(
            calls.some(({ phase }) => phase === "Publish"),
            false
          );
          const integration = calls.find(({ phase }) => phase === "Integrate");
          assert.match(
            integration.prompt,
            /authorized destination: task-branch/u
          );
          assert.match(integration.prompt, /"paths":\["docs\/guide.md"\]/u);
        })
      );
      const { calls, result } = await runWorkflowSample(
        file,
        {
          baseBranch: "task-branch",
          candidateBranch: "task-branch",
          issue: "#1",
          task: "t"
        },
        dispatchTable({
          Explore: () => exploreResult,
          Plan: () => singleUnits,
          Scope: () => scopeResult
        })
      );
      assert.equal(result.complete, false);
      assert.equal(
        calls.some(({ phase }) => phase === "Implement"),
        false
      );
    })
  );
});

test("complex delivery routes only independently confirmed findings to their owner", async () => {
  const findings = [
    { detail: "first", file: "docs/guide.md", scenario: "first trigger" },
    { detail: "second", file: "src/main.js", scenario: "second trigger" }
  ];
  const { calls, result } = await runWorkflowSample(
    samplePaths.complex,
    { candidateBranch: "task-branch", issue: "#1", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: splitImplement,
      Integrate: () => integrateResult,
      Plan: () => splitUnits,
      Publish: sequence(publishCreated, publishUpdated),
      Review: sequence(
        { evidence: "Review evidence", findings, verdict: "fix-required" },
        reviewPass
      ),
      Scope: () => scopeResult,
      Sweep: () => sweepResult,
      Verify: () => ({
        dispositions: [
          {
            evidence: "Confirmed in source",
            id: "review-1-finding-1",
            status: "confirmed"
          },
          {
            evidence: "Refuted in source",
            id: "review-1-finding-2",
            status: "refuted"
          }
        ]
      })
    })
  );
  assert.equal(result.complete, true);
  const repairs = calls.filter(
    ({ phase, prompt }) =>
      phase === "Implement" && prompt.includes("Fix these review findings")
  );
  assert.equal(repairs.length, 1);
  assert.match(repairs[0].prompt, /first trigger/u);
  assert.doesNotMatch(repairs[0].prompt, /second trigger/u);
  assert.equal(result.reviewHistory[0].verification.dispositions.length, 2);
});

test("delivery samples reject malformed findings and preserve review evidence", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      [null, { detail: "d", file: null, scenario: "s" }].map(
        async (finding) => {
          const { calls, result } = await runWorkflowSample(
            file,
            { candidateBranch: "task-branch", issue: "#1", task: "t" },
            dispatchTable({
              Explore: () => exploreResult,
              Implement: () => simpleImplement,
              Integrate: () => integrateSingle,
              Plan: () => singleUnits,
              Publish: () => publishCreated,
              Review: () => ({
                evidence: "review evidence",
                findings: [finding],
                verdict: "fix-required"
              }),
              Scope: () => scopeResult,
              Sweep: () => sweepResult
            })
          );
          assert.equal(result.complete, false);
          assert.equal(result.review.status, "failed");
          assert.equal(result.review.evidence, "review evidence");
          assert.deepEqual(result.review.findings, [finding]);
          assert.equal(
            calls.some(({ phase }) => phase === "Verify"),
            false
          );
        }
      )
    )
  );
});

test("delivery finding verification independently selects its model", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      [
        {},
        { review: "review-selector" },
        { review: "review-selector", verify: "verify-selector" }
      ].map(async (models) => {
        const { calls } = await runWorkflowSample(
          file,
          {
            candidateBranch: "task-branch",
            issue: "#1",
            models,
            task: "t"
          },
          dispatchTable({
            Explore: () => exploreResult,
            Implement: () => simpleImplement,
            Integrate: () => integrateSingle,
            Plan: () => singleUnits,
            Publish: () => publishCreated,
            Review: () => reviewFix,
            Scope: () => scopeResult,
            Sweep: () => sweepResult
          })
        );
        const review = calls.find(({ phase }) => phase === "Review");
        const verification = calls.find(({ phase }) => phase === "Verify");
        assert.equal(review.model, models.review);
        assert.equal(review.modelProvided, models.review !== undefined);
        assert.equal(verification.model, models.verify);
        assert.equal(verification.modelProvided, models.verify !== undefined);
      })
    )
  );
});

test("delivery samples validate the verification model selector", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      ["", "  ", null, 42].map((verify) =>
        assert.rejects(
          runWorkflowSample(file, { models: { verify }, task: "t" }, () =>
            assert.fail("Invalid model selector dispatched an agent")
          ),
          /Provide models\.verify as a nonempty model selector string/u
        )
      )
    )
  );
});

test("delivery finding verification receives the review's issue and instructions", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      [undefined, "#123"].map(async (issue) => {
        const instruction = "Check the acceptance criteria in the request.";
        const { calls } = await runWorkflowSample(
          file,
          {
            candidateBranch: "task-branch",
            issue,
            promptParts: { review: instruction },
            task: "t"
          },
          dispatchTable({
            Explore: () => exploreResult,
            Implement: () => simpleImplement,
            Integrate: () => integrateSingle,
            Plan: () => singleUnits,
            Publish: () => publishCreated,
            Review: () => reviewFix,
            Scope: () => scopeResult,
            Sweep: () => sweepResult
          })
        );
        for (const phase of ["Review", "Verify"]) {
          const { prompt } = calls.find((call) => call.phase === phase);
          assert.ok(prompt.includes(instruction));
          assert.equal(
            prompt.includes("Linked issue reference:"),
            issue !== undefined
          );
          if (issue !== undefined) {
            assert.ok(prompt.includes(`Linked issue reference: ${issue}`));
          }
        }
      })
    )
  );
});
