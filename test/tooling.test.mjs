import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cp, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { lint } from "markdownlint/sync";

import noEmDash from "../rules/no-em-dash.ts";
import proseFormat from "../rules/prose-format.ts";
import tableSeparators from "../rules/table-separators.ts";

/** @param {unknown} value Parsed JSON value. @returns {value is Record<string, unknown>} Whether the value is an object. */
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** @param {unknown} value Parsed JSON value. @returns {value is unknown[]} Whether the value is an array. */
const isArray = (value) => Array.isArray(value);

void test("Git hooks invoke pnpm directly and propagate its status", async () => {
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

void test("prose formatting checks sentences and preserves Markdown syntax", () => {
  const source = [
    "# One sentence. Another sentence.",
    "",
    "First sentence. Second sentence.",
    "- First item. Second item.",
    "A clause; it must continue.",
    "",
    "One sentence per line.",
    "Another sentence with `one; two` and [a link](https://example.com/a;b).",
    "1. A numbered item with &amp; and a list of red; green; and blue.",
    "",
    "| Heading | Value |",
    "| --- | --- |",
    "| First. Second. | a; b |",
    "",
    "```sh",
    "if test; then run; fi",
    "```"
  ].join("\n");
  const errors =
    lint({
      config: { default: false, "docs/prose-format": true },
      customRules: [proseFormat],
      strings: { "input.md": source }
    })["input.md"] ?? [];
  assert.deepEqual(
    errors.map(({ lineNumber }) => lineNumber).toSorted((a, b) => a - b),
    [1, 3, 4, 5]
  );
});

void test("em-dash rule checks prose and preserves code and links", () => {
  const source = [
    "# Heading — heading",
    "",
    "Prose — prose.",
    "- Item — item.",
    "",
    "| Header | Value |",
    "| --- | --- |",
    "| Prose — prose | Value |",
    "",
    "Use `a—b` and [link](https://example.com/a—b).",
    "",
    "```text",
    "a—b",
    "```"
  ].join("\n");
  const errors =
    lint({
      config: { default: false, "docs/no-em-dash": true },
      customRules: [noEmDash],
      strings: { "input.md": source }
    })["input.md"] ?? [];
  assert.deepEqual(
    errors.map(({ lineNumber }) => lineNumber).toSorted((a, b) => a - b),
    [1, 3, 4, 8]
  );
});

void test("table separator traversal handles deeply nested blockquotes", () => {
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

void test("table separator diagnostics retain fix information", () => {
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

void test("box drawing rule covers all Markdown with first UTF-16 match and no fix", async () => {
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
    assert.deepEqual(
      [
        ...diagnostics.matchAll(
          /fixture\.md:(?<line>\d+):(?<column>\d+) error docs\/no-box-drawing /gu
        )
      ].map(({ groups }) => {
        assert.ok(groups);
        return [Number(groups.line), Number(groups.column)];
      }),
      [
        [3, 4],
        [4, 5],
        ...Array.from({ length: 128 }, (_, index) => [index + 5, 1]),
        [135, 4]
      ]
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

void test("TSDoc reports exposed TypeScript members once and excludes documented, private, and JavaScript members", async (t) => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = await mkdtemp(path.join(tmpdir(), "workgraph-tsdoc-"));
  t.after(async () => {
    await rm(directory, { force: true, recursive: true });
  });
  await Promise.all(
    ["oxlint.config.ts", "oxfmt.config.ts", "plugins"].map(async (entry) => {
      await cp(path.join(root, entry), path.join(directory, entry), {
        recursive: true
      });
    })
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
  /** @type {unknown} */
  const output = JSON.parse(
    result.stdout.slice(start, result.stdout.lastIndexOf("}") + 1)
  );
  assert.ok(isObject(output));
  assert.ok(isArray(output.diagnostics));
  const { diagnostics } = output;
  const messages = diagnostics.flatMap((entry) => {
    assert.ok(isObject(entry));
    assert.ok(typeof entry.code === "string");
    assert.ok(typeof entry.message === "string");
    return entry.code === "tsdoc(require-export-tsdoc)" ? [entry.message] : [];
  });
  assert.deepEqual(messages.toSorted(), [
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
  ]);
});

/** @typedef {{result: unknown} & Record<string, unknown>} CompletionEvidence */
/** @typedef {{key: string, status: string, reason: unknown, prerequisites: string[], completionEvidence: CompletionEvidence[]} & Record<string, unknown>} WorkflowNode */
/** @typedef {{from: string, to: string, type: string, condition: unknown}} WorkflowEdge */
/** @typedef {{title: string, status: string} & Record<string, unknown>} PhaseEvidence */
/** @typedef {{key: string, state: string} & Record<string, unknown>} WorkflowResource */
/** @typedef {{key: string, branch: unknown, paths: unknown} & Record<string, unknown>} WorkflowUnit */
/** @typedef {{complete: boolean, split: boolean, graph: {nodes: WorkflowNode[], edges: WorkflowEdge[]}, phaseEvidence: PhaseEvidence[], resources: WorkflowResource[], units: WorkflowUnit[], review: Record<string, unknown>, reviewHistory: Record<string, unknown>[], integration: Record<string, unknown>, fixRounds: {max: number, used: number}, publish: unknown, explorations: unknown[], sweepEvidence: unknown}} WorkflowResult */

/** @param {unknown} value Workflow node. @returns {value is WorkflowNode} Whether the node has the fields used by the tests. */
const isWorkflowNode = (value) =>
  isObject(value) &&
  typeof value.key === "string" &&
  typeof value.status === "string" &&
  "reason" in value &&
  isArray(value.prerequisites) &&
  value.prerequisites.every((item) => typeof item === "string") &&
  isArray(value.completionEvidence) &&
  value.completionEvidence.every((item) => isObject(item) && "result" in item);

/** @param {unknown} value Workflow edge. @returns {value is WorkflowEdge} Whether the edge has the fields used by the tests. */
const isWorkflowEdge = (value) =>
  isObject(value) &&
  typeof value.from === "string" &&
  typeof value.to === "string" &&
  typeof value.type === "string" &&
  "condition" in value;

/** @type {(value: unknown) => asserts value is WorkflowResult} */
const assertWorkflowResult = (value) => {
  assert.ok(isObject(value));
  assert.ok(typeof value.complete === "boolean");
  assert.ok(typeof value.split === "boolean");
  assert.ok(isObject(value.graph));
  assert.ok(
    isArray(value.graph.nodes) && value.graph.nodes.every(isWorkflowNode)
  );
  assert.ok(
    isArray(value.graph.edges) && value.graph.edges.every(isWorkflowEdge)
  );
  assert.ok(isArray(value.phaseEvidence));
  assert.ok(
    value.phaseEvidence.every(
      (item) =>
        isObject(item) &&
        typeof item.title === "string" &&
        typeof item.status === "string"
    )
  );
  assert.ok(isArray(value.resources));
  assert.ok(
    value.resources.every(
      (item) =>
        isObject(item) &&
        typeof item.key === "string" &&
        typeof item.state === "string"
    )
  );
  assert.ok(isArray(value.units));
  assert.ok(
    value.units.every(
      (item) =>
        isObject(item) &&
        typeof item.key === "string" &&
        "branch" in item &&
        "paths" in item
    )
  );
  assert.ok(isObject(value.review));
  assert.ok(
    isArray(value.reviewHistory) && value.reviewHistory.every(isObject)
  );
  assert.ok(isObject(value.integration));
  assert.ok(isObject(value.fixRounds));
  assert.ok(
    typeof value.fixRounds.max === "number" &&
      typeof value.fixRounds.used === "number"
  );
  assert.ok("publish" in value && "sweepEvidence" in value);
  assert.ok(isArray(value.explorations));
};

/** @param {string} file Workflow source path. */
const compileWorkflowSource = (file) => {
  /** @type {unknown} */
  const prototype = Object.getPrototypeOf(async () => {});
  assert.ok(isObject(prototype));
  const { constructor } = prototype;
  assert.ok(typeof constructor === "function");
  const source = readFileSync(file, "utf-8").replace(/^export /mu, "");
  /** @type {unknown} */
  const compiled = Reflect.construct(constructor, [
    "args",
    "agent",
    "parallel",
    "pipeline",
    "phase",
    "log",
    "workflow",
    "budget",
    source
  ]);
  assert.ok(typeof compiled === "function");
  return compiled;
};
/** @typedef {{phase: string, label: string, agentType?: unknown, effort?: unknown, isolation?: unknown, model?: unknown}} AgentOptions */

/** @param {Record<string, (options: AgentOptions) => unknown>} table Phase handlers. @returns {(options: AgentOptions) => unknown} Agent handler. */
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
/** @param {...unknown} payloads Responses to return in order. */
const sequence = (...payloads) => {
  let served = 0;
  return () => {
    const payload = payloads[Math.min(served, payloads.length - 1)];
    served += 1;
    return payload;
  };
};
/** @param {string} file Workflow source. @param {Record<string, unknown>} args Workflow input. @param {(options: AgentOptions) => unknown} payloadFor Agent response factory. */
const runWorkflowSample = async (file, args, payloadFor) => {
  /** @type {{agentType: unknown, effort: unknown, effortProvided: boolean, isolation: unknown, label: string, model: unknown, modelProvided: boolean, phase: string, prompt: string}[]} */
  const calls = [];
  const environment = {
    /** @param {string} prompt Agent prompt. @param {AgentOptions} options Agent dispatch options. */
    agent: async (prompt, options) => {
      calls.push({
        agentType: options.agentType,
        effort: options.effort,
        effortProvided: Object.hasOwn(options, "effort"),
        isolation: options.isolation,
        label: options.label,
        model: options.model,
        modelProvided: Object.hasOwn(options, "model"),
        phase: options.phase,
        prompt
      });
      const payload = payloadFor(options);
      if (payload === null) {
        throw new Error("agent failure");
      }
      return await Promise.resolve(payload);
    },
    budget: { remaining: () => Infinity, spent: () => 0, total: null },
    log: () => null,
    /** @param {(() => Promise<unknown>)[]} thunks Work items. */
    parallel: async (thunks) =>
      await Promise.all(thunks.map(async (thunk) => await thunk())),
    phase: () => null,
    pipeline: () => {
      throw new Error("pipeline must not run in these samples");
    },
    workflow: () => {
      throw new Error("workflow must not run in these samples");
    }
  };
  /** @type {unknown} */
  const result = await Reflect.apply(compileWorkflowSource(file), undefined, [
    args,
    environment.agent,
    environment.parallel,
    environment.pipeline,
    environment.phase,
    environment.log,
    environment.workflow,
    environment.budget
  ]);
  assertWorkflowResult(result);
  return { calls, result };
};

const sampleRoot = path.resolve(import.meta.dirname, "..");
const samplePaths = {
  delivery: path.join(sampleRoot, "workflows/delivery.js")
};
const scopeResult = {
  baseBranch: "main",
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
const simpleRepair = {
  ...simpleImplement,
  branch: "unit-u1-fix",
  startRef: "unit-u1"
};
/** @param {AgentOptions} options Agent dispatch options. */
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
/** @param {AgentOptions} options Agent dispatch options. */
const wrongStart = (options) => {
  const result = splitImplement(options);
  return options.label.includes(":fix-")
    ? { ...result, startRef: "wrong-ref" }
    : result;
};
/** @param {AgentOptions} options Agent dispatch options. */
const failedRepair = (options) =>
  options.label.includes(":fix-")
    ? {
        ...splitImplement(options),
        branch: "unit-u1-r2",
        checks: [{ command: "check-failed", status: "failed" }]
      }
    : splitImplement(options);
/** @param {AgentOptions} options Agent dispatch options. */
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
  branch: "unit-u1",
  changedFiles: ["docs/guide.md"],
  checks: [{ command: "pnpm run check:test", status: "passed" }],
  conflicts: [],
  evidence: "e",
  merged: true,
  resources: [{ branch: "unit-u1-fix", key: "u1", state: "merged" }]
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

void test("delivery preserves a posted request after repair failures", async () => {
  await Promise.all(
    ["implement", "integrate", "sweep", "publish"].map(async (failure) => {
      const { result } = await runWorkflowSample(
        samplePaths.delivery,
        { candidateBranch: "task-branch", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: sequence(
            simpleImplement,
            failure === "implement" ? null : simpleRepair
          ),
          Integrate: () => (failure === "integrate" ? null : integrateSingle),
          Plan: () => singleUnits,
          Publish: sequence(
            publishCreated,
            failure === "publish" ? null : publishUpdated
          ),
          Review: () => reviewFix,
          Scope: () => scopeResult,
          Sweep: sequence(sweepResult, failure === "sweep" ? null : sweepResult)
        })
      );
      assert.equal(result.complete, false);
      assert.equal(
        result.graph.nodes.find((node) => node.key === `${failure}:fix-1`)
          ?.status,
        "failed"
      );
      assert.deepEqual(result.publish, { url: publishCreated.url });
      const phases = ["Implement", "Integrate", "Sweep", "Publish", "Review"];
      const failedIndex = phases.findIndex(
        (phase) => phase.toLowerCase() === failure
      );
      for (const [index, phase] of phases.entries()) {
        const status = index < failedIndex ? "completed" : "skipped";
        const expected = index === failedIndex ? "failed" : status;
        assert.equal(
          result.phaseEvidence.find((record) => record.title === phase)?.status,
          expected,
          phase
        );
        assert.equal(
          result.graph.nodes.find(
            (node) => node.key === `${phase.toLowerCase()}:fix-1`
          )?.status,
          expected,
          phase
        );
      }
      assert.equal(result.reviewHistory[0].verdict, "fix-required");
    })
  );
});

void test("delivery retains publication evidence in its graph", async () => {
  const { result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: () => simpleImplement,
      Plan: () => singleUnits,
      Publish: () => publishCreated,
      Review: () => reviewPass,
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  const publishNode = result.graph.nodes.find((node) => node.key === "publish");
  assert.ok(publishNode);
  const evidence = publishNode.completionEvidence.at(-1);
  assert.ok(evidence && isObject(evidence.result));
  assert.equal(evidence.result.evidence, publishCreated.evidence);
});

void test("delivery rejects a unit branch equal to the resolved default base", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: () => ({ ...simpleImplement, branch: "main" }),
      Plan: () => singleUnits,
      Publish: () => publishCreated,
      Review: () => reviewPass,
      Scope: () => ({ ...scopeResult, baseBranch: "main" }),
      Sweep: () => sweepResult
    })
  );
  assert.equal(result.complete, false);
  assert.equal(
    calls.some((call) => call.phase === "Publish"),
    false
  );
});

void test("delivery rejects a repair reported on the posted head", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: sequence(simpleImplement, {
        ...simpleRepair,
        branch: "unit-u1"
      }),
      Plan: () => singleUnits,
      Publish: () => publishCreated,
      Review: () => reviewFix,
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  assert.equal(result.complete, false);
  assert.equal(
    result.graph.nodes.find((node) => node.key === "implement:fix-1")?.status,
    "failed"
  );
  assert.equal(calls.filter((call) => call.phase === "Publish").length, 1);
  assert.deepEqual(result.publish, { url: publishCreated.url });
});

void test("delivery integrates a distinct repair branch into the posted single-unit head", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: sequence(simpleImplement, {
        ...simpleRepair,
        branch: "unit-u1-fix"
      }),
      Integrate: () => ({
        ...integrateSingle,
        branch: "unit-u1",
        resources: [{ branch: "unit-u1-fix", key: "u1", state: "merged" }]
      }),
      Plan: () => singleUnits,
      Publish: sequence(publishCreated, publishUpdated),
      Review: sequence(reviewFix, reviewPass),
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  assert.equal(result.complete, true);
  assert.equal(result.integration.branch, "unit-u1");
  assert.equal(calls.filter((call) => call.phase === "Integrate").length, 1);
});

void test("delivery samples reject a passing review with unresolved findings", async () => {
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

void test("delivery samples fail a fix-required review without findings", async () => {
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
      assert.equal(result.complete, false);
      assert.equal(
        result.phaseEvidence.find((record) => record.title === "Review")
          ?.status,
        "failed"
      );
    })
  );
});

void test("delivery workflow samples inherit host models and honor model overrides", async () => {
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
        const efforts = Object.fromEntries(
          Object.keys(models).map((phase) => [phase, `effort-${phase}`])
        );
        const { calls } = await runWorkflowSample(
          file,
          { candidateBranch: "task-branch", efforts, models, task: "t" },
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
        assert.deepEqual(
          Object.fromEntries(calls.map((call) => [call.phase, call.effort])),
          Object.fromEntries(
            calls.map((call) => [call.phase, efforts[call.phase.toLowerCase()]])
          )
        );
        for (const call of calls) {
          assert.equal(call.effortProvided, call.effort !== undefined);
          assert.equal(call.modelProvided, call.model !== undefined);
        }
      })
    )
  );
});

void test("delivery workflow samples allow explicitly omitted exploration", async () => {
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
          ?.status,
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

void test("delivery workflow samples stop planning when exploration fails", async () => {
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
          ?.status,
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

void test("delivery workflow samples preserve post-then-review ordering and honest phase records", async () => {
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.delivery,
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
    assert.ok(
      calls
        .filter((entry) => entry.phase === "Implement")
        .every((call) => call.isolation === "worktree")
    );
    assert.deepEqual(result.units, [
      { branch: "unit-u1-fix", key: "u1", paths: ["docs/guide.md"] }
    ]);
    assert.deepEqual(result.resources, [
      {
        branch: "unit-u1",
        key: "u1",
        startRef: "task-branch",
        state: "implemented"
      },
      {
        branch: "unit-u1-fix",
        key: "u1",
        startRef: "unit-u1",
        state: "merged"
      }
    ]);
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.delivery,
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
    assert.ok(reviewRecord);
    assert.equal(reviewRecord.status, "completed");
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.delivery,
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
    assert.ok(publishRecord);
    assert.equal(publishRecord.status, "failed");
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.delivery,
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
    const sweepRecord = result.phaseEvidence.find(
      (record) => record.title === "Sweep"
    );
    assert.ok(sweepRecord);
    assert.equal(sweepRecord.status, "skipped");
    const reviewRecord = result.phaseEvidence.find(
      (record) => record.title === "Review"
    );
    assert.ok(reviewRecord);
    assert.equal(reviewRecord.status, "skipped");
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.delivery,
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
    assert.equal(
      result.units.find((unit) => unit.key === "u2")?.branch,
      "unit-u2"
    );
    assert.deepEqual(
      result.resources.map((resource) => resource.state),
      ["merged", "merged"]
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.delivery,
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
    assert.ok(reviewRecord);
    assert.equal(reviewRecord.status, "skipped");
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.delivery,
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
  }
  {
    const { result } = await runWorkflowSample(
      samplePaths.delivery,
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
    assert.ok(implementRecord);
    assert.equal(implementRecord.status, "failed");
    const publishRecord = result.phaseEvidence.find(
      (record) => record.title === "Publish"
    );
    assert.ok(publishRecord);
    assert.equal(publishRecord.status, "skipped");
  }
  await assert.rejects(
    async () =>
      await runWorkflowSample(
        samplePaths.delivery,
        { issue: "", task: "t" },
        dispatchTable({ Scope: () => scopeResult })
      ),
    {
      message: "Provide args.issue as a nonempty issue reference when supplied"
    }
  );
});

void test("delivery workflow samples reject unsafe ownership and contradictory evidence", async () => {
  await Promise.all(
    [absoluteUnits, escapingUnits, nestedUnits].map(async (planPayload) => {
      const { calls, result } = await runWorkflowSample(
        samplePaths.delivery,
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
      assert.ok(planRecord);
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
    [badOwnership, legacySummary, skippedCheck].map(async (payload) => {
      const { result } = await runWorkflowSample(
        samplePaths.delivery,
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
      assert.ok(implementRecord);
      assert.equal(implementRecord.status, "failed");
      const publishRecord = result.phaseEvidence.find(
        (record) => record.title === "Publish"
      );
      assert.ok(publishRecord);
      assert.equal(publishRecord.status, "skipped");
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
      [integrateUnmerged, ["implemented", "implemented"]],
      [integrateConflicted, ["implemented", "implemented"]],
      [integratePartialFailure, ["merged", "failed"]],
      [integratePartialLedger, ["implemented", "implemented"]],
      [integrateWrongBranch, ["implemented", "implemented"]],
      [integrateDuplicate, ["implemented", "implemented"]],
      [integrateNoChecks, ["merged", "merged"]],
      [integrateRetained, ["implemented", "implemented"]],
      [null, ["implemented", "implemented"]]
    ].map(async ([payload, states]) => {
      const { result } = await runWorkflowSample(
        samplePaths.delivery,
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
      assert.ok(integrateRecord);
      assert.equal(integrateRecord.status, "failed");
      assert.deepEqual(
        result.resources.map((resource) => resource.state),
        states
      );
      assert.equal(
        result.phaseEvidence.find((record) => record.title === "Publish")
          ?.status,
        "skipped"
      );
    })
  );
});

void test("delivery workflow samples carry named candidates and per-key repair evidence", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
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
  assert.ok(implementRecord);
  assert.equal(implementRecord.status, "failed");
  assert.deepEqual(
    result.resources.find((resource) => resource.key === "u1"),
    { branch: "unit-u1", key: "u1", startRef: "wrong-ref", state: "attempted" }
  );
  const repairRun = await runWorkflowSample(
    samplePaths.delivery,
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
    )?.status,
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
    repairRun.result.resources.find((resource) => resource.key === "u2")?.state,
    "merged"
  );
  assert.equal(
    repairRun.calls.filter((call) => call.phase === "Publish").length,
    1
  );
  const candidateRun = await runWorkflowSample(
    samplePaths.delivery,
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
  assert.equal(candidateRun.result.complete, false);
  const candidateRecord = candidateRun.result.phaseEvidence.find(
    (record) => record.title === "Implement"
  );
  assert.ok(candidateRecord);
  assert.equal(candidateRecord.status, "failed");
  assert.deepEqual(candidateRun.result.resources, [
    {
      branch: "unit-u1",
      key: "u1",
      startRef: "task-branch",
      state: "attempted"
    }
  ]);
  const multiRun = await runWorkflowSample(
    samplePaths.delivery,
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
    samplePaths.delivery,
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
    samplePaths.delivery,
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
  assert.ok(missingRecord);
  assert.equal(missingRecord.status, "failed");
  assert.deepEqual(missingRun.result.resources, []);
});

void test("delivery samples validate integration destination and verify findings before repairs", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const { calls, result } = await runWorkflowSample(
        file,
        { candidateBranch: "other-task", issue: "#1", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: (options) => ({
            ...splitImplement(options),
            startRef: "other-task"
          }),
          Integrate: () => integrateResult,
          Plan: () => splitUnits,
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

void test("delivery samples gate repairs on independent finding dispositions", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      /** @type {[{evidence: string, id: string, status: string}[] | null, boolean, number][]} */
      const cases = [
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
      ];
      await Promise.all(
        cases.map(async ([dispositions, expectedComplete, expectedRepairs]) => {
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
          const [{ verification }] = result.reviewHistory;
          assert.ok(isObject(verification));
          assert.deepEqual(verification.dispositions, dispositions);
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
      assert.ok(reviewRecord);
      assert.equal(reviewRecord.status, "failed");
      assert.equal(unowned.result.fixRounds.used, 0);
      for (const phase of ["Implement", "Publish", "Review"]) {
        assert.equal(
          unowned.calls.filter((call) => call.phase === phase).length,
          1
        );
      }
    })
  );
});

void test("delivery samples reject invalid integration path evidence and base destinations", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      await Promise.all(
        [["../outside"], ["src/other.js"], null].map(async (changedFiles) => {
          const { calls, result } = await runWorkflowSample(
            file,
            { candidateBranch: "task-branch", issue: "#1", task: "t" },
            dispatchTable({
              Explore: () => exploreResult,
              Implement: splitImplement,
              Integrate: () => ({ ...integrateResult, changedFiles }),
              Plan: () => splitUnits,
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
          Scope: () => ({ ...scopeResult, baseBranch: "task-branch" })
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

void test("multi-unit delivery routes only independently confirmed findings to their owner", async () => {
  const findings = [
    { detail: "first", file: "docs/guide.md", scenario: "first trigger" },
    { detail: "second", file: "src/main.js", scenario: "second trigger" }
  ];
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
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
    ({ label }) =>
      label === "implement:u1:fix-1" || label === "implement:u2:fix-1"
  );
  assert.deepEqual(
    repairs.map(({ label }) => label),
    ["implement:u1:fix-1"]
  );
  const [{ verification }] = result.reviewHistory;
  assert.ok(isObject(verification) && isArray(verification.dispositions));
  assert.equal(verification.dispositions.length, 2);
});

void test("delivery samples reject malformed findings and preserve review evidence", async () => {
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

void test("delivery finding verification independently selects its model", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      [
        {},
        { review: "review-selector" },
        { review: "review-selector", verify: "verify-selector" }
      ].map(async (models) => {
        const efforts = Object.fromEntries(
          Object.keys(models).map((phase) => [phase, `effort-${phase}`])
        );
        const { calls } = await runWorkflowSample(
          file,
          {
            candidateBranch: "task-branch",
            efforts,
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
        assert.ok(review);
        const verification = calls.find(({ phase }) => phase === "Verify");
        assert.ok(verification);
        assert.equal(review.effort, efforts.review);
        assert.equal(review.effortProvided, efforts.review !== undefined);
        assert.equal(verification.effort, efforts.verify);
        assert.equal(verification.effortProvided, efforts.verify !== undefined);
        assert.equal(review.model, models.review);
        assert.equal(review.modelProvided, models.review !== undefined);
        assert.equal(verification.model, models.verify);
        assert.equal(verification.modelProvided, models.verify !== undefined);
      })
    )
  );
});

void test("delivery samples validate the verification model selector", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      ["", "  ", null, 42].map(async (verify) => {
        await assert.rejects(
          runWorkflowSample(file, { models: { verify }, task: "t" }, () =>
            assert.fail("Invalid model selector dispatched an agent")
          ),
          {
            message: "Provide models.verify as a nonempty model selector string"
          }
        );
      })
    )
  );
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      await assert.rejects(
        runWorkflowSample(file, { efforts: { verify: " " }, task: "t" }, () =>
          assert.fail("Invalid effort selector dispatched an agent")
        ),
        { message: "Provide efforts.verify as a nonempty effort string" }
      );
    })
  );
});

void test("delivery samples append each phase's prompt part as its final section", async () => {
  /** @type {Record<string, string>} */
  const promptParts = {
    explore: "explore part",
    implement: "implement part",
    integrate: "integrate part",
    plan: "plan part",
    publish: "publish part",
    review: "review part",
    scope: "scope part",
    sweep: "sweep part"
  };
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const { calls } = await runWorkflowSample(
        file,
        { candidateBranch: "task-branch", promptParts, task: "t" },
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
      assert.deepEqual(
        calls.map(({ phase, prompt }) => [phase, prompt.split("\n\n").at(-1)]),
        calls.map(({ phase }) => [
          phase,
          promptParts[phase === "Verify" ? "review" : phase.toLowerCase()]
        ])
      );
      await assert.rejects(
        runWorkflowSample(
          file,
          { promptParts: { review: " " }, task: "t" },
          () => assert.fail("Invalid prompt part dispatched an agent")
        ),
        {
          message: "Provide promptParts.review as a nonempty instruction string"
        }
      );
    })
  );
});

void test("delivery samples pass candidate, issue, request, and owned findings into prompt sections", async () => {
  const findings = [
    { detail: "first", file: "docs/guide.md", scenario: "first trigger" },
    { detail: "second", file: "src/main.js", scenario: "second trigger" }
  ];
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
      const reviewed = findings;
      const { calls, result } = await runWorkflowSample(
        file,
        { candidateBranch: "task-branch", issue: "#1", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: splitImplement,
          Integrate: () => integrateResult,
          Plan: () => splitUnits,
          Publish: sequence(publishCreated, publishUpdated),
          Review: sequence(
            { evidence: "e", findings: reviewed, verdict: "fix-required" },
            reviewPass
          ),
          Scope: () => scopeResult,
          Sweep: () => sweepResult,
          Verify: () => ({
            dispositions: reviewed.map((_finding, index) => ({
              evidence: "Confirmed in source",
              id: `review-1-finding-${index + 1}`,
              status: "confirmed"
            }))
          })
        })
      );
      assert.equal(result.complete, true);
      assert.equal(result.sweepEvidence, sweepResult.evidence);
      assert.deepEqual(result.explorations, [
        { evidence: "e", key: "s1", risks: ["r"], summary: "s" }
      ]);
      assert.equal(
        calls
          .find(({ phase }) => phase === "Plan")
          ?.prompt.split("\n\n")
          .find((section) =>
            section.startsWith("Scopes and exploration findings: ")
          ),
        `Scopes and exploration findings: ${JSON.stringify({
          explorations: [
            { evidence: "e", key: "s1", risks: ["r"], summary: "s" }
          ],
          scopes: scopeResult.scopes
        })}`
      );
      /** @param {string} text Prompt section. */
      const owns = (text) =>
        calls
          .filter((call) => call.prompt.split("\n\n").includes(text))
          .map(({ label }) => label);
      assert.deepEqual(
        owns("Candidate branch: task-branch"),
        calls
          .filter(({ phase }) => phase === "Sweep" || phase === "Publish")
          .map(({ label }) => label)
      );
      assert.deepEqual(
        owns("Linked issue reference: #1"),
        calls
          .filter(({ phase }) =>
            ["Publish", "Review", "Verify"].includes(phase)
          )
          .map(({ label }) => label)
      );
      const publishes = calls.filter(({ phase }) => phase === "Publish");
      assert.deepEqual(
        owns(
          "Update the existing open request at https://example.invalid/pr/1 with the fixed change instead of creating another request."
        ),
        [publishes[1].label]
      );
      assert.deepEqual(
        reviewed.map((finding, index) =>
          owns(
            `Fix these review findings inside your owned paths: ${JSON.stringify(
              [{ ...finding, id: `review-1-finding-${index + 1}` }]
            )}`
          )
        ),
        reviewed.map((_finding, index) => [`implement:u${index + 1}:fix-1`])
      );
    })
  );
});

void test("delivery graph adapts single-unit candidates and records conditional integration evidence", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: () => simpleImplement,
      Plan: () => singleUnits,
      Publish: () => publishCreated,
      Review: () => reviewPass,
      Scope: () => scopeResult,
      Sweep: () => sweepResult
    })
  );
  assert.equal(result.complete, true);
  assert.equal(result.split, false);
  assert.equal(calls.filter(({ phase }) => phase === "Integrate").length, 0);
  assert.deepEqual(result.integration, {
    branch: "unit-u1",
    reason:
      "The plan defines a single work unit, so no cross-unit integration is required",
    status: "skipped"
  });
  const integration = result.graph.nodes.find(({ key }) => key === "integrate");
  assert.ok(integration);
  assert.equal(integration.status, "skipped");
  assert.equal(integration.reason, result.integration.reason);
  const evidence = integration.completionEvidence.at(-1);
  assert.ok(evidence);
  assert.deepEqual(evidence.result, result.integration);
  assert.deepEqual(result.resources, [
    {
      branch: "unit-u1",
      key: "u1",
      startRef: "task-branch",
      state: "implemented"
    }
  ]);
  for (const phase of ["Sweep", "Publish"]) {
    assert.equal(
      calls
        .find((call) => call.phase === phase)
        ?.prompt.split("\n\n")
        .find((section) => section.startsWith("Candidate branch: ")),
      "Candidate branch: unit-u1"
    );
  }
  const explicitSkip = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", skips: { integrate: true }, task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: () => simpleImplement,
      Plan: () => singleUnits,
      Scope: () => scopeResult
    })
  );
  assert.equal(explicitSkip.result.complete, false);
  assert.equal(
    explicitSkip.calls.some(({ phase }) => phase === "Publish"),
    false
  );
});

void test("delivery graph exposes node contracts and condition edges", async () => {
  await Promise.all(
    [false, true].map(async (split) => {
      const { result } = await runWorkflowSample(
        samplePaths.delivery,
        { candidateBranch: "task-branch", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: split
            ? splitImplement
            : sequence(simpleImplement, simpleRepair),
          Integrate: () => (split ? integrateResult : integrateSingle),
          Plan: () => (split ? splitUnits : singleUnits),
          Publish: sequence(publishCreated, publishUpdated),
          Review: sequence(reviewFix, reviewPass),
          Scope: () => scopeResult,
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, true);
      const nodes = new Map(result.graph.nodes.map((node) => [node.key, node]));
      assert.equal(nodes.size, result.graph.nodes.length);
      for (const node of nodes.values()) {
        for (const field of [
          "key",
          "operation",
          "prerequisites",
          "inputs",
          "outputs",
          "owner",
          "authority",
          "completionEvidence",
          "status",
          "reason"
        ]) {
          assert.equal(Object.hasOwn(node, field), true);
        }
        assert.equal(
          ["completed", "skipped", "failed"].includes(node.status),
          true
        );
        assert.equal(node.completionEvidence.length > 0, true);
        assert.deepEqual(
          node.prerequisites,
          result.graph.edges
            .filter(({ to }) => to === node.key)
            .map(({ from }) => from)
        );
      }
      for (const edge of result.graph.edges) {
        assert.equal(nodes.has(edge.from) && nodes.has(edge.to), true);
        assert.equal(["result", "condition"].includes(edge.type), true);
        assert.equal(
          edge.type === "condition"
            ? typeof edge.condition === "string"
            : edge.condition === null,
          true
        );
      }
      assert.equal(nodes.get("verify-findings:1")?.status, "completed");
      assert.deepEqual(nodes.get("implement:u1:fix-1")?.prerequisites, [
        "plan",
        "review",
        "verify-findings:1"
      ]);
    })
  );
});
