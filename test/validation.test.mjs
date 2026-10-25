import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import yamlParser from "markdownlint-cli2/parsers/yaml";
import relativeLinksRule, {
  markdownIt
} from "markdownlint-rule-relative-links";
import { lint } from "markdownlint/promise";

const repositoryRoot = new URL("../", import.meta.url);
const validIssueForm = `name: Bug report
description: Report a reproducible defect.
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: Describe the defect and its effect.
    validations:
      required: true
  - type: textarea
    id: evidence
    attributes:
      label: Evidence
      description: Provide concrete evidence.
    validations:
      required: true
  - type: textarea
    id: scope
    attributes:
      label: Scope
      description: Identify the affected scope.
    validations:
      required: true
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance
      description: State the observable acceptance criteria.
    validations:
      required: true
  - type: textarea
    id: ownership_next_action
    attributes:
      label: Ownership And Next Action
      description: Name the owner and next action.
    validations:
      required: true
`;

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

const copyValidation = (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph-validation-"));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  cpSync(
    new URL("validation/", import.meta.url),
    path.join(root, "test/validation"),
    { recursive: true }
  );
  symlinkSync(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(root, "node_modules")
  );
  return root;
};

const runValidation = (root, filename) => {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "test/validation", filename)],
    {
      cwd: tmpdir(),
      encoding: "utf-8",
      killSignal: "SIGKILL",
      timeout: 5000
    }
  );
  assert.ifError(result.error);
  return result;
};

test("issue form command reports malformed input, field violations, and duplicate names", (t) => {
  const root = copyValidation(t);
  const directory = path.join(root, ".github/ISSUE_TEMPLATE");
  mkdirSync(directory, { recursive: true });
  for (const [content, diagnostics] of [
    [validIssueForm, []],
    ["name: [\n", ["bug_report.yaml:2: issue form must contain valid YAML."]],
    [
      "name: bug\ndescription: ''\nbody: []\n",
      [
        "bug_report.yaml: top-level description must be a non-empty string.",
        "bug_report.yaml: top-level name must contain more than 3 characters.",
        "bug_report.yaml: top-level body must be a non-empty array."
      ]
    ],
    [
      validIssueForm
        .replace(
          "  - type: textarea\n    id: problem",
          "  - type: input\n    id: problem!"
        )
        .replace("    id: evidence\n", "")
        .replace("      label: Evidence\n", "      label: ''\n")
        .replace(
          "      description: Provide concrete evidence.\n",
          "      description: ''\n"
        )
        .replace(
          "    validations:\n      required: true\n  - type: textarea\n    id: scope",
          "    validations:\n      required: false\n  - type: textarea\n    id: scope"
        ),
      [
        "bug_report.yaml: body[1] must use the textarea type.",
        "bug_report.yaml: body[1] id may contain only letters, numbers, hyphens, and underscores.",
        "bug_report.yaml: body[2] must have a non-empty string id.",
        "bug_report.yaml: body[2] must have a non-empty string label.",
        "bug_report.yaml: body[2] must have a non-empty string description.",
        "bug_report.yaml: body[2] must require a response."
      ]
    ],
    [
      validIssueForm
        .replace("id: evidence", "id: problem")
        .replace("label: Evidence", "label: Problem"),
      [
        "bug_report.yaml: body[2] repeats field id problem.",
        "bug_report.yaml: body[2] repeats field label Problem."
      ]
    ]
  ]) {
    writeFileSync(path.join(directory, "bug_report.yaml"), content);
    const result = runValidation(root, "issue-forms.mjs");
    assert.equal(
      result.status,
      diagnostics.length === 0 ? 0 : 1,
      result.stderr
    );
    assert.equal(
      result.stdout,
      diagnostics.length === 0 ? "Validated 1 GitHub issue forms.\n" : ""
    );
    assert.equal(
      result.stderr,
      diagnostics
        .map((message) => `.github/ISSUE_TEMPLATE/${message}\n`)
        .join("")
    );
  }
  writeFileSync(path.join(directory, "bug_report.yaml"), validIssueForm);
  writeFileSync(
    path.join(directory, "duplicate.yaml"),
    validIssueForm.replace("name: Bug report", "name: BUG REPORT")
  );
  const duplicate = runValidation(root, "issue-forms.mjs");
  assert.equal(duplicate.status, 1);
  assert.equal(duplicate.stdout, "");
  assert.equal(
    duplicate.stderr,
    ".github/ISSUE_TEMPLATE/duplicate.yaml: top-level name must be unique across issue forms.\n"
  );
});

test("issue forms request the required contribution fields", () => {
  const directory = new URL(".github/ISSUE_TEMPLATE/", repositoryRoot);
  const expectedIds = [
    "problem",
    "evidence",
    "scope",
    "acceptance",
    "ownership_next_action"
  ];
  for (const filename of ["bug_report", "improvement"]) {
    const formPath = new URL(`${filename}.yaml`, directory);
    const content = readFileSync(formPath, "utf-8");
    const form = yamlParser(content);
    assert.ok(!form.description.endsWith("\n"));
    assert.deepEqual(
      form.body.map((field) => field.id),
      expectedIds
    );
    assert.ok(
      form.body.every((field) => !field.attributes.description.endsWith("\n"))
    );
  }
});

test("relative link rule accepts existing files and headings", async (t) => {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), "workgraph-links-"));
  t.after(() => rmSync(temporaryRoot, { force: true, recursive: true }));
  const source = path.join(temporaryRoot, "source.md");
  const target = path.join(temporaryRoot, "target.md");
  writeFileSync(target, "# Target heading\n", "utf-8");
  const errors = await lintRelativeLinks(
    source,
    "[Target](./target.md#target-heading)\n[Repository README](/README.md)\n"
  );
  assert.deepEqual(errors, []);
});

test("relative link rule rejects missing files", async (t) => {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), "workgraph-links-"));
  t.after(() => rmSync(temporaryRoot, { force: true, recursive: true }));
  const source = path.join(temporaryRoot, "source.md");
  const errors = await lintRelativeLinks(source, "[Missing](./missing.md)\n");
  assert.equal(errors.length, 1);
  assert.deepEqual(errors[0].ruleNames, ["relative-links"]);
  assert.equal(errors[0].lineNumber, 1);
  assert.equal(errors[0].severity, "error");
});

test("plugin version command rejects invalid releases and forbidden manifest versions", (t) => {
  const root = copyValidation(t);
  mkdirSync(path.join(root, ".claude-plugin"));
  mkdirSync(path.join(root, ".codex-plugin"));
  for (const [claude, codex, marketplace, packageManifest, diagnostic] of [
    [
      "2026.10.10.07",
      "2026.10.10.07",
      { plugins: [{ name: "workgraph" }] },
      {},
      ""
    ],
    [
      "2026.10.10",
      "2026.10.10.01",
      {},
      {},
      "Claude plugin version must use yyyy.mm.dd.seq format."
    ],
    [
      "2026.02.30.01",
      "2026.02.30.01",
      {},
      {},
      "Claude plugin version must contain a valid date and non-zero sequence."
    ],
    [
      "2026.10.10.00",
      "2026.10.10.00",
      {},
      {},
      "Claude plugin version must contain a valid date and non-zero sequence."
    ],
    [
      "2026.10.10.01",
      "2026.10.10.02",
      {},
      {},
      "Claude and Codex plugin versions must match."
    ],
    [
      "2026.10.10.01",
      "2026.10.10.01",
      { version: "1.0.0" },
      {},
      "Claude marketplace manifest must omit the version field."
    ],
    [
      "2026.10.10.01",
      "2026.10.10.01",
      { plugins: [{ name: "workgraph", version: "1.0.0" }] },
      {},
      "Claude marketplace manifest must omit the version field."
    ],
    [
      "2026.10.10.01",
      "2026.10.10.01",
      {},
      { version: "1.0.0" },
      "Private package manifest must omit the version field."
    ]
  ]) {
    for (const [filename, value] of [
      [".claude-plugin/plugin.json", { version: claude }],
      [".codex-plugin/plugin.json", { version: codex }],
      [".claude-plugin/marketplace.json", marketplace],
      ["package.json", packageManifest]
    ]) {
      writeFileSync(path.join(root, filename), JSON.stringify(value));
    }
    const result = runValidation(root, "plugin-version.mjs");
    assert.equal(result.status, diagnostic === "" ? 0 : 1, result.stderr);
    assert.equal(
      result.stdout,
      diagnostic === ""
        ? "Host plugin versions match, and marketplace and package manifests omit version fields.\n"
        : ""
    );
    assert.equal(
      result.stderr,
      diagnostic === ""
        ? ""
        : `Plugin version validation failed: ${diagnostic}\n`
    );
  }
});

test("validation entrypoints execute from unrelated directories through real and symlinked paths", (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph-entrypoints-"));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  for (const filename of ["issue-forms.mjs", "plugin-version.mjs"]) {
    const source = fileURLToPath(
      new URL(`validation/${filename}`, import.meta.url)
    );
    const alias = path.join(root, filename);
    symlinkSync(source, alias, "file");
    const results = [source, alias].map((entrypoint) =>
      spawnSync(process.execPath, [entrypoint], {
        cwd: root,
        encoding: "utf-8",
        killSignal: "SIGKILL",
        timeout: 5000
      })
    );
    for (const result of results) {
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.ok(result.stdout.trim().length > 0);
    }
    assert.equal(results[0].stdout, results[1].stdout);
  }
});
