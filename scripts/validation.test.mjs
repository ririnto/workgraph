import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import relativeLinksRule, {
  markdownIt
} from "markdownlint-rule-relative-links";
import { lint } from "markdownlint/promise";

import issueTemplateRule from "../rules/issue-template-front-matter.mjs";
import { validatePluginVersions } from "./check-plugin-version.mjs";

const frontMatter = /^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/u;

/**
 * Lint one in-memory file with only the issue-template metadata rule enabled.
 */
const lintIssueTemplate = async (name, content) => {
  const result = await lint({
    config: {
      default: false,
      "docs/issue-template-front-matter": true
    },
    customRules: [issueTemplateRule],
    frontMatter,
    strings: { [name]: content }
  });
  return result[name] ?? [];
};

/**
 * Lint one source file with only relative-link validation enabled.
 */
const lintRelativeLinks = async (filename, content) => {
  const result = await lint({
    config: {
      default: false,
      "relative-links": {
        root_path: "."
      }
    },
    customRules: [relativeLinksRule],
    markdownItFactory: () => markdownIt,
    strings: { [filename]: content }
  });
  return result[filename] ?? [];
};

test("issue template front matter accepts non-empty string fields", async () => {
  const name = path.join(tmpdir(), ".github/ISSUE_TEMPLATE/hidden.md");
  const content =
    "---\nname: Bug report\nabout: Describe a reproducible issue.\n---\n\n# Details\n";
  assert.deepEqual(await lintIssueTemplate(name, content), []);
});

test("issue template front matter rejects a missing field", async () => {
  const name = path.join(tmpdir(), ".github/ISSUE_TEMPLATE/hidden.md");
  const content = "---\nabout: Describe a reproducible issue.\n---\n";
  const errors = await lintIssueTemplate(name, content);
  assert.equal(errors.length, 1);
  assert.match(errors[0].errorDetail, /non-empty string name/u);
});

test("issue template front matter rejects empty and non-string fields", async () => {
  const name = path.join(tmpdir(), ".github/ISSUE_TEMPLATE/hidden.md");
  const content = "---\nname: 12\nabout: '  '\n---\n\n# Details\n";
  const errors = await lintIssueTemplate(name, content);
  assert.equal(errors.length, 2);
  assert.match(errors[0].errorDetail, /non-empty string name/u);
  assert.match(errors[1].errorDetail, /non-empty string about/u);
});

test("issue template rule rejects malformed YAML and skips unrelated Markdown", async () => {
  const issueTemplate = path.join(tmpdir(), ".github/ISSUE_TEMPLATE/hidden.md");
  const malformed = await lintIssueTemplate(
    issueTemplate,
    "---\nname: [\n---\n"
  );
  assert.equal(malformed.length, 1);
  assert.match(malformed[0].errorDetail, /valid YAML/u);
  const unrelated = await lintIssueTemplate(
    path.join(tmpdir(), ".github/PULL_REQUEST_TEMPLATE.md"),
    "---\nname: 12\nabout: ''\n---\n"
  );
  assert.deepEqual(unrelated, []);
});

test("relative link rule accepts existing files and headings", async (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph-links-"));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const source = path.join(root, "source.md");
  const target = path.join(root, "target.md");
  writeFileSync(target, "# Target heading\n", "utf-8");
  const errors = await lintRelativeLinks(
    source,
    "[Target](./target.md#target-heading)\n[Repository README](/README.md)\n"
  );
  assert.deepEqual(errors, []);
});

test("relative link rule rejects missing files", async (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph-links-"));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const source = path.join(root, "source.md");
  const errors = await lintRelativeLinks(source, "[Missing](./missing.md)\n");
  assert.equal(errors.length, 1);
  assert.match(errors[0].errorDetail, /should exist in the file system/u);
});

test("plugin version validation accepts matching calendar date releases", () => {
  assert.doesNotThrow(() =>
    validatePluginVersions("2026.10.10.03", "2026.10.10.03")
  );
});

test("plugin version validation rejects invalid format, date, sequence, and parity", () => {
  assert.throws(
    () => validatePluginVersions("2026.10.10", "2026.10.10.01"),
    /format/u
  );
  assert.throws(
    () => validatePluginVersions("2026.02.30.01", "2026.02.30.01"),
    /valid date/u
  );
  assert.throws(
    () => validatePluginVersions("2026.10.10.00", "2026.10.10.00"),
    /non-zero/u
  );
  assert.throws(
    () => validatePluginVersions("2026.10.10.01", "2026.10.10.02"),
    /must match/u
  );
});
