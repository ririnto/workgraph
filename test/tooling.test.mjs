import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stripVTControlCharacters } from "node:util";

import { lint } from "markdownlint/sync";

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

test("sentence diagnostics reach prose inside deeply nested Markdown lists", () => {
  assert.deepEqual(
    sentenceErrors(
      `${"- ".repeat(10_000)}First sentence. Second sentence.\n`
    ).map(({ lineNumber, errorRange }) => ({ lineNumber, range: errorRange })),
    [{ lineNumber: 1, range: [20_015, 1] }]
  );
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
