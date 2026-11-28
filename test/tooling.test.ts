import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";

import { lint } from "markdownlint/sync";

import noEmDash from "../rules/no-em-dash.ts";
import noRelativeSkillLinks from "../rules/no-relative-skill-links.ts";
import proseFormat from "../rules/prose-format.ts";
import skillFrontmatter from "../rules/skill-frontmatter.ts";
import tableSeparators from "../rules/table-separators.ts";

/**
 * @param value Parsed JSON value.
 * @returns Whether the value is an object.
 */
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * @param value Parsed JSON value.
 * @returns Whether the value is an array.
 */
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

await test("Git hooks run their repository scripts and propagate their status", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "workgraph-hooks-"));
  try {
    const gitVariables = new Set(
      execFileSync("git", ["rev-parse", "--local-env-vars"], {
        encoding: "utf-8"
      })
        .trim()
        .split("\n")
    );
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([name]) => !gitVariables.has(name))
    );
    execFileSync("git", ["init", "--quiet", "--template="], {
      cwd: directory,
      env
    });
    await mkdir(path.join(directory, ".git", "hooks"));
    const hooks = ["pre-commit", "pre-push"];
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({
        scripts: Object.fromEntries(
          hooks.map((hook) => [
            hook,
            `printf '${hook} %s\\n' "$HOOK_STATUS" > hook-output; exit "$HOOK_STATUS"`
          ])
        )
      })
    );
    await Promise.all(
      hooks.map(async (hook) => {
        await cp(
          path.resolve(import.meta.dirname, "../.husky", hook),
          path.join(directory, ".git", "hooks", hook)
        );
      })
    );
    for (const hook of hooks) {
      for (const status of [0, 17]) {
        const result = spawnSync("git", ["hook", "run", hook], {
          cwd: directory,
          encoding: "utf-8",
          env: { ...env, HOOK_STATUS: String(status) }
        });
        assert.ifError(result.error);
        assert.equal(result.status, status, result.stderr);
        assert.equal(
          readFileSync(path.join(directory, "hook-output"), "utf-8"),
          `${hook} ${status}\n`
        );
      }
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

await test("pre-commit dispatches checks for staged-only tool configuration", async (t) => {
  const cases = [
    ["skills/development/assets/golang/.golangci.yaml", "check:go"],
    ["skills/development/assets/golang/go.mod", "check:go"],
    [
      "skills/development/assets/golang/cmd/golangci-lint/plugins.go",
      "check:go"
    ],
    ["go.work", "check:go"],
    ["scripts/check-go-workspace.ts", "check:go"],
    ["scripts/check-shell-policy.ts", "check:shell"],
    [
      "skills/development/assets/gradle/gradle/libs.versions.toml",
      "check:kotlin"
    ],
    ["skills/development/assets/gradle/.editorconfig", "check:kotlin"],
    [
      "skills/development/assets/nodejs/oxlint.config.ts",
      "check:node-consumer"
    ],
    [
      "skills/development/assets/nodejs/plugins/comments.ts",
      "check:node-consumer"
    ],
    [
      "skills/development/assets/typescript/tsconfig.json",
      "check:node-consumer"
    ],
    ["notes.txt", ""]
  ];
  await Promise.all(
    cases.map(async ([file, expected]) => {
      await t.test(file, async (caseContext) => {
        const directory = await mkdtemp(
          path.join(tmpdir(), "workgraph-staged-")
        );
        caseContext.after(async () => {
          await rm(directory, { force: true, recursive: true });
        });
        const env = {
          ...process.env,
          GIT_DIR: path.join(directory, ".git"),
          GIT_INDEX_FILE: path.join(directory, ".git/index"),
          GIT_WORK_TREE: directory,
          PATH: `${directory}${path.delimiter}${process.env.PATH ?? ""}`
        };
        const staged = path.join(directory, file);
        await mkdir(path.dirname(staged), { recursive: true });
        await writeFile(staged, "fixture\n");
        await writeFile(
          path.join(directory, "pnpm"),
          '#!/bin/sh\nprintf "%s\\n" "$@"\nexit 19\n',
          { mode: 0o755 }
        );
        for (const args of [
          ["init", "--template=", "-q"],
          ["add", "--", file]
        ]) {
          const result = spawnSync("git", args, {
            cwd: directory,
            encoding: "utf-8",
            env
          });
          assert.ifError(result.error);
          assert.equal(result.status, 0, result.stderr);
        }
        const result = spawnSync(
          process.execPath,
          [path.resolve(import.meta.dirname, "../scripts/pre-commit-scope.ts")],
          { cwd: directory, encoding: "utf-8", env }
        );
        assert.ifError(result.error);
        assert.equal(result.status, 19, result.stderr);
        const dispatched = result.stdout
          .split("\n")
          .filter((argument) =>
            [
              "check:go",
              "check:kotlin",
              "check:node-consumer",
              "check:shell"
            ].includes(argument)
          );
        assert.deepEqual(dispatched, expected ? [expected] : []);
      });
    })
  );
});

/**
 * @param t Test that owns the fixture.
 * @param files Paths and contents to track.
 * @returns Options for checks in the fixture.
 */
const createTrackedFixture = (
  t: TestContext,
  files: Record<string, string>
): { cwd: string; env: NodeJS.ProcessEnv; encoding: "utf-8" } => {
  const cwd = mkdtempSync(path.join(tmpdir(), "workgraph-native-check-"));
  t.after(() => {
    rmSync(cwd, { force: true, recursive: true });
  });
  const gitVariables = new Set(
    execFileSync("git", ["rev-parse", "--local-env-vars"], {
      encoding: "utf-8"
    })
      .trim()
      .split("\n")
  );
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !gitVariables.has(key))
  );
  const options: { cwd: string; env: NodeJS.ProcessEnv; encoding: "utf-8" } = {
    cwd,
    env,
    encoding: "utf-8"
  };
  execFileSync("git", ["init", "--quiet", "--template="], options);
  for (const [file, source] of Object.entries(files)) {
    const target = path.join(cwd, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
  execFileSync("git", ["add", "--", ...Object.keys(files)], options);
  return options;
};

/**
 * @param stderr Diagnostics from the check process.
 * @returns The path and rule of each diagnostic.
 */
const ruleDiagnostics = (stderr: string): { file: string; rule: string }[] =>
  stderr
    .trimEnd()
    .split("\n")
    .map((line) => {
      const fields = /^(?<file>.+?)(?::\d+:\d+)? \[(?<rule>R\d+)\] /u.exec(
        line
      )?.groups;
      assert.ok(fields?.file !== undefined && fields.rule !== undefined, line);
      return { file: fields.file, rule: fields.rule };
    });

await test("shell policy reports discarded diagnostics and portable guard violations", (t) => {
  const filename = "hook sample.sh";
  const control = [
    "#!/usr/bin/env bash",
    'value="$1"',
    'printf "%s\\n" "literal > /dev/null"',
    "cat </dev/null",
    "curl -o /dev/null https://example.invalid",
    'if [ -z "$value" ]; then exit 1; fi',
    '[[ "$value" == a* ]] && echo pattern',
    '[[ "$value" =~ ^a ]] && echo regex',
    "[[ $value == a* ]] && echo pattern",
    "[[ $value =~ ^a ]] && echo regex",
    'test -n "$value" || echo empty && echo done',
    'test -n "$value" || exit 1 && echo done',
    '! test -n "$value" || exit 1',
    'test -n "$value" || exit 1 &',
    'test -n "$value" || exit 1 2>guard.log',
    'for item in "$@"; do',
    '  if [ -z "$item" ]; then exit 1; fi',
    "done"
  ];
  const defect = [
    "echo hello > /dev/null",
    'echo hello 2>>"/dev"/null',
    '[[ -n "$value" ]]',
    '[ "$value" != "" ] || exit 1',
    'case "$value" in',
    '  *) test -n "$value" || exit 2 ;;',
    "esac",
    '(test -n "$value" || exit 3)',
    "[[ -n $value ]]",
    `[[ -z \${value} ]]`,
    "[[ -f $value ]]",
    "test -n $value || exit 4",
    `[ \${value} != $expected ] || exit 5`
  ];
  const fixture = createTrackedFixture(t, {
    [filename]: `${control.join("\n")}\n`,
    "test/fixtures/excluded.sh": "#!/bin/sh\necho fixture > /dev/null\n"
  });
  const args = [
    path.resolve(import.meta.dirname, "../scripts/check-shell-policy.ts")
  ];
  const clean = spawnSync(process.execPath, args, fixture);
  assert.ifError(clean.error);
  assert.equal(clean.status, 0, clean.stderr);
  assert.equal(clean.stderr, "");
  const source = `${[...control, ...defect].join("\n")}\n`;
  const file = path.join(fixture.cwd, filename);
  writeFileSync(file, source);
  const rejected = spawnSync(process.execPath, args, fixture);
  assert.ifError(rejected.error);
  assert.equal(rejected.status, 1, rejected.stderr);
  assert.deepEqual(ruleDiagnostics(rejected.stderr), [
    { file: filename, rule: "R31" },
    { file: filename, rule: "R31" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" },
    { file: filename, rule: "R33" }
  ]);
  assert.equal(readFileSync(file, "utf-8"), source);
});

await test("Go workspace policy requires tracked modules and ignores fixture modules", (t) => {
  const fixture = createTrackedFixture(t, {
    "go.mod": "module example.invalid/root\n\ngo 1.24\n",
    "test/fixtures/excluded/go.mod":
      "module example.invalid/excluded\n\ngo 1.24\n"
  });
  const args = [
    path.resolve(import.meta.dirname, "../scripts/check-go-workspace.ts")
  ];
  writeFileSync(
    path.join(fixture.cwd, "go"),
    "#!/bin/sh\nprintf 'go invoked\\n' >> go-invocations\nexit 99\n",
    { mode: 0o700 }
  );
  const withoutWorkspace = {
    ...fixture,
    env: {
      ...fixture.env,
      PATH: `${fixture.cwd}${path.delimiter}${fixture.env.PATH ?? ""}`
    }
  };
  const single = spawnSync(process.execPath, args, withoutWorkspace);
  assert.ifError(single.error);
  assert.equal(single.status, 0, single.stderr);
  assert.equal(single.stderr, "");
  mkdirSync(path.join(fixture.cwd, "asset"));
  writeFileSync(
    path.join(fixture.cwd, "asset/go.mod"),
    "module example.invalid/asset\n\ngo 1.24\n"
  );
  execFileSync("git", ["add", "--", "asset/go.mod"], fixture);
  const workspace = path.join(fixture.cwd, "go.work");
  writeFileSync(workspace, "go 1.24\n\nuse (\n\t.\n\t./asset\n)\n");
  const missing = spawnSync(process.execPath, args, withoutWorkspace);
  assert.ifError(missing.error);
  assert.equal(missing.status, 1, missing.stderr);
  assert.deepEqual(ruleDiagnostics(missing.stderr), [
    { file: "asset/go.mod", rule: "R40" },
    { file: "go.mod", rule: "R40" }
  ]);
  assert.equal(existsSync(path.join(fixture.cwd, "go-invocations")), false);
  execFileSync("git", ["add", "--", "go.work"], fixture);
  const clean = spawnSync(process.execPath, args, fixture);
  assert.ifError(clean.error);
  assert.equal(clean.status, 0, clean.stderr);
  assert.equal(clean.stderr, "");
  const incomplete = "go 1.24\n\nuse (\n\t.\n\t./obsolete\n)\n";
  writeFileSync(workspace, incomplete);
  const rejected = spawnSync(process.execPath, args, fixture);
  assert.ifError(rejected.error);
  assert.equal(rejected.status, 1, rejected.stderr);
  assert.deepEqual(ruleDiagnostics(rejected.stderr), [
    { file: "asset/go.mod", rule: "R40" },
    { file: "obsolete/go.mod", rule: "R40" }
  ]);
  assert.equal(readFileSync(workspace, "utf-8"), incomplete);
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

await test("the copied prose rule reports maintained fixtures through CLI2", async () => {
  const directory = await mkdtemp(
    path.join(tmpdir(), "workgraph-copied-prose-")
  );
  const ruleDirectory = path.join(directory, "rules");
  const fixtureDirectory = path.join(
    import.meta.dirname,
    "../rules/fixtures/prose-format"
  );
  const command = path.join(
    import.meta.dirname,
    "../node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs"
  );
  try {
    await mkdir(ruleDirectory);
    await cp(
      path.join(import.meta.dirname, "../.gitignore"),
      path.join(directory, ".gitignore")
    );
    await symlink(
      path.join(import.meta.dirname, "../node_modules"),
      path.join(directory, "node_modules"),
      "dir"
    );
    await cp(
      path.join(import.meta.dirname, "../rules/prose-format.ts"),
      path.join(ruleDirectory, "prose-format.ts")
    );
    await writeFile(
      path.join(directory, ".markdownlint-cli2.jsonc"),
      JSON.stringify({
        config: { default: false, "docs/prose-format": true },
        customRules: ["rules/prose-format.ts"],
        gitignore: true
      })
    );
    await Promise.all(
      ["valid", "invalid"].map(async (name) => {
        await cp(
          path.join(fixtureDirectory, `${name}.md.txt`),
          path.join(directory, `${name}.md`)
        );
      })
    );
    await writeFile(
      path.join(directory, "suppressed.md"),
      "<!-- markdownlint-disable docs/prose-format -->\n# First. Second.\n"
    );
    const valid = spawnSync(
      process.execPath,
      [command, "valid.md", "suppressed.md"],
      { cwd: directory, encoding: "utf-8", timeout: 15_000 }
    );
    assert.ifError(valid.error);
    assert.equal(valid.status, 0, valid.stderr + valid.stdout);
    assert.equal(
      valid.stderr + valid.stdout,
      `markdownlint-cli2 v0.24.2 (markdownlint v0.42.2)
Finding: valid.md suppressed.md
Linting: 2 files
Summary: 0 issues in 0 files
`
    );
    const invalid = spawnSync(
      process.execPath,
      [command, "--fix", "invalid.md"],
      { cwd: directory, encoding: "utf-8", timeout: 15_000 }
    );
    assert.ifError(invalid.error);
    assert.equal(invalid.status, 1, invalid.stderr + invalid.stdout);
    assert.equal(
      invalid.stderr + invalid.stdout,
      `invalid.md:1 error docs/prose-format Prose sentences must be separated by source lines [Put each sentence on its own source line.]
invalid.md:3 error docs/prose-format Prose sentences must be separated by source lines [Put each sentence on its own source line.]
invalid.md:5 error docs/prose-format Prose sentences must be separated by source lines [Put each sentence on its own source line.]
invalid.md:7 error docs/prose-format Prose sentences must be separated by source lines [Do not join prose with semicolons.]
invalid.md:9 error docs/prose-format Prose sentences must be separated by source lines [Put each sentence on its own source line.]
markdownlint-cli2 v0.24.2 (markdownlint v0.42.2)
Finding: invalid.md
Linting: 1 file
Summary: 5 issues in 1 file
`
    );
    assert.equal(
      readFileSync(path.join(directory, "invalid.md"), "utf-8"),
      readFileSync(path.join(fixtureDirectory, "invalid.md.txt"), "utf-8")
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

await test("em-dash rule checks prose and preserves code, links, and attributed material", async (t) => {
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
    errors
      .map(({ errorRange, lineNumber, ruleNames }) => ({
        errorRange,
        lineNumber,
        ruleNames
      }))
      .toSorted((left, right) => left.lineNumber - right.lineNumber),
    [
      { errorRange: [11, 1], lineNumber: 1, ruleNames: ["docs/no-em-dash"] },
      { errorRange: [7, 1], lineNumber: 3, ruleNames: ["docs/no-em-dash"] },
      { errorRange: [8, 1], lineNumber: 4, ruleNames: ["docs/no-em-dash"] },
      { errorRange: [9, 1], lineNumber: 8, ruleNames: ["docs/no-em-dash"] }
    ]
  );
  const cases = [
    {
      name: "preserves an inline quotation attributed by a linked source",
      filename: "docs/attributed-quote.md",
      source: "[Original source](https://example.com): “Imported — prose.”\n",
      expected: []
    },
    {
      name: "reports an authored quoted phrase without a source",
      filename: "docs/authored-quote.md",
      source: "An author says “Imported — prose.”\n",
      expected: [
        {
          errorRange: [26, 1],
          lineNumber: 1,
          ruleNames: ["docs/no-em-dash"]
        }
      ]
    },
    {
      name: "reports a quotation after escaped link syntax",
      filename: "docs/authored-quote.md",
      source: "\\[Original source](https://example.com): “Authored — prose.”\n",
      expected: [
        {
          errorRange: [52, 1],
          lineNumber: 1,
          ruleNames: ["docs/no-em-dash"]
        }
      ]
    },
    {
      name: "preserves frontmatter-marked generated prose",
      filename: "docs/generated-frontmatter.md",
      source: "---\ngenerated: true\n---\n\nImported — prose.\n",
      expected: []
    },
    {
      name: "reports authored prose when frontmatter is not generated",
      filename: "docs/authored-frontmatter.md",
      source: "---\ngenerated: false\n---\n\nAuthored — prose.\n",
      expected: [
        {
          errorRange: [10, 1],
          lineNumber: 5,
          ruleNames: ["docs/no-em-dash"]
        }
      ]
    },
    {
      name: "preserves prose below an early generated HTML marker",
      filename: "docs/generated-html.md",
      source: "<!-- Generated document -->\n\nImported — prose.\n",
      expected: []
    },
    {
      name: "reports prose when the generated HTML marker is late",
      filename: "docs/authored-late-marker.md",
      source:
        "Intro.\nLine two.\nLine three.\nLine four.\nLine five.\n<!-- Generated document -->\n\nAuthored — prose.\n",
      expected: [
        {
          errorRange: [10, 1],
          lineNumber: 8,
          ruleNames: ["docs/no-em-dash"]
        }
      ]
    },
    {
      name: "preserves license-file prose",
      filename: "LICENSE.md",
      source: "Imported — prose.\n",
      expected: []
    },
    {
      name: "preserves LICENCE prose",
      filename: "LICENCE",
      source: "Imported — prose.\n",
      expected: []
    },
    {
      name: "preserves COPYING prose",
      filename: "COPYING",
      source: "Imported — prose.\n",
      expected: []
    },
    {
      name: "reports prose in a non-license filename",
      filename: "docs/licensing.md",
      source: "Authored — prose.\n",
      expected: [
        {
          errorRange: [10, 1],
          lineNumber: 1,
          ruleNames: ["docs/no-em-dash"]
        }
      ]
    }
  ];
  await Promise.all(
    cases.map(
      async ({ expected, filename: caseFilename, name, source: input }) => {
        await t.test(name, () => {
          const findings =
            lint({
              config: { default: false, "docs/no-em-dash": true },
              customRules: [noEmDash],
              strings: { [caseFilename]: input }
            })[caseFilename] ?? [];
          assert.deepEqual(
            findings.map(({ errorRange, lineNumber, ruleNames }) => ({
              errorRange,
              lineNumber,
              ruleNames
            })),
            expected
          );
        });
      }
    )
  );
});

await test("skill links preserve bundled links and flag external relative targets", async (t) => {
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
    errors.map(({ lineNumber, ruleNames }) => ({ lineNumber, ruleNames })),
    [
      { lineNumber: 5, ruleNames: ["docs/no-relative-skill-links"] },
      { lineNumber: 7, ruleNames: ["docs/no-relative-skill-links"] },
      { lineNumber: 12, ruleNames: ["docs/no-relative-skill-links"] }
    ]
  );
  const cases = [
    {
      name: "preserves a linked-source quotation with a relative skill link",
      filename: "skills/sample/references/guide.md",
      source:
        "[Original source](https://example.com): “Read [outside](../../../examples/quoted/SKILL.md).”\n",
      expected: []
    },
    {
      name: "reports an authored quotation with a relative skill link",
      filename: "skills/sample/references/guide.md",
      source:
        "An author says “Read [outside](../../../examples/quoted/SKILL.md).”\n",
      expected: [{ lineNumber: 1, ruleNames: ["docs/no-relative-skill-links"] }]
    },
    {
      name: "reports a relative skill link after malformed attribution",
      filename: "skills/sample/references/guide.md",
      source:
        "[Original source](invalid destination): “Read [outside](../../../examples/quoted/SKILL.md).”\n",
      expected: [{ lineNumber: 1, ruleNames: ["docs/no-relative-skill-links"] }]
    },
    {
      name: "preserves a relative skill link in generated frontmatter content",
      filename: "docs/generated-frontmatter.md",
      source:
        "---\ngenerated: true\n---\n\n[Outside](../examples/other/SKILL.md)\n",
      expected: []
    },
    {
      name: "reports a relative skill link when frontmatter is not generated",
      filename: "docs/authored-frontmatter.md",
      source:
        "---\ngenerated: false\n---\n\n[Outside](../examples/other/SKILL.md)\n",
      expected: [{ lineNumber: 5, ruleNames: ["docs/no-relative-skill-links"] }]
    },
    {
      name: "preserves a relative skill link in an early generated document",
      filename: "docs/generated-html.md",
      source:
        "<!-- Generated document -->\n\n[Outside](../examples/other/SKILL.md)\n",
      expected: []
    },
    {
      name: "reports a relative skill link when the generated marker is late",
      filename: "docs/authored-late-marker.md",
      source:
        "Intro.\nLine two.\nLine three.\nLine four.\nLine five.\n<!-- Generated document -->\n\n[Outside](../examples/other/SKILL.md)\n",
      expected: [{ lineNumber: 8, ruleNames: ["docs/no-relative-skill-links"] }]
    },
    {
      name: "preserves a relative skill link in a license file",
      filename: "LICENSE.md",
      source: "[Outside](examples/other/SKILL.md)\n",
      expected: []
    },
    {
      name: "preserves a relative skill link in LICENCE",
      filename: "LICENCE",
      source: "[Outside](examples/other/SKILL.md)\n",
      expected: []
    },
    {
      name: "preserves a relative skill link in COPYING",
      filename: "COPYING",
      source: "[Outside](examples/other/SKILL.md)\n",
      expected: []
    },
    {
      name: "reports a relative skill link in a non-license filename",
      filename: "docs/licensing.md",
      source: "[Outside](../examples/other/SKILL.md)\n",
      expected: [{ lineNumber: 1, ruleNames: ["docs/no-relative-skill-links"] }]
    }
  ];
  await Promise.all(
    cases.map(
      async ({ expected, filename: caseFilename, name, source: input }) => {
        await t.test(name, () => {
          const findings =
            lint({
              config: {
                default: false,
                "docs/no-relative-skill-links": true
              },
              customRules: [noRelativeSkillLinks],
              strings: { [caseFilename]: input }
            })[caseFilename] ?? [];
          assert.deepEqual(
            findings.map(({ lineNumber, ruleNames }) => ({
              lineNumber,
              ruleNames
            })),
            expected
          );
        });
      }
    )
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

await test("table separator diagnostics retain fix information and protect original documents", async (t) => {
  const source = "| Left | Right |\n| -- | ----: |\n| one | two |\n";
  const errors =
    lint({
      config: { default: false, "docs/table-separators": true },
      customRules: [tableSeparators],
      strings: { "input.md": source }
    })["input.md"] ?? [];
  assert.equal(errors.length, 2);
  assert.deepEqual(
    errors.map(
      ({ errorDetail, errorRange, fixInfo, lineNumber, ruleNames }) => ({
        detail: errorDetail,
        fixInfo,
        lineNumber,
        range: errorRange,
        ruleNames
      })
    ),
    [
      {
        detail: "Separator cell 1 must use exactly ---.",
        fixInfo: { deleteCount: 2, editColumn: 3, insertText: "---" },
        lineNumber: 2,
        range: [3, 2],
        ruleNames: ["docs/table-separators"]
      },
      {
        detail: "Separator cell 2 must use exactly ---.",
        fixInfo: { deleteCount: 4, editColumn: 8, insertText: "---" },
        lineNumber: 2,
        range: [8, 4],
        ruleNames: ["docs/table-separators"]
      }
    ]
  );
  const cases = [
    {
      name: "preserves a malformed separator in generated frontmatter content",
      filename: "docs/generated-frontmatter.md",
      source:
        "---\ngenerated: true\n---\n\n| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: []
    },
    {
      name: "reports a malformed separator when frontmatter is not generated",
      filename: "docs/authored-frontmatter.md",
      source:
        "---\ngenerated: false\n---\n\n| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: [
        {
          detail: "Separator cell 1 must use exactly ---.",
          fixInfo: { deleteCount: 2, editColumn: 3, insertText: "---" },
          lineNumber: 6,
          range: [3, 2],
          ruleNames: ["docs/table-separators"]
        }
      ]
    },
    {
      name: "preserves a malformed separator below an early generated HTML marker",
      filename: "docs/generated-html.md",
      source:
        "<!-- Generated document -->\n\n| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: []
    },
    {
      name: "reports a malformed separator when the generated HTML marker is late",
      filename: "docs/authored-late-marker.md",
      source:
        "Intro.\nLine two.\nLine three.\nLine four.\nLine five.\n<!-- Generated document -->\n\n| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: [
        {
          detail: "Separator cell 1 must use exactly ---.",
          fixInfo: { deleteCount: 2, editColumn: 3, insertText: "---" },
          lineNumber: 9,
          range: [3, 2],
          ruleNames: ["docs/table-separators"]
        }
      ]
    },
    {
      name: "preserves a malformed separator in a license file",
      filename: "LICENSE.md",
      source: "| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: []
    },
    {
      name: "preserves a malformed separator in LICENCE",
      filename: "LICENCE",
      source: "| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: []
    },
    {
      name: "preserves a malformed separator in COPYING",
      filename: "COPYING",
      source: "| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: []
    },
    {
      name: "reports a malformed separator in a non-license filename",
      filename: "docs/licensing.md",
      source: "| Left | Right |\n| -- | --- |\n| one | two |\n",
      expected: [
        {
          detail: "Separator cell 1 must use exactly ---.",
          fixInfo: { deleteCount: 2, editColumn: 3, insertText: "---" },
          lineNumber: 2,
          range: [3, 2],
          ruleNames: ["docs/table-separators"]
        }
      ]
    }
  ];
  await Promise.all(
    cases.map(
      async ({ expected, filename: caseFilename, name, source: input }) => {
        await t.test(name, () => {
          const findings =
            lint({
              config: { default: false, "docs/table-separators": true },
              customRules: [tableSeparators],
              strings: { [caseFilename]: input }
            })[caseFilename] ?? [];
          assert.deepEqual(
            findings.map(
              ({
                errorDetail,
                errorRange,
                fixInfo,
                lineNumber,
                ruleNames
              }) => ({
                detail: errorDetail,
                fixInfo,
                lineNumber,
                range: errorRange,
                ruleNames
              })
            ),
            expected
          );
        });
      }
    )
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
 * @param t Test that owns the fixture.
 * @returns Directory with the real Ultracite configuration.
 */
const createUltraciteFixture = async (t: TestContext): Promise<string> => {
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
      "skills/development/assets/nodejs/plugins"
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
 * @param directory Fixture checkout.
 * @param files Paths to check.
 * @returns Lint diagnostics and exit status.
 */
const runUltraciteFixture = (
  directory: string,
  files: string[]
): { diagnostics: unknown[]; status: number | null } => {
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
  const output: unknown = JSON.parse(
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

await test("TSDoc checks members of directly exported variable class expressions", async (t) => {
  const directory = await createUltraciteFixture(t);
  await writeFile(
    path.join(directory, "source.ts"),
    `/**
 * Public service.
 */
export const Service = class {
  /** One-line method documentation. */
  invalid() { return 1; }
  /**
   * Documented public method.
   */
  documented() { return 1; }
  publicMissing() { return 1; }
  protected protectedMissing() { return 1; }
  constructor() {}
};
/**
 * Name of the internal implementation.
 */
export const { name: implementationName } = class Internal {
  internalHelper() { return 1; }
};
`
  );
  const { diagnostics, status } = runUltraciteFixture(directory, ["source.ts"]);
  assert.equal(status, 1);
  const messages = diagnostics.flatMap((entry) => {
    assert.ok(isObject(entry));
    assert.ok(typeof entry.code === "string");
    assert.ok(typeof entry.message === "string");
    return entry.code === "tsdoc(require-export-tsdoc)" ? [entry.message] : [];
  });
  assert.deepEqual(messages.toSorted(), [
    'Missing TSDoc for exported public API method "constructor".',
    'Missing TSDoc for exported public API method "protectedMissing".',
    'Missing TSDoc for exported public API method "publicMissing".',
    'Use multiline TSDoc with opening and closing delimiters on separate lines for exported public API method "invalid".'
  ]);
});

await test("comment lint reports loose body and module comments once and honors language matching", async (t) => {
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
  await Promise.all(
    [...matchingFiles, ...nonmatchingFiles].map(async (file) => {
      await writeFile(
        path.join(directory, file),
        file.startsWith("nonmatching.") ? nonmatching : matching
      );
    })
  );
  const { diagnostics, status } = runUltraciteFixture(directory, [
    ...matchingFiles,
    ...nonmatchingFiles
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
  const assets = path.join(root, "skills/development/assets/markdown");
  await mkdir(path.join(directory, "rules"));
  await mkdir(path.join(directory, "node_modules"));
  await Promise.all([
    cp(
      path.join(assets, "rules/comments.ts"),
      path.join(directory, "rules/comments.ts")
    ),
    writeFile(
      path.join(directory, "node_modules/ignored.md"),
      "# Dependency\n\n<!-- Ignore this dependency file. -->\n"
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
        "<!-- markdownlint-disable-next-line line-length -->",
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
  const config: unknown = JSON.parse(
    readFileSync(path.join(assets, ".markdownlint-cli2.jsonc"), "utf-8")
  );
  assert.ok(isObject(config));
  assert.ok(isObject(config.config));
  const hiddenDiagnostics = [
    ["rejected.md:3", "error", "comments/no-hidden-notes"],
    ["rejected.md:5", "error", "comments/no-hidden-notes"],
    ["rejected.md:7", "error", "comments/no-hidden-notes"]
  ];
  const linkDiagnostic = [
    "rejected.md:10:1",
    "error",
    "MD053/link-image-reference-definitions"
  ];
  const acceptedFile = path.join(directory, "accepted.md");
  const rejectedFile = path.join(directory, "rejected.md");
  const acceptedBytes = readFileSync(acceptedFile);
  const rejectedBytes = readFileSync(rejectedFile);
  for (const [settings, expected] of [
    [config.config, [...hiddenDiagnostics, linkDiagnostic]],
    [
      { ...config.config, "link-image-reference-definitions": false },
      hiddenDiagnostics
    ],
    [{ ...config.config, "comments/no-hidden-notes": false }, [linkDiagnostic]]
  ]) {
    writeFileSync(
      path.join(directory, ".markdownlint-cli2.jsonc"),
      JSON.stringify({ ...config, config: settings })
    );
    const accepted = spawnSync(
      process.execPath,
      [command, "--no-globs", "accepted.md"],
      { cwd: directory, encoding: "utf-8" }
    );
    assert.ifError(accepted.error);
    assert.equal(accepted.status, 0, accepted.stderr);
    const rejected = spawnSync(process.execPath, [command], {
      cwd: directory,
      encoding: "utf-8"
    });
    assert.ifError(rejected.error);
    assert.equal(rejected.status, 1, rejected.stderr);
    assert.deepEqual(
      rejected.stderr
        .trim()
        .split("\n")
        .map((line) => line.split(" ").slice(0, 3)),
      expected
    );
    assert.deepEqual(readFileSync(acceptedFile), acceptedBytes);
    assert.deepEqual(readFileSync(rejectedFile), rejectedBytes);
  }
});

await test("bundled pnpm samples accept their frozen lockfiles", async (t) => {
  const root = path.resolve(
    import.meta.dirname,
    "../skills/development/assets"
  );
  const directory = await mkdtemp(
    path.join(tmpdir(), "workgraph-sample-lock-")
  );
  t.after(async () => {
    await rm(directory, { force: true, recursive: true });
  });
  for (const sample of ["markdown", "nodejs"]) {
    const cwd = path.join(directory, sample);
    mkdirSync(cwd);
    for (const file of [
      "package.json",
      "pnpm-workspace.yaml",
      "pnpm-lock.yaml"
    ]) {
      writeFileSync(
        path.join(cwd, file),
        readFileSync(path.join(root, sample, file))
      );
    }
    const result = spawnSync(
      "pnpm",
      ["install", "--lockfile-only", "--frozen-lockfile"],
      { cwd, encoding: "utf-8", timeout: 120_000 }
    );
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  }
});
