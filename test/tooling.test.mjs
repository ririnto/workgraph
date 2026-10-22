import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { lint } from "markdownlint/sync";

import tsdoc from "../plugins/tsdoc-plugin.ts";
import sentencePerLine from "../rules/sentence-per-line.ts";

test("Ultracite preserves mandatory rules, ignores, and formatter convergence", async () => {
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
      'export const sample = () => {\n// explain\n\nreturn 1;\n};\nsetTimeout("run()", 0);\n'
    );
    const command = path.join(root, "node_modules/ultracite/dist/index.js");
    const invalid = spawnSync(
      process.execPath,
      [command, "check", "sample.ts", "dist/ignored.ts", "--format", "json"],
      {
        cwd: directory,
        encoding: "utf-8",
        timeout: 30_000
      }
    );
    assert.ifError(invalid.error);
    assert.equal(invalid.status, 1, invalid.stderr);
    const start = invalid.stdout.search(/\{\s*"diagnostics"\s*:/u);
    assert.notEqual(start, -1, invalid.stdout);
    const { diagnostics } = JSON.parse(
      invalid.stdout.slice(start, invalid.stdout.lastIndexOf("}") + 1)
    );
    assert.deepEqual(diagnostics.map(({ code }) => code).toSorted(), [
      "eslint(arrow-body-style)",
      "eslint(no-implied-eval)",
      "style(no-blank-lines-in-functions)",
      "style(no-inline-comments-in-functions)",
      "tsdoc(require-export-tsdoc)"
    ]);
    const valid =
      "/**\n * Expose fixture settings.\n */\nexport const settings = {\n  firstSettingEnabled: true,\n  secondSettingEnabled: true,\n  thirdSettingEnabled: true\n};\n";
    const unformatted =
      "/**\n * Expose fixture settings.\n */\nexport const settings = {\n  firstSettingEnabled: true,\n  secondSettingEnabled: true,\n  thirdSettingEnabled: true,\n};\n";
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

/**
 * Capture sentence diagnostics through Markdownlint's real parser.
 * @param {string} source Markdown source text.
 * @param {string} name Source name controlling document exemptions.
 * @returns {object[]} Sentence diagnostics.
 */
const sentenceErrors = (source, name = "input.md") =>
  lint({
    config: { default: false, "docs/sentence-per-line": true },
    customRules: [sentencePerLine],
    strings: { [name]: source }
  })[name] ?? [];

test("sentence searches retain the first matching column and preserve protected syntax", () => {
  const source = "First sentence. Second sentence. Third sentence.\n";
  assert.deepEqual(
    sentenceErrors(source).map(({ lineNumber, errorRange }) => ({
      lineNumber,
      range: errorRange
    })),
    [{ lineNumber: 1, range: [15, 1] }]
  );
  assert.deepEqual(
    sentenceErrors("First stays; therefore retry; therefore stop.\n").map(
      ({ errorRange }) => errorRange
    ),
    [[12, 1]]
  );
  for (const protectedSource of [
    "> First sentence. Second sentence.\n",
    "```text\nFirst sentence. Second sentence.\n```\n",
    "<!-- Generated file -->\nFirst sentence. Second sentence.\n",
    'The value is "First sentence. Second sentence." today.\n'
  ]) {
    assert.deepEqual(sentenceErrors(protectedSource), []);
  }
  assert.deepEqual(sentenceErrors(source, "LICENSE.md"), []);
  assert.deepEqual(
    sentenceErrors("> [!WARNING]\n>\n> First sentence. Second sentence.\n").map(
      ({ lineNumber, errorRange }) => ({ lineNumber, range: errorRange })
    ),
    [{ lineNumber: 3, range: [17, 1] }]
  );
});

test("sentence captures preserve Unicode widths, quotation endings, and first diagnostics", () => {
  for (const [source, range] of [
    [
      'The value is "Smile \u{1F600}. Stay." today; therefore retry.\n',
      [37, 1]
    ],
    ['"Smile \u{1F600}." Next sentence.\n', [10, 1]],
    ["Use `\u{1F600}; hidden` today; therefore retry.\n", [23, 1]],
    ["First stays\uFF1B therefore retry; therefore stop.\r\n", [12, 1]],
    ['"No ending \u{1F600}" today; therefore retry.\r\n', [21, 1]]
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ lineNumber, errorRange }) => ({
        lineNumber,
        range: errorRange
      })),
      [{ lineNumber: 1, range }]
    );
  }
  assert.deepEqual(
    sentenceErrors("First stays; \u201Cretry\u201D later.\n"),
    []
  );
});

test("sentence semicolons distinguish enumerations from bounded independent clauses", () => {
  for (const source of [
    "The contributors are Alice, editor; Bob, reviewer; Carol, maintainer.",
    "Supported operating systems: Linux; Windows; macOS.",
    "Choose Linux; Windows; or macOS.",
    "The lifecycle has three phases: setup; restart, if needed; and cleanup.",
    "The lifecycle has three phases: setup\uFF1B restart, if needed\uFF1B and cleanup.",
    "The lifecycle has three phases: setup&#xFF1B; restart, if needed&#xFF1B; and cleanup.",
    "Use salt &amp; pepper today.",
    "First stays; \u201Cretry\u201D later."
  ]) {
    assert.deepEqual(sentenceErrors(source), []);
  }
  for (const source of [
    "First stays; it is ready.",
    "First stays; It is ready.",
    "First stays; the server is ready.",
    "First stays; Restart the server.",
    "First stays; therefore retry; therefore stop."
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ ruleNames, lineNumber, errorRange }) => ({
        lineNumber,
        range: errorRange,
        ruleNames
      })),
      [{ lineNumber: 1, range: [12, 1], ruleNames: ["docs/sentence-per-line"] }]
    );
  }
  assert.deepEqual(
    sentenceErrors(
      "Supported phases: setup; it is ready, safe; and cleanup."
    ).map(({ errorRange }) => errorRange),
    [[24, 1]]
  );
});

test("sentence abbreviations preserve names, examples, time zones, and decimals", () => {
  for (const source of [
    "At 5 p.m. UTC, start the check.",
    "At 5 a.m. UTC, start the check.",
    "Use e.g. Linux today.",
    "Use Linux, Windows, etc.\nRestart now.",
    "Dr. Smith is ready.",
    "Ask J. Smith today.",
    "The U.S. team is ready.",
    "Use version 1.2 today.",
    "First sentence.\nSecond sentence."
  ]) {
    assert.deepEqual(sentenceErrors(source), []);
  }
  for (const [source, range] of [
    ["The vendor is Acme Inc. Restart the server.", [23, 1]],
    ["The vendor is Acme Ltd. It is ready.", [23, 1]],
    ["Use Linux, Windows, etc. Restart now.", [24, 1]],
    ["At 5 p.m. Restart the server.", [9, 1]],
    ["Use version 1.2 today. Restart now.", [22, 1]],
    ["First sentence. Second sentence.", [15, 1]]
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ lineNumber, errorRange }) => ({
        lineNumber,
        range: errorRange
      })),
      [{ lineNumber: 1, range }]
    );
  }
});

test("sentence boundaries recognize opaque inline starts without inspecting their contents", () => {
  for (const source of [
    "First sentence. `Restart` the server.",
    "First sentence. [Restart](https://example.com) the server.",
    "First sentence. ![Restart](image.png) the server.",
    "First sentence. <https://example.com> is available.",
    "First sentence. https://example.com is available."
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ lineNumber, errorRange }) => ({
        lineNumber,
        range: errorRange
      })),
      [{ lineNumber: 1, range: [15, 1] }]
    );
  }
  for (const source of [
    "Use `First. Second; it is ready.` today.",
    "Use [First. Second; it is ready.](https://example.com) today.",
    "Use ![First. Second.](image.png) today.",
    "Use <https://example.com/First.Second> today.",
    "Use https://example.com/First.Second today."
  ]) {
    assert.deepEqual(sentenceErrors(source), []);
  }
  assert.deepEqual(
    sentenceErrors("Smile \u{1F600} today. `Restart` now.").map(
      ({ errorRange }) => errorRange
    ),
    [[15, 1]]
  );
});

test("sentence continuations include capitalized and opaque-leading physical lines", () => {
  for (const source of [
    "Use the\nNode runtime.",
    "Use the\n`Node` runtime.",
    "Use the\n[Node](https://example.com) runtime.",
    "Use the\nnode runtime.",
    "Use `Node`\nruntime.",
    "Use the\r\nNode runtime.",
    "Use the\n&#78;ode runtime."
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ lineNumber, errorRange }) => ({
        lineNumber,
        range: errorRange
      })),
      [{ lineNumber: 2, range: [1, 1] }]
    );
  }
  for (const source of [
    "Use the Node runtime.\nRestart the server.",
    "Use the Node runtime.\n`Restart` the server.",
    "Use the\n\nNode runtime.",
    "- Use Node.\n- Restart now.",
    "> Use the\n> Node runtime.",
    "Use `First\nSecond` today.",
    "Use [First\nSecond](https://example.com) today.",
    'Use "First\nSecond" today.',
    "Use \u201CFirst\nSecond\u201D today."
  ]) {
    assert.deepEqual(sentenceErrors(source), []);
  }
});

test("sentence table explanations keep cell boundaries and first diagnostic order", () => {
  for (const [source, expected] of [
    [
      "| Action | Explanation |\n| --- | --- |\n| Run | First sentence. Second sentence. |",
      [{ lineNumber: 3, range: [23, 1] }]
    ],
    [
      "| First sentence. Second sentence. | Label |\n| --- | --- |\n| One | Two |",
      [{ lineNumber: 1, range: [17, 1] }]
    ],
    [
      "| A | B |\n| --- | --- |\n| First sentence. Next. | Other sentence. Next. |",
      [{ lineNumber: 3, range: [17, 1] }]
    ],
    [
      "| A | B |\n| --- | --- |\n| First stays; it is ready. | Second stays; it is ready. |",
      [{ lineNumber: 3, range: [14, 1] }]
    ],
    ["| A | B |\n| --- | --- |\n| First sentence. | Second sentence. |", []],
    [
      "| A | B |\n| --- | --- |\n| Label | `First. Second.` and [First. Second.](https://example.com) |",
      []
    ]
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ lineNumber, errorRange }) => ({
        lineNumber,
        range: errorRange
      })),
      expected
    );
  }
});

test("sentence rendered punctuation retains exact original UTF-16 ranges", () => {
  for (const [source, range] of [
    ["First sentence\\. Second sentence.", [15, 2]],
    ["First sentence&#46; Second sentence.", [15, 5]],
    ["First sentence&#x2e; Second sentence.", [15, 6]],
    ["First sentence&period; Second sentence.", [15, 8]],
    ["First sentence&excl; Second sentence.", [15, 6]],
    ["First sentence&quest; Second sentence.", [15, 7]],
    ["First stays&#59; it is ready.", [12, 5]],
    ["First stays&#xFF1B; it is ready.", [12, 8]],
    ["Smile \u{1F600} today&#46; `Restart` now.", [15, 5]],
    ["Smile &#x1F600; today. Restart now.", [22, 1]],
    ["Use &#78;ode today. Restart now.", [19, 1]]
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ lineNumber, errorRange }) => ({
        lineNumber,
        range: errorRange
      })),
      [{ lineNumber: 1, range }]
    );
  }
  for (const source of [
    "Use version 1&#46;2 today.",
    "Use version 1\\.2 today.",
    "Dr&period; Smith is ready.",
    "At 5 p&period;m&period; UTC, start the check.",
    "First sentence&#46;\nSecond sentence.",
    "Use `First&#46; Second.` today.",
    "Use [First&#46; Second.](https://example.com) today.",
    "The value is &quot;First. Second.&quot; today."
  ]) {
    assert.deepEqual(sentenceErrors(source), []);
  }
});

test("sentence prose keeps list detection and protected Markdown admission", () => {
  for (const [source, expected] of [
    ["- First sentence. Second sentence.", [{ lineNumber: 1, range: [17, 1] }]],
    [
      "1. First sentence. Second sentence.",
      [{ lineNumber: 1, range: [18, 1] }]
    ],
    [
      "---\ntitle: First. Second.\n---\nFirst sentence. Second sentence.",
      [{ lineNumber: 4, range: [15, 1] }]
    ],
    [
      "First stays; it is ready. Next sentence.",
      [
        { lineNumber: 1, range: [25, 1] },
        { lineNumber: 1, range: [12, 1] }
      ]
    ]
  ]) {
    assert.deepEqual(
      sentenceErrors(source).map(({ lineNumber: actualLine, errorRange }) => ({
        lineNumber: actualLine,
        range: errorRange
      })),
      expected
    );
  }
  for (const source of [
    "    First sentence. Second sentence.",
    "~~~text\nFirst sentence. `Restart` now.\n~~~",
    "<div>\nFirst sentence. Second sentence.\n</div>",
    "---\ntitle: First. Second.\n---\nOne sentence.",
    "---\ngenerated: true\n---\nFirst sentence. Second sentence.",
    'The value is "First sentence. Second sentence." today.',
    "The value is \u201CFirst sentence. Second sentence.\u201D today."
  ]) {
    assert.deepEqual(sentenceErrors(source), []);
  }
});

test("search-replace covers box drawing in all Markdown with first UTF-16 match and no fix", async () => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = await mkdtemp(
    path.join(tmpdir(), "workgraph-box-drawing-")
  );
  const boxCharacters = Array.from({ length: 128 }, (_, index) =>
    String.fromCodePoint(0x25_00 + index)
  );
  const markdown = `# Fixture\n\n😀 ${boxCharacters.join("")}\n${boxCharacters.join("\n")}\n\n\`\`\`text\n😀 \u257F\n\`\`\`\n`;
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
      /fixture\.md:134:4 error search-replace Custom rule \[no-box-drawing:/u
    );
    assert.deepEqual(
      [
        ...diagnostics.matchAll(
          /fixture\.md:(?<line>\d+):\d+ error search-replace Custom rule/gu
        )
      ].map(({ groups }) => Number(groups.line)),
      [3, ...Array.from({ length: 128 }, (_, index) => index + 4), 134]
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

test("sentence token traversal preserves leaf diagnostics through deep containers", () => {
  let params;
  lint({
    config: { default: false, "docs/sentence-per-line": true },
    customRules: [
      {
        ...sentencePerLine,
        function: (input) => {
          params = input;
        }
      }
    ],
    strings: { "input.md": "- First sentence. Second sentence.\n" }
  });
  const [container] = params.parsers.micromark.tokens;
  const paragraph = container.children
    .flatMap(({ children }) => children)
    .find(({ type }) => type === "paragraph");
  assert.ok(paragraph);
  let nested = paragraph;
  for (let depth = 0; depth < 10_000; depth += 1) {
    nested = { ...container, children: [nested] };
  }
  const expected = [];
  sentencePerLine.function(params, (diagnostic) => expected.push(diagnostic));
  assert.equal(expected.length, 1);
  const actual = [];
  sentencePerLine.function(
    {
      ...params,
      parsers: {
        ...params.parsers,
        micromark: { ...params.parsers.micromark, tokens: [nested] }
      }
    },
    (diagnostic) => actual.push(diagnostic)
  );
  assert.deepEqual(actual, expected);
});

test("TSDoc class reuse preserves diagnostic order and reads members only once", () => {
  const reports = [];
  let memberReads = 0;
  const classNode = {
    body: {
      get body() {
        memberReads += 1;
        return [
          {
            key: { name: "read", type: "Identifier" },
            kind: "method",
            type: "MethodDefinition"
          }
        ];
      }
    },
    id: { name: "Store" },
    type: "ClassDeclaration"
  };
  const visitor = tsdoc.rules["require-export-tsdoc"].create({
    filename: "source.ts",
    report: ({ data, messageId }) => reports.push({ data, messageId }),
    sourceCode: { getCommentsBefore: () => [], text: "" }
  });
  const exported = {
    declaration: classNode,
    type: "ExportNamedDeclaration"
  };
  visitor.ExportNamedDeclaration(exported);
  visitor.ExportNamedDeclaration(exported);
  assert.deepEqual(reports, [
    {
      data: { kind: "class", name: "Store" },
      messageId: "missingTsdoc"
    },
    {
      data: { kind: "method", name: "read" },
      messageId: "missingTsdoc"
    },
    {
      data: { kind: "class", name: "Store" },
      messageId: "missingTsdoc"
    }
  ]);
  assert.equal(memberReads, 1);
});

test("TSDoc filename fallback preserves lazy evaluation and JavaScript exclusion", () => {
  let filenameReads = 0;
  const context = {
    filename: "source.js",
    getFilename: () => {
      filenameReads += 1;
      return "source.ts";
    },
    report: () => assert.fail("JavaScript must not produce TSDoc diagnostics"),
    sourceCode: { getCommentsBefore: () => [], text: "" }
  };
  assert.deepEqual(tsdoc.rules["require-export-tsdoc"].create(context), {});
  assert.equal(filenameReads, 0);
  const visitor = tsdoc.rules["require-export-tsdoc"].create({
    ...context,
    filename: undefined
  });
  assert.deepEqual(Object.keys(visitor), [
    "ExportAllDeclaration",
    "ExportDefaultDeclaration",
    "ExportNamedDeclaration",
    "TSExportAssignment"
  ]);
  assert.equal(filenameReads, 1);
});
