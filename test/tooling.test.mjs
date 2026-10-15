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
      "export const sample = () => {\n// explain\n\nreturn 1;\n};\n"
    );
    const command = path.join(root, "node_modules/ultracite/dist/index.js");
    const invalid = spawnSync(
      process.execPath,
      [command, "check", "--format", "json"],
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
      "style(no-blank-lines-in-functions)",
      "style(no-inline-comments-in-functions)",
      "tsdoc(require-export-tsdoc)"
    ]);
    const valid =
      "/**\n * Expose fixture settings.\n */\nexport const settings = {\n  firstSettingEnabled: true,\n  secondSettingEnabled: true,\n  thirdSettingEnabled: true\n};\n";
    await writeFile(path.join(directory, "sample.ts"), valid);
    for (const action of ["fix", "fix", "check"]) {
      const result = spawnSync(process.execPath, [command, action], {
        cwd: directory,
        encoding: "utf-8",
        timeout: 30_000
      });
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
