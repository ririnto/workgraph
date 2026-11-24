import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { lint } from "markdownlint/sync";

import noEmDash from "../rules/no-em-dash.ts";
import noRelativeSkillLinks from "../rules/no-relative-skill-links.ts";
import proseFormat from "../rules/prose-format.ts";
import skillFrontmatter from "../rules/skill-frontmatter.ts";
import tableSeparators from "../rules/table-separators.ts";

/**
 * @param {unknown} value Parsed JSON value.
 * @returns {value is Record<string, unknown>} Whether the value is an object.
 */
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * @param {unknown} value Parsed JSON value.
 * @returns {value is unknown[]} Whether the value is an array.
 */
const isArray = (value) => Array.isArray(value);

await test("Git hooks invoke Corepack pnpm and propagate its status", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "workgraph-hooks-"));
  try {
    await writeFile(
      path.join(directory, "corepack"),
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
        assert.equal(result.stdout, `pnpm\nrun\n${hook}\n`);
      }
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

await test("prose formatting checks sentences and preserves Markdown syntax", () => {
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

await test("em-dash rule checks prose and preserves code and links", () => {
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

await test("skill links preserve bundled links and flag external relative targets", () => {
  const filename = "skills/sample/references/guide.md";
  const errors =
    lint({
      config: { default: false, "docs/no-relative-skill-links": true },
      customRules: [noRelativeSkillLinks],
      strings: {
        [filename]: [
          "# Guide",
          "",
          "[Bundled](../SKILL.md#usage)",
          "[External](https://example.com/skills/another/SKILL.md)",
          "[Outside](../../../examples/skill/%53KILL.md?view=1)",
          "",
          "[outside]: ../../../examples/other/SKILL.md",
          "",
          "> [Quoted](../../../examples/quoted/SKILL.md)",
          "",
          "> [!NOTE]",
          "> [Alert](../../../examples/alert/SKILL.md)"
        ].join("\n")
      }
    })[filename] ?? [];
  assert.deepEqual(
    errors.map(({ lineNumber }) => lineNumber),
    [5, 7, 12]
  );
});

await test("skill frontmatter validates bundled YAML mappings with no fix", () => {
  const errors = lint({
    config: { default: false, "docs/skill-frontmatter": true },
    customRules: [skillFrontmatter],
    strings: {
      "examples/outside/SKILL.md": "# External example\n",
      "skills/alias/SKILL.md":
        "---\nname: &name alias\nmetadata:\n  short: *name\n---\n# Alias\n",
      "skills/duplicate/SKILL.md":
        "---\nname: duplicate\nname: other\n---\n# Duplicate\n",
      "skills/missing/SKILL.md": "# Missing\n",
      "skills/sequence/SKILL.md": "---\n- sequence\n---\n# Sequence\n",
      "skills/unresolved/SKILL.md": "---\nname: *missing\n---\n# Unresolved\n"
    }
  });
  assert.deepEqual(
    Object.entries(errors).map(([name, findings]) => [
      name,
      findings.map(({ errorDetail, fixInfo, lineNumber }) => [
        lineNumber,
        errorDetail,
        fixInfo
      ])
    ]),
    [
      ["examples/outside/SKILL.md", []],
      ["skills/alias/SKILL.md", []],
      [
        "skills/duplicate/SKILL.md",
        [[3, "Expected valid YAML with unique keys and defined aliases.", null]]
      ],
      ["skills/missing/SKILL.md", [[1, "Expected YAML frontmatter.", null]]],
      ["skills/sequence/SKILL.md", [[1, "Expected a YAML mapping.", null]]],
      [
        "skills/unresolved/SKILL.md",
        [[2, "Expected valid YAML with unique keys and defined aliases.", null]]
      ]
    ]
  );
});

await test("table separator traversal handles deeply nested blockquotes", () => {
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

await test("table separator diagnostics retain fix information", () => {
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

await test("box drawing rule covers all Markdown with first UTF-16 match and no fix", async () => {
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
          /fixture\.md:(?<line>\d+):(?<column>\d+) error search-replace /gu
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

/**
 * @param {import("node:test").TestContext} t Test that owns the fixture.
 * @returns {Promise<string>} Directory with the real Ultracite configuration.
 */
const createUltraciteFixture = async (t) => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = await mkdtemp(path.join(tmpdir(), "ultracite-fixture-"));
  t.after(async () => {
    await rm(directory, { force: true, recursive: true });
  });
  await Promise.all(
    [
      "oxlint.config.ts",
      "oxfmt.config.ts",
      "plugins",
      "skills/development/assets/lint"
    ].map(async (entry) => {
      await cp(path.join(root, entry), path.join(directory, entry), {
        recursive: true
      });
    })
  );
  await symlink(
    path.join(root, "node_modules"),
    path.join(directory, "node_modules")
  );
  return directory;
};

/**
 * @param {string} directory Fixture checkout.
 * @param {string[]} files Paths to check.
 * @returns {{diagnostics: unknown[], status: number | null}} Lint diagnostics and exit status.
 */
const runUltraciteFixture = (directory, files) => {
  const result = spawnSync(
    process.execPath,
    [
      path.resolve(
        import.meta.dirname,
        "../node_modules/ultracite/dist/index.js"
      ),
      "check",
      ...files,
      "--format",
      "json"
    ],
    { cwd: directory, encoding: "utf-8", timeout: 30_000 }
  );
  assert.ifError(result.error);
  const start = result.stdout.search(/\{\s*"diagnostics"\s*:/u);
  assert.notEqual(start, -1, result.stdout + result.stderr);
  /** @type {unknown} */
  const output = JSON.parse(
    result.stdout.slice(start, result.stdout.lastIndexOf("}") + 1)
  );
  assert.ok(isObject(output));
  assert.ok(isArray(output.diagnostics));
  return { diagnostics: output.diagnostics, status: result.status };
};

await test("Ultracite checks function spacing and adjacent node:test registrations", async (t) => {
  const directory = await createUltraciteFixture(t);
  const nonmatching =
    'import { describe, test } from "node:test";\n\ndescribe("suite", () => {\n  test("one", () => {});\n\n  test("two", () => {});\n});\n';
  const matching = nonmatching
    .replace('test("one", () => {});\n\n', 'test("one", () => {});\n')
    .replace(
      'test("two", () => {});',
      'test("two", () => {\n    const count = 1;\n\n    console.info(count);\n  });'
    );
  await Promise.all([
    writeFile(path.join(directory, "nonmatching.test.mjs"), nonmatching),
    writeFile(path.join(directory, "matching.test.mjs"), matching)
  ]);
  const rules = new Set([
    "test-style(no-blank-lines-in-functions)",
    "test-style(sibling-test-spacing)"
  ]);
  for (const { filename, expected } of [
    { filename: "matching.test.mjs", expected: [...rules] },
    { filename: "nonmatching.test.mjs", expected: [] }
  ]) {
    const { diagnostics } = runUltraciteFixture(directory, [filename]);
    assert.deepEqual(
      diagnostics
        .flatMap((entry) =>
          isObject(entry) &&
          typeof entry.code === "string" &&
          rules.has(entry.code)
            ? [entry.code]
            : []
        )
        .toSorted(),
      expected
    );
  }
});

await test("TSDoc reports exposed TypeScript members once and excludes documented, private, and JavaScript members", async (t) => {
  const directory = await createUltraciteFixture(t);
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
  const { diagnostics, status } = runUltraciteFixture(directory, [
    "source.ts",
    "source.js"
  ]);
  assert.equal(status, 1);
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

await test("comment lint reports loose body and module comments once and honors language matching and ignores", async (t) => {
  const directory = await createUltraciteFixture(t);
  const extensions = ["js", "jsx", "mjs", "cjs", "ts", "tsx", "mts", "cts"];
  const matchingFiles = extensions.map((extension) => `matching.${extension}`);
  const nonmatchingFiles = extensions.map(
    (extension) => `nonmatching.${extension}`
  );
  const matching = `// Unattached module comment.
const makeLabels = (lengthLimit = 6) => {
  const names = [" North "];
  return names.map((value) => {
    // Copyright workaround needed.
    /*
     * Leave the old trimming path here.
     * Copyright appears after the first content line.
     */
    const label = value.trim();
    /** Unattached note about the return. */
    return label.slice(0, lengthLimit); // Stale note.
  });
};

makeLabels();
`;
  const nonmatching = `/** @typedef {string[]} Labels */
const makeLabels = (lengthLimit = 6) => {
  /** Prefixes are measured after trimming the name. */
  const names = [" North "];
  /* SPDX-License-Identifier: MIT */
  /* SPDX-FileCopyrightText: 2026 Example Authors */
  /* Copyright (C) Example Authors */
  /* © 2026 Example Authors */
  /**
   * Copyright 2026 Example Authors
   */
  /**
   * @license Example copyright notice.
   */
  /* c8 ignore next */
  return names.map((value) => {
    /** Bound used by the external protocol. */
    const limit = lengthLimit;
    return value.trim().slice(0, limit);
  });
};

makeLabels();
`;
  await mkdir(path.join(directory, "workflows"));
  await Promise.all(
    [...matchingFiles, ...nonmatchingFiles, "workflows/ignored.js"].map(
      async (file) => {
        await writeFile(
          path.join(directory, file),
          file.startsWith("nonmatching.") ? nonmatching : matching
        );
      }
    )
  );
  const { diagnostics, status } = runUltraciteFixture(directory, [
    ...matchingFiles,
    ...nonmatchingFiles,
    "workflows/ignored.js"
  ]);
  assert.equal(status, 1);
  const reportedFiles = diagnostics.flatMap((entry) => {
    assert.ok(isObject(entry));
    return entry.code === "comments(no-body-comments)" ? [entry.filename] : [];
  });
  assert.deepEqual(
    reportedFiles.toSorted((a, b) => String(a).localeCompare(String(b))),
    matchingFiles
      .flatMap((file) => [file, file, file, file, file])
      .toSorted((a, b) => a.localeCompare(b))
  );
});

await test("local Markdown comments config checks hidden notes and preserves literals and markers", async (t) => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = await mkdtemp(path.join(tmpdir(), "markdown-comments-"));
  t.after(async () => {
    await rm(directory, { force: true, recursive: true });
  });
  const assets = path.join(root, "skills/development/assets/lint");
  await mkdir(path.join(directory, "lint"));
  await Promise.all([
    cp(
      path.join(assets, "markdownlint-cli2.jsonc"),
      path.join(directory, ".markdownlint-cli2.jsonc")
    ),
    cp(
      path.join(assets, "markdown-comments.ts"),
      path.join(directory, "lint/markdown-comments.ts")
    ),
    symlink(
      path.join(root, "node_modules"),
      path.join(directory, "node_modules")
    ),
    writeFile(
      path.join(directory, "rejected.md"),
      [
        "# Rejected",
        "",
        "<!-- Copyright workaround needed. -->",
        "",
        "A hidden <!-- dead --> path.",
        "",
        "> <!-- Old",
        "> branch. -->",
        "",
        "[//]: # (Hidden note)",
        ""
      ].join("\n")
    ),
    writeFile(
      path.join(directory, "accepted.md"),
      [
        "# Accepted",
        "",
        "<!-- SPDX-License-Identifier: MIT -->",
        "",
        "<!-- SPDX-FileCopyrightText: 2026 Example Authors -->",
        "",
        "<!-- Copyright (C) Example Authors -->",
        "",
        "<!-- © 2026 Example Authors -->",
        "",
        "<!--",
        "Copyright 2026 Example Authors",
        "-->",
        "",
        "<!-- markdownlint-disable-next-line MD013 -->",
        "Example: `<!-- inline example -->`.",
        "",
        "```html",
        "<!-- fenced example -->",
        "```",
        ""
      ].join("\n")
    )
  ]);
  const command = path.join(
    root,
    "node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs"
  );
  const accepted = spawnSync(
    process.execPath,
    [command, "--no-globs", "accepted.md"],
    {
      cwd: directory,
      encoding: "utf-8"
    }
  );
  assert.ifError(accepted.error);
  assert.equal(accepted.status, 0, accepted.stderr);
  const rejected = spawnSync(
    process.execPath,
    [command, "--no-globs", "rejected.md"],
    {
      cwd: directory,
      encoding: "utf-8"
    }
  );
  assert.ifError(rejected.error);
  assert.equal(rejected.status, 1, rejected.stderr);
  assert.deepEqual(
    rejected.stderr
      .trim()
      .split("\n")
      .map((line) => line.split(" ").slice(0, 3)),
    [
      ["rejected.md:3", "error", "comments/no-hidden-notes"],
      ["rejected.md:5", "error", "comments/no-hidden-notes"],
      ["rejected.md:7", "error", "comments/no-hidden-notes"],
      ["rejected.md:10:1", "error", "MD053/link-image-reference-definitions"]
    ]
  );
});

/** @typedef {{result: unknown} & Record<string, unknown>} CompletionEvidence */
/** @typedef {{key: string, status: string, reason: unknown, prerequisites: string[], completionEvidence: CompletionEvidence[]} & Record<string, unknown>} WorkflowNode */
/** @typedef {{from: string, to: string, type: string, condition: unknown}} WorkflowEdge */
/** @typedef {{title: string, status: string} & Record<string, unknown>} PhaseEvidence */
/** @typedef {{key: string, state: string} & Record<string, unknown>} WorkflowResource */
/** @typedef {{key: string, branch: unknown, paths: unknown} & Record<string, unknown>} WorkflowUnit */
/** @typedef {{complete: boolean, earlyExit: unknown, split: boolean, graph: {nodes: WorkflowNode[], edges: WorkflowEdge[]}, phaseEvidence: PhaseEvidence[], resources: WorkflowResource[], units: WorkflowUnit[], review: Record<string, unknown>, reviewHistory: Record<string, unknown>[], integration: Record<string, unknown>, fixRounds: {max: number, used: number}, publish: unknown, explorations: unknown[], sweepEvidence: unknown}} WorkflowResult */

/**
 * @param {unknown} value Workflow node.
 * @returns {value is WorkflowNode} Whether the node has the fields used by the tests.
 */
const isWorkflowNode = (value) =>
  isObject(value) &&
  typeof value.key === "string" &&
  typeof value.status === "string" &&
  "reason" in value &&
  isArray(value.prerequisites) &&
  value.prerequisites.every((item) => typeof item === "string") &&
  isArray(value.completionEvidence) &&
  value.completionEvidence.every((item) => isObject(item) && "result" in item);

/**
 * @param {unknown} value Workflow edge.
 * @returns {value is WorkflowEdge} Whether the edge has the fields used by the tests.
 */
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

/**
 * @param {string} file Workflow source path.
 * @returns {Function} Callable workflow sample.
 */
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

/**
 * @param {Record<string, (options: AgentOptions) => unknown>} table Phase handlers.
 * @returns {(options: AgentOptions) => unknown} Agent handler.
 */
const dispatchTable = (table) => {
  let lastReview = 0;
  /** @type {string | null} */
  let headBranch = null;
  /**
   * @param {AgentOptions} options Agent dispatch options.
   * @returns {unknown} Payload for the requested phase.
   */
  const dispatch = (options) => {
    if (options.label.startsWith("verify-findings:")) {
      return table.Verify === undefined
        ? {
            baseCommit: sampleBase,
            commit: sampleCommit,
            dispositions: Array.from({ length: lastReview }, (_, index) => ({
              evidence: "independently checked",
              id: `review-${options.label.split(":").at(-1)}-finding-${index + 1}`,
              status: "confirmed"
            }))
          }
        : table.Verify(options);
    }
    const entry = table[options.phase];
    if (entry === undefined) {
      throw new Error(`unexpected phase ${options.phase}`);
    }
    const result = entry(options);
    if (
      ["Implement", "Integrate"].includes(options.phase) &&
      isObject(result) &&
      typeof result.branch === "string"
    ) {
      headBranch = result.branch;
    }
    if (options.phase === "Publish" && isObject(result)) {
      return { headBranch, ...result };
    }
    if (
      options.phase === "Review" &&
      isObject(result) &&
      isArray(result.findings)
    ) {
      lastReview = result.findings.length;
    }
    return result;
  };
  return dispatch;
};
/**
 * @param {...unknown} payloads Responses to return in order.
 * @returns {() => unknown} Function returning the next response.
 */
const sequence = (...payloads) => {
  let served = 0;
  return () => {
    const payload = payloads[Math.min(served, payloads.length - 1)];
    served += 1;
    return payload;
  };
};
/**
 * @param {string} file Workflow source.
 * @param {Record<string, unknown>} args Workflow input.
 * @param {(options: AgentOptions) => unknown} payloadFor Agent response factory.
 * @returns {Promise<{calls: {agentType: unknown, effort: unknown, effortProvided: boolean, isolation: unknown, label: string, model: unknown, modelProvided: boolean, phase: string, prompt: string}[], result: WorkflowResult}>} Workflow outcome and observed agent calls.
 */
const runWorkflowSample = async (file, args, payloadFor) => {
  /** @type {{agentType: unknown, effort: unknown, effortProvided: boolean, isolation: unknown, label: string, model: unknown, modelProvided: boolean, phase: string, prompt: string}[]} */
  const calls = [];
  const environment = {
    /**
     * @param {string} prompt Agent prompt.
     * @param {AgentOptions} options Agent dispatch options.
     * @returns {Promise<unknown>} Simulated agent payload.
     */
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
      return await Promise.resolve(payloadFor(options));
    },
    budget: { remaining: () => Infinity, spent: () => 0, total: null },
    log: () => null,
    /**
     * @param {(() => Promise<unknown>)[]} thunks Work items.
     * @returns {Promise<unknown[]>} Completed work in invocation order.
     */
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
    { repository: sampleRepository, ...args },
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
const sampleBase = "a".repeat(40);
const sampleCommit = "b".repeat(40);
const sampleRepository = "example.invalid/team/project";
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
  commit: sampleCommit,
  diffSummary: "d",
  evidence: "e",
  startCommit: sampleCommit,
  startRef: "task-branch"
};
const simpleRepair = {
  ...simpleImplement,
  branch: "unit-u1-fix",
  startRef: "unit-u1"
};
/**
 * @param {AgentOptions} options Agent dispatch options.
 * @returns {typeof simpleImplement} Implementation payload for the selected unit.
 */
const splitImplement = (options) => {
  const secondUnit = options.label.startsWith("implement:u2");
  const repair = options.label.includes(":fix-");
  return {
    ...simpleImplement,
    branch: secondUnit ? "unit-u2" : "unit-u1",
    changedFiles: secondUnit ? ["src/main.js"] : ["docs/guide.md"],
    checks: [
      {
        command: repair ? "check-u1-fixed" : `check-u${secondUnit ? 2 : 1}`,
        status: "passed"
      }
    ]
  };
};
/**
 * @param {AgentOptions} options Agent dispatch options.
 * @returns {typeof simpleImplement} Implementation payload with the selected starting ref.
 */
const wrongStart = (options) => {
  const result = splitImplement(options);
  return options.label.includes(":fix-")
    ? { ...result, startRef: "wrong-ref" }
    : result;
};
/**
 * @param {AgentOptions} options Agent dispatch options.
 * @returns {typeof simpleImplement} Implementation payload with a failed repair when requested.
 */
const failedRepair = (options) =>
  options.label.includes(":fix-")
    ? {
        ...splitImplement(options),
        branch: "unit-u1-r2",
        checks: [{ command: "check-failed", status: "failed" }]
      }
    : splitImplement(options);
/**
 * @param {AgentOptions} options Agent dispatch options.
 * @returns {typeof simpleImplement} Implementation payload for the current attempt.
 */
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
  commit: sampleCommit,
  conflicts: [],
  evidence: "e",
  merged: true,
  startCommit: sampleCommit,
  resources: [
    { branch: "unit-u1", key: "u1", state: "merged" },
    { branch: "unit-u2", key: "u2", state: "merged" }
  ]
};
const integrateSingle = {
  branch: "unit-u1",
  changedFiles: ["docs/guide.md"],
  checks: [{ command: "pnpm run check:test", status: "passed" }],
  commit: sampleCommit,
  conflicts: [],
  evidence: "e",
  merged: true,
  startCommit: sampleCommit,
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
const sweepResult = {
  baseCommit: sampleBase,
  commit: sampleCommit,
  coverage: "complete",
  evidence: "e",
  exposures: []
};
const publishCreated = {
  action: "created",
  baseBranch: "main",
  baseCommit: sampleBase,
  commit: sampleCommit,
  evidence: "e",
  repository: sampleRepository,
  url: "https://example.invalid/pr/1"
};
const publishUpdated = {
  ...publishCreated,
  action: "updated"
};
const reviewFix = {
  baseCommit: sampleBase,
  commit: sampleCommit,
  coverage: "complete",
  evidence: "e",
  findings: [{ detail: "d", file: "docs/guide.md", scenario: "s" }],
  verdict: "fix-required"
};
const reviewPass = { ...reviewFix, findings: [], verdict: "pass" };

await test("delivery preserves a posted request after repair failures", async () => {
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

await test("delivery rejects a unit branch equal to the resolved default base", async () => {
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

await test("delivery rejects a repair reported on the posted head", async () => {
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

await test("delivery integrates a distinct repair branch into the posted single-unit head", async () => {
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

await test("delivery samples reject a passing review with unresolved findings", async () => {
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

await test("delivery samples fail a fix-required review without findings", async () => {
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

await test("delivery dispatches and records per-phase model selections", async () => {
  await Promise.all(
    [
      {},
      { explore: "sonnet", plan: "haiku" },
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
      const { calls, result } = await runWorkflowSample(
        samplePaths.delivery,
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
          Explore: models.explore ?? "haiku",
          Implement: models.implement,
          Integrate: models.integrate ?? "sonnet",
          Plan: models.plan ?? "sonnet",
          Publish: models.publish ?? "haiku",
          Review: models.review,
          Scope: models.scope,
          Sweep: models.sweep ?? "haiku"
        }
      );
      assert.deepEqual(
        Object.fromEntries(calls.map((call) => [call.phase, call.effort])),
        Object.fromEntries(
          calls.map((call) => [call.phase, efforts[call.phase.toLowerCase()]])
        )
      );
      for (const call of calls) {
        const inputs = result.graph.nodes.find(
          (node) => node.key === call.label
        )?.inputs;
        assert.ok(isObject(inputs));
        const defaultSource = call.modelProvided ? "workflow-default" : "host";
        assert.deepEqual(inputs.modelSelection, {
          requestedModel: call.model ?? null,
          source: Object.hasOwn(models, call.phase.toLowerCase())
            ? "argument"
            : defaultSource
        });
        assert.equal(call.effortProvided, call.effort !== undefined);
        assert.equal(call.modelProvided, call.model !== undefined);
      }
    })
  );
});

await test("delivery workflow samples allow explicitly omitted exploration", async () => {
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

await test("delivery can finish at Explore or Plan when the whole goal needs no change", async () => {
  const settled = {
    evidence: "The original trigger passes.",
    risks: [],
    stopReason: "Already fixed",
    summary: "Resolved"
  };
  const open = { ...exploreResult, risks: [] };
  const scope = {
    ...scopeResult,
    scopes: [
      ...scopeResult.scopes,
      { description: "Second area", key: "s2", paths: ["src"] }
    ]
  };
  const plan = {
    evidence: "The reported behavior is required.",
    stopReason: "Invalid report",
    units: []
  };
  /** @type {[typeof open, { evidence: string, units: unknown[], stopReason?: string }, string | null][]} */
  const cases = [
    [settled, plan, "Explore"],
    [open, plan, "Plan"],
    [open, { evidence: "No decision", units: [] }, null],
    [open, { ...plan, units: singleUnits.units }, null]
  ];
  await Promise.all(
    cases.map(async ([second, decision, expectedPhase]) => {
      const { calls, result } = await runWorkflowSample(
        samplePaths.delivery,
        { task: "Assess the reported issue" },
        dispatchTable({
          Scope: () => scope,
          Explore: sequence(settled, second),
          Plan: () => decision
        })
      );
      assert.deepEqual(
        calls.map(({ phase }) => phase),
        expectedPhase === "Explore"
          ? ["Scope", "Explore", "Explore"]
          : ["Scope", "Explore", "Explore", "Plan"]
      );
      assert.equal(result.complete, expectedPhase !== null);
      assert.equal(result.publish, null);
      if (expectedPhase === null) {
        assert.equal(result.earlyExit, null);
        assert.equal(
          result.phaseEvidence.find((record) => record.title === "Plan")
            ?.status,
          "failed"
        );
      } else {
        assert.ok(isObject(result.earlyExit));
        assert.equal(result.earlyExit.phase, expectedPhase);
        assert.deepEqual(
          result.earlyExit.evidence,
          expectedPhase === "Plan"
            ? [{ key: "plan", evidence: plan.evidence }]
            : scope.scopes.map(({ key }) => ({
                key,
                reason: settled.stopReason,
                evidence: settled.evidence
              }))
        );
        const stop = result.phaseEvidence.findIndex(
          (record) => record.title === expectedPhase
        );
        assert.ok(
          result.phaseEvidence
            .slice(stop + 1)
            .every((record) => record.status === "skipped")
        );
      }
    })
  );
});

await test("delivery reuses a scope supplied by Main without a Scope agent", async () => {
  const scope = { evidence: scopeResult.evidence, scopes: scopeResult.scopes };
  const cases = [
    { scope },
    { skips: { scope: true }, scope },
    { skips: { scope: true } },
    { scope: { ...scope, baseBranch: "other" } }
  ];
  const [provided, explicit, missing, conflicting] = await Promise.all(
    cases.map(
      async (args) =>
        await runWorkflowSample(
          samplePaths.delivery,
          { task: "Assess parsing", baseBranch: "main", ...args },
          dispatchTable({
            Explore: () => exploreResult,
            Plan: () => ({
              evidence: "The trigger passes.",
              stopReason: "Already fixed",
              units: []
            })
          })
        )
    )
  );
  for (const accepted of [provided, explicit]) {
    assert.deepEqual(
      accepted.calls.map(({ phase }) => phase),
      ["Explore", "Plan"]
    );
    assert.equal(accepted.result.complete, true);
    const node = accepted.result.graph.nodes.find(({ key }) => key === "scope");
    assert.deepEqual(node?.completionEvidence.at(-1)?.result, {
      ...scope,
      baseBranch: "main",
      source: "argument"
    });
  }
  for (const blocked of [missing, conflicting]) {
    assert.deepEqual(blocked.calls, []);
    assert.equal(blocked.result.complete, false);
  }
});

await test("delivery workflow samples stop planning when exploration fails", async () => {
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

await test("delivery workflow samples preserve post-then-review ordering and honest phase records", async () => {
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
    assert.equal(calls.filter(({ label }) => label === "review").length, 2);
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
          ...publishCreated,
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
    assert.equal(calls.filter(({ label }) => label === "review").length, 1);
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
    assert.equal(calls.filter(({ label }) => label === "review").length, 2);
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

await test("delivery workflow samples reject unsafe ownership and contradictory evidence", async () => {
  await Promise.all(
    [absoluteUnits, nestedUnits].map(async (planPayload) => {
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
  const external = await runWorkflowSample(
    samplePaths.delivery,
    { task: "Update the sibling project" },
    dispatchTable({
      Scope: () => ({ ...scopeResult, checkoutRoot: "/workspace/project" }),
      Explore: () => exploreResult,
      Plan: () => ({
        ...singleUnits,
        units: [{ ...singleUnits.units[0], paths: ["docs/../../shared"] }]
      })
    })
  );
  assert.deepEqual(
    external.calls.map((call) => call.phase),
    ["Scope", "Explore", "Plan"]
  );
  assert.equal(external.result.complete, false);
  assert.equal(external.result.publish, null);
  assert.deepEqual(external.result.units[0].paths, ["../shared"]);
  assert.ok(isObject(external.result.earlyExit));
  assert.equal(external.result.earlyExit.kind, "handoff");
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

await test("delivery workflow samples carry named candidates and per-key repair evidence", async () => {
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
  assert.equal(calls.filter(({ label }) => label === "review").length, 1);
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

await test("delivery samples reject publication to the wrong integration destination", async () => {
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

await test("delivery leaves findings outside unit ownership for replanning", async () => {
  await Promise.all(
    Object.values(samplePaths).map(async (file) => {
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
      assert.deepEqual(
        unowned.result.review.findings,
        unowned.result.reviewHistory[0].findings
      );
      for (const phase of ["Implement", "Publish", "Review"]) {
        assert.equal(
          unowned.calls.filter(
            (call) => call.phase === phase && call.label !== "verify-findings:1"
          ).length,
          1
        );
      }
    })
  );
});

await test("delivery samples reject invalid integration path evidence and base destinations", async () => {
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

await test("delivery samples reject malformed findings and preserve review evidence", async () => {
  await Promise.all(
    Object.values(samplePaths).flatMap((file) =>
      [null, { detail: "d", file: null, scenario: "s" }].map(
        async (finding) => {
          const { result } = await runWorkflowSample(
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
          assert.equal(result.fixRounds.used, 0);
        }
      )
    )
  );
});

await test("delivery samples append each phase's prompt part as its final section", async () => {
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
      const phaseCalls = calls.filter(
        ({ label }) => label !== "verify-findings:1"
      );
      assert.deepEqual(
        phaseCalls.map(({ phase, prompt }) => [
          phase,
          prompt.split("\n\n").at(-1)
        ]),
        phaseCalls.map(({ phase }) => [phase, promptParts[phase.toLowerCase()]])
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

await test("delivery samples pass candidate, issue, request, and owned findings into prompt sections", async () => {
  const evidence = "scope-specific observation";
  const description = "scope-specific description";
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
          Explore: () => ({ ...exploreResult, evidence }),
          Implement: splitImplement,
          Integrate: () => integrateResult,
          Plan: () => ({
            ...splitUnits,
            units: [
              { ...splitUnits.units[0], paths: ["../project/docs"] },
              splitUnits.units[1]
            ]
          }),
          Publish: sequence(publishCreated, publishUpdated),
          Review: sequence({ ...reviewFix, findings: reviewed }, reviewPass),
          Scope: () => ({
            ...scopeResult,
            checkoutRoot: "/workspace/project",
            scopes: [
              { ...scopeResult.scopes[0], description, paths: ["../shared"] }
            ]
          }),
          Sweep: () => sweepResult
        })
      );
      assert.equal(result.complete, true);
      assert.equal(result.sweepEvidence, sweepResult.evidence);
      assert.deepEqual(result.explorations, [
        { ...exploreResult, evidence, key: "s1" }
      ]);
      const plan = calls.find((call) => call.phase === "Plan");
      assert.ok(plan);
      for (const value of [description, evidence]) {
        assert.equal(plan.prompt.split(value).length - 1, 1);
      }
      /**
       * @param {string} text Prompt section.
       * @returns {string[]} Labels of calls containing the complete prompt section.
       */
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
          .filter(
            ({ phase, label }) => phase === "Publish" || label === "review"
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
              [
                {
                  ...finding,
                  id: `review-1-finding-${index + 1}`,
                  verificationEvidence: "independently checked"
                }
              ]
            )}`
          )
        ),
        reviewed.map((_finding, index) => [`implement:u${index + 1}:fix-1`])
      );
    })
  );
});

await test("delivery graph adapts single-unit candidates and records conditional integration evidence", async () => {
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
  const publishNode = result.graph.nodes.find((node) => node.key === "publish");
  assert.ok(publishNode);
  const published = publishNode.completionEvidence.at(-1);
  assert.ok(published && isObject(published.result));
  assert.equal(published.result.evidence, publishCreated.evidence);
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

await test("delivery graph exposes node contracts and condition edges", async () => {
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
      assert.deepEqual(nodes.get("implement:u1:fix-1")?.prerequisites, [
        "plan",
        "verify-findings:1",
        "explore:s1"
      ]);
      assert.deepEqual(nodes.get("verify-findings:1")?.prerequisites, [
        "review",
        "publish"
      ]);
    })
  );
});

await test("delivery retains an accepted sibling result when a required join fails", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: ({ label }) => (label === "explore:s1" ? exploreResult : null),
      Scope: () => ({
        ...scopeResult,
        scopes: [
          ...scopeResult.scopes,
          { key: "s2", description: "source scope", paths: ["src"] }
        ]
      })
    })
  );
  assert.equal(result.complete, false);
  assert.deepEqual(
    calls.map(({ label }) => label),
    ["scope", "explore:s1", "explore:s2"]
  );
  assert.deepEqual(result.explorations, [{ ...exploreResult, key: "s1" }]);
  assert.deepEqual(
    result.graph.nodes
      .filter(({ key }) => key.startsWith("explore:"))
      .map(({ key, status }) => [key, status]),
    [
      ["explore:s1", "completed"],
      ["explore:s2", "failed"]
    ]
  );
});

await test("delivery planning can proceed without a resolved Git base", async () => {
  await Promise.all(
    [false, true].map(async (planningOnly) => {
      const { calls, result } = await runWorkflowSample(
        samplePaths.delivery,
        {
          candidateBranch: "task-branch",
          skips: { implement: planningOnly },
          task: "t"
        },
        dispatchTable({
          Explore: () => exploreResult,
          Plan: () => singleUnits,
          Scope: () => ({ ...scopeResult, baseBranch: "" })
        })
      );
      assert.equal(result.complete, false);
      assert.deepEqual(
        calls.map(({ label }) => label),
        planningOnly ? ["scope", "explore:s1", "plan"] : ["scope"]
      );
      assert.equal(
        result.graph.nodes.find(({ key }) => key === "plan")?.status,
        planningOnly ? "completed" : "skipped"
      );
    })
  );
});

await test("delivery cannot expand scope explicitly supplied by Main", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", scope: scopeResult, task: "t" },
    dispatchTable({ Explore: () => exploreResult, Plan: () => splitUnits })
  );
  assert.equal(result.complete, false);
  assert.deepEqual(
    calls.map(({ label }) => label),
    ["explore:s1", "plan"]
  );
  assert.equal(
    result.graph.nodes.find(({ key }) => key === "plan")?.status,
    "failed"
  );
});

await test("delivery blocks the join when disjoint file owners report the same branch", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: (options) => ({
        ...splitImplement(options),
        branch: "shared-branch"
      }),
      Plan: () => splitUnits,
      Scope: () => scopeResult
    })
  );
  assert.equal(result.complete, false);
  assert.deepEqual(
    calls.map(({ label }) => label),
    ["scope", "explore:s1", "plan", "implement:u1", "implement:u2"]
  );
  assert.deepEqual(
    result.resources.map(({ state }) => state),
    ["attempted", "attempted"]
  );
  assert.deepEqual(
    result.units.map(({ branch }) => branch),
    [null, null]
  );
});

await test("delivery repair requires independent dispositions for the exact reviewed diff", async () => {
  const dispositions = [
    {
      id: "review-1-finding-1",
      status: "refuted",
      evidence: "source evidence"
    },
    {
      id: "review-1-finding-2",
      status: "refuted",
      evidence: "other source evidence"
    }
  ];
  await Promise.all(
    [
      { dispositions, complete: true },
      { dispositions: [dispositions[0]], complete: false },
      { dispositions: [dispositions[0], dispositions[0]], complete: false },
      {
        dispositions: [
          { ...dispositions[0], status: "unverified" },
          dispositions[1]
        ],
        complete: false
      },
      { dispositions, commit: "c".repeat(40), complete: false }
    ].map(async (verification) => {
      const { calls, result } = await runWorkflowSample(
        samplePaths.delivery,
        { candidateBranch: "task-branch", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: () => simpleImplement,
          Plan: () => singleUnits,
          Publish: () => publishCreated,
          Review: () => ({
            ...reviewFix,
            findings: [
              ...reviewFix.findings,
              { ...reviewFix.findings[0], detail: "another claim" }
            ]
          }),
          Scope: () => scopeResult,
          Sweep: () => sweepResult,
          Verify: () => ({
            baseCommit: sampleBase,
            commit: verification.commit ?? sampleCommit,
            dispositions: verification.dispositions
          })
        })
      );
      assert.equal(result.complete, verification.complete);
      assert.equal(result.fixRounds.used, 0);
      assert.deepEqual(
        calls.slice(-2).map(({ label }) => label),
        ["review", "verify-findings:1"]
      );
      assert.equal(
        result.graph.nodes.find(({ key }) => key === "verify-findings:1")
          ?.status,
        verification.complete ? "completed" : "failed"
      );
    })
  );
});

await test("delivery refuses stale evidence before accepting each successor", async () => {
  await Promise.all(
    [
      { stage: "sweep", sweep: { commit: "c".repeat(40) } },
      { stage: "sweep", sweep: { coverage: "incomplete" } },
      { stage: "publish", publish: { baseCommit: "c".repeat(40) } },
      {
        stage: "publish",
        publish: { repository: "example.invalid/unapproved/fork" }
      },
      { stage: "review", review: { commit: "c".repeat(40) } },
      { stage: "review", review: { coverage: "incomplete" } }
    ].map(async ({ stage, sweep, publish, review }) => {
      const { calls, result } = await runWorkflowSample(
        samplePaths.delivery,
        { candidateBranch: "task-branch", task: "t" },
        dispatchTable({
          Explore: () => exploreResult,
          Implement: () => simpleImplement,
          Plan: () => singleUnits,
          Publish: () => ({ ...publishCreated, ...publish }),
          Review: () => ({ ...reviewPass, ...review }),
          Scope: () => scopeResult,
          Sweep: () => ({ ...sweepResult, ...sweep })
        })
      );
      assert.equal(result.complete, false);
      assert.equal(calls.at(-1)?.label, stage);
      const failed = result.graph.nodes.find(({ key }) => key === stage);
      assert.equal(failed?.status, "failed");
      if (stage === "publish") {
        const outcome = failed.completionEvidence.at(-1)?.result;
        assert.ok(isObject(outcome) && isObject(outcome.observed));
        assert.equal(outcome.observed.url, publishCreated.url);
        assert.equal(result.publish, null);
      }
    })
  );
});

await test("delivery leaves a moved integration destination for reconciliation", async () => {
  const { calls, result } = await runWorkflowSample(
    samplePaths.delivery,
    { candidateBranch: "task-branch", task: "t" },
    dispatchTable({
      Explore: () => exploreResult,
      Implement: splitImplement,
      Integrate: () => ({ ...integrateResult, startCommit: "c".repeat(40) }),
      Plan: () => splitUnits,
      Scope: () => scopeResult
    })
  );
  assert.equal(result.complete, false);
  assert.equal(calls.at(-1)?.label, "integrate");
  assert.equal(result.integration.status, "failed");
  assert.equal(result.integration.startCommit, "c".repeat(40));
  assert.deepEqual(
    result.resources.map(({ state }) => state),
    ["implemented", "implemented"]
  );
});
