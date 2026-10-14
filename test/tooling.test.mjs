import assert from "node:assert/strict";
import { test } from "node:test";

import { lint } from "markdownlint/sync";

import tsdoc from "../plugins/tsdoc-plugin.ts";
import sentencePerLine from "../rules/sentence-per-line.ts";

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
