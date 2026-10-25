import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stripVTControlCharacters } from "node:util";

import { lint } from "markdownlint/sync";

import tsdoc from "../plugins/tsdoc-plugin.ts";
import sentencePerLine from "../rules/sentence-per-line.ts";
import tableSeparators from "../rules/table-separators.ts";

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
    const configuredCheck = spawnSync(
      "corepack",
      ["pnpm", "run", "check:ultracite"],
      {
        cwd: directory,
        encoding: "utf-8",
        env: reporterEnvironment,
        timeout: 60_000
      }
    );
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
    const configuredFix = spawnSync(
      "corepack",
      ["pnpm", "run", "fix:ultracite"],
      {
        cwd: directory,
        encoding: "utf-8",
        env: reporterEnvironment,
        timeout: 60_000
      }
    );
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

test("sentence continuations recognize comma-led wrapped lines", () => {
  const errors = sentenceErrors(
    "Keep this sentence\n, then its continuation.\n"
  );
  assert.deepEqual(
    errors.map(({ lineNumber, errorRange }) => ({
      lineNumber,
      range: errorRange
    })),
    [{ lineNumber: 2, range: [1, 1] }]
  );
});

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

test("TSDoc covers public and protected class members while excluding private ones", () => {
  const constructor = {
    key: { name: "constructor", type: "Identifier" },
    kind: "constructor",
    type: "MethodDefinition"
  };
  const protectedMethod = {
    accessibility: "protected",
    key: { name: "read", type: "Identifier" },
    kind: "method",
    type: "MethodDefinition"
  };
  const protectedProperty = {
    accessibility: "protected",
    key: { name: "status", type: "Identifier" },
    type: "PropertyDefinition",
    value: { type: "Literal" }
  };
  const publicProperty = {
    key: { name: "enabled", type: "Identifier" },
    type: "PropertyDefinition",
    value: { type: "Literal" }
  };
  const documentedProperty = {
    key: { name: "documented", type: "Identifier" },
    type: "PropertyDefinition",
    value: { type: "Literal" }
  };
  const privateProperty = {
    accessibility: "private",
    key: { name: "secret", type: "Identifier" },
    type: "PropertyDefinition",
    value: { type: "Literal" }
  };
  const privateMethod = {
    key: { name: "hidden", type: "PrivateIdentifier" },
    kind: "method",
    type: "MethodDefinition"
  };
  const documentedComments = new Map([
    [
      documentedProperty,
      [
        {
          end: 0,
          start: 0,
          type: "Block",
          value: "*\n * Existing documentation.\n "
        }
      ]
    ]
  ]);
  const reports = [];
  const visitor = tsdoc.rules["require-export-tsdoc"].create({
    filename: "source.ts",
    report: ({ data, messageId }) => reports.push({ data, messageId }),
    sourceCode: {
      getCommentsBefore: (node) => documentedComments.get(node) ?? [],
      text: ""
    }
  });
  visitor.ExportNamedDeclaration({
    declaration: {
      body: {
        body: [
          constructor,
          protectedMethod,
          protectedProperty,
          publicProperty,
          documentedProperty,
          privateProperty,
          privateMethod
        ]
      },
      id: { name: "Store" },
      type: "ClassDeclaration"
    },
    type: "ExportNamedDeclaration"
  });
  assert.deepEqual(reports, [
    {
      data: { kind: "class", name: "Store" },
      messageId: "missingTsdoc"
    },
    {
      data: { kind: "method", name: "constructor" },
      messageId: "missingTsdoc"
    },
    { data: { kind: "method", name: "read" }, messageId: "missingTsdoc" },
    { data: { kind: "property", name: "status" }, messageId: "missingTsdoc" },
    { data: { kind: "property", name: "enabled" }, messageId: "missingTsdoc" }
  ]);
});

test("TSDoc validates exported local class expressions by binding name", () => {
  const statements = [];
  const program = { body: statements, type: "Program" };
  const directExpression = {
    body: {
      body: [
        {
          key: { name: "run", type: "Identifier" },
          kind: "method",
          type: "MethodDefinition"
        }
      ]
    },
    type: "ClassExpression"
  };
  const aliasedExpression = {
    body: {
      body: [
        {
          key: { name: "status", type: "Identifier" },
          type: "PropertyDefinition",
          value: { type: "Literal" }
        },
        {
          key: { name: "documented", type: "Identifier" },
          type: "PropertyDefinition",
          value: { type: "Literal" }
        }
      ]
    },
    type: "ClassExpression"
  };
  const [, documentedProperty] = aliasedExpression.body.body;
  const documentedComments = new Map([
    [
      documentedProperty,
      [
        {
          end: 0,
          start: 0,
          type: "Block",
          value: "*\n * Existing documentation.\n "
        }
      ]
    ]
  ]);
  const directExport = {
    parent: program,
    specifiers: [
      {
        exported: { name: "Direct", type: "Identifier" },
        local: { name: "Direct", type: "Identifier" }
      }
    ],
    type: "ExportNamedDeclaration"
  };
  const aliasedExport = {
    parent: program,
    specifiers: [
      {
        exported: { name: "Public", type: "Identifier" },
        local: { name: "Internal", type: "Identifier" }
      }
    ],
    type: "ExportNamedDeclaration"
  };
  statements.push(
    {
      declarations: [
        {
          id: { name: "Direct", type: "Identifier" },
          init: directExpression
        },
        {
          id: { name: "Internal", type: "Identifier" },
          init: aliasedExpression
        }
      ],
      type: "VariableDeclaration"
    },
    directExport,
    aliasedExport
  );
  const reports = [];
  const visitor = tsdoc.rules["require-export-tsdoc"].create({
    filename: "source.ts",
    report: ({ data, messageId }) => reports.push({ data, messageId }),
    sourceCode: {
      getCommentsBefore: (node) => documentedComments.get(node) ?? [],
      text: ""
    }
  });
  visitor.ExportNamedDeclaration(directExport);
  visitor.ExportNamedDeclaration(aliasedExport);
  assert.deepEqual(reports, [
    {
      data: { kind: "export list", name: "Direct" },
      messageId: "missingTsdoc"
    },
    { data: { kind: "method", name: "run" }, messageId: "missingTsdoc" },
    {
      data: { kind: "export list", name: "Public" },
      messageId: "missingTsdoc"
    },
    { data: { kind: "property", name: "status" }, messageId: "missingTsdoc" }
  ]);
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
        isolation: options.isolation,
        model: options.model,
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
  complex: path.join(
    sampleRoot,
    "skills/workflow/scripts/delivery-complex.workflow.txt"
  ),
  simple: path.join(
    sampleRoot,
    "skills/workflow/scripts/delivery-simple.workflow.txt"
  )
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
  startRef: "main"
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
    startRef: repair ? "task-branch" : "main"
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

test("delivery workflow samples preserve post-then-review ordering and honest phase records", async () => {
  for (const file of Object.values(samplePaths)) {
    const text = readFileSync(file, "utf-8");
    assert.ok(
      text.indexOf("title: 'Publish'") < text.indexOf("title: 'Review'")
    );
  }
  {
    const { calls, result } = await runWorkflowSample(
      samplePaths.simple,
      { candidateBranch: "main", issue: "#1", maxFixRounds: 1, task: "t" },
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
    assert.ok(publishCalls[0].prompt.includes("Create a pull request"));
    assert.ok(
      publishCalls[1].prompt.includes(
        "Update the existing open request at https://example.invalid/pr/1"
      )
    );
    const models = Object.fromEntries(
      calls.map((call) => [call.phase, call.model])
    );
    assert.equal(models.Scope, "opus");
    assert.equal(models.Explore, "haiku");
    assert.equal(models.Plan, "opus");
    assert.equal(models.Implement, "sonnet");
    assert.equal(models.Sweep, "haiku");
    assert.equal(models.Publish, "sonnet");
    assert.equal(models.Review, "sonnet");
    assert.ok(
      calls
        .filter((entry) => entry.phase === "Implement")
        .every((call) => call.isolation === "worktree")
    );
    const implementCalls = calls.filter((entry) => entry.phase === "Implement");
    assert.ok(
      implementCalls[0].prompt.includes("Required starting reference: main")
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
      { candidateBranch: "main", issue: "#1", maxFixRounds: 0, task: "t" },
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
      { candidateBranch: "main", issue: "#1", maxFixRounds: 1, task: "t" },
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
        candidateBranch: "main",
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
      { candidateBranch: "main", issue: "#1", maxFixRounds: 1, task: "t" },
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
        models: { scope: "haiku" },
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
    assert.equal(models.Scope, "haiku");
    assert.equal(models.Plan, "opus");
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
      { candidateBranch: "main", issue: "#1", task: "t" },
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
        { task: "t" },
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
        { candidateBranch: "main", issue: "#1", task: "t" },
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
      [integrateUnmerged, /unmerged/u, ["merged", "merged"]],
      [integrateConflicted, /contradictory/u, ["merged", "merged"]],
      [
        integratePartialLedger,
        /every named unit branch/u,
        ["merged", "implemented"]
      ],
      [
        integrateWrongBranch,
        /every named unit branch/u,
        ["implemented", "merged"]
      ],
      [
        integrateDuplicate,
        /every named unit branch/u,
        ["implemented", "implemented"]
      ],
      [integrateNoChecks, /combined candidate/u, ["merged", "merged"]],
      [integrateRetained, /contradictory/u, ["merged", "retained"]],
      [null, /Integration agent failed/u, ["implemented", "implemented"]]
    ].map(async ([payload, pattern, states]) => {
      const { result } = await runWorkflowSample(
        samplePaths.complex,
        { candidateBranch: "main", issue: "#1", task: "t" },
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
    { candidateBranch: "main", issue: "#1", maxFixRounds: 1, task: "t" },
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
    { candidateBranch: "main", issue: "#1", maxFixRounds: 1, task: "t" },
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
      { branch: "unit-u1", key: "u1", startRef: "main", state: "merged" },
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
    { branch: "unit-u1", key: "u1", startRef: "main", state: "attempted" }
  ]);
  const multiRun = await runWorkflowSample(
    samplePaths.complex,
    { candidateBranch: "main", issue: "#1", maxFixRounds: 2, task: "t" },
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
  assert.equal(
    multiRun.calls.filter((call) => call.phase === "Implement").length,
    4
  );
  assert.deepEqual(multiRun.result.resources, [
    { branch: "unit-u1", key: "u1", startRef: "main", state: "merged" },
    { branch: "unit-u2", key: "u2", startRef: "main", state: "merged" },
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
