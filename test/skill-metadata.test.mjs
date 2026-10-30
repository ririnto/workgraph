import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { validateSkillContent } from "./validation/skill-metadata.mjs";

const skillContent = (
  fields = "name: sample-skill\ndescription: Use for the sample task.",
  body = "Run the sample task.\n"
) => `---\n${fields}\n---\n${body}`;

const metadataFixture = (t) => {
  const temporary = mkdtempSync(
    path.join(tmpdir(), "workgraph-skill-metadata-")
  );
  t.after(() => rmSync(temporary, { force: true, recursive: true }));
  const root = path.join(temporary, "plugin");
  const source = fileURLToPath(
    new URL("validation/skill-metadata.mjs", import.meta.url)
  );
  const entrypoint = path.join(root, "test/validation/skill-metadata.mjs");
  mkdirSync(path.dirname(entrypoint), { recursive: true });
  cpSync(source, entrypoint);
  symlinkSync(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(root, "node_modules")
  );
  return { entrypoint, root };
};

const assertMetadataCommand = (filename, diagnostic = "", count = 1) => {
  const result = spawnSync(process.execPath, [filename], {
    cwd: tmpdir(),
    encoding: "utf-8",
    killSignal: "SIGKILL",
    timeout: 5000
  });
  assert.ifError(result.error);
  assert.equal(result.status, diagnostic === "" ? 0 : 1, result.stderr);
  assert.equal(result.stderr, diagnostic);
  assert.equal(
    result.stdout,
    diagnostic === "" ? `Validated ${count} skill metadata files.\n` : ""
  );
};

test("skill metadata accepts standard fields and host extensions", () => {
  const content = skillContent(`name: sample-skill
description: >-
  Use for the sample task
  with its supplied inputs.
license: MIT
compatibility: Requires Node.js.
allowed-tools: Read Bash(git:*)
metadata:
  author: Sample maintainer
  version: "1.0"
argument-hint: "[goal]"
disable-model-invocation: false
user-invocable: true`);
  assert.deepEqual(validateSkillContent(content, "sample-skill"), []);
  assert.deepEqual(
    validateSkillContent(
      `\uFEFF${content.replaceAll("\n", "\r\n")}`,
      "sample-skill"
    ),
    []
  );
});

test("skill metadata checks required fields and directory identity", () => {
  for (const [fields, directory, diagnostic] of [
    ["description: Task.", "sample-skill", "name must be a non-empty string."],
    [
      "name: sample-skill",
      "sample-skill",
      "description must be a non-empty string."
    ],
    [
      "name: 123\ndescription: Task.",
      "123",
      "name must be a non-empty string."
    ],
    [
      "name: sample-skill\ndescription: false",
      "sample-skill",
      "description must be a non-empty string."
    ],
    [
      "name: sample-skill\ndescription: '  '",
      "sample-skill",
      "description must be a non-empty string."
    ],
    [
      "name: sample-skill\ndescription: Task.",
      "different",
      "name must match its parent directory."
    ],
    ["name: Sample\ndescription: Task.", "Sample", "name must be lowercase."],
    ["name: НАВЫК\ndescription: Task.", "НАВЫК", "name must be lowercase."]
  ]) {
    assert.ok(
      validateSkillContent(skillContent(fields), directory).includes(
        `<skill>: ${diagnostic}`
      )
    );
  }
  for (const name of [
    "-sample",
    "sample-",
    "sample--skill",
    "sample_skill",
    "two words",
    "sample/skill",
    "sample😀"
  ]) {
    const errors = validateSkillContent(
      skillContent(`name: ${JSON.stringify(name)}\ndescription: Task.`),
      name
    );
    assert.ok(
      errors.includes(
        "<skill>: name must contain letters or numbers separated by single hyphens."
      )
    );
  }
});

test("skill metadata counts and normalizes Unicode characters", () => {
  for (const [name, directory] of [
    ["技能", "技能"],
    ["мой-навык", "мой-навык"],
    ["cafe\u0301", "café"],
    ["ｓａｍｐｌｅ", "sample"],
    ["𐐨".repeat(64), "𐐨".repeat(64)]
  ]) {
    assert.deepEqual(
      validateSkillContent(
        skillContent(`name: ${name}\ndescription: Task.`),
        directory
      ),
      []
    );
  }
  for (const [key, limit, value, directory] of [
    ["name", 64, "𐐨", "𐐨".repeat(64)],
    ["description", 1024, "😀", "sample-skill"],
    ["compatibility", 500, "😀", "sample-skill"]
  ]) {
    const defaults = {
      description: "Use for the sample task.",
      name: directory
    };
    const fields = { ...defaults, [key]: value.repeat(limit) };
    assert.deepEqual(
      validateSkillContent(skillContent(JSON.stringify(fields)), directory),
      []
    );
    fields[key] += value;
    assert.ok(
      validateSkillContent(
        skillContent(JSON.stringify(fields)),
        directory
      ).includes(`<skill>: ${key} must contain at most ${limit} characters.`)
    );
  }
});

test("skill metadata rejects invalid optional field types", () => {
  for (const [extra, diagnostic] of [
    ["compatibility: false", "compatibility must be a non-empty string."],
    ["compatibility: ''", "compatibility must be a non-empty string."],
    ["license: null", "license must be a string."],
    ["allowed-tools:\n  - Read", "allowed-tools must be a string."],
    ["metadata: []", "metadata must be a mapping with string values."],
    ["metadata: 2026-10-30", "metadata must be a mapping with string values."],
    [
      "metadata:\n  version: 1",
      "metadata must be a mapping with string values."
    ],
    [
      "metadata:\n  nested:\n    value: text",
      "metadata must be a mapping with string values."
    ]
  ]) {
    const content = skillContent(
      `name: sample-skill\ndescription: Task.\n${extra}`
    );
    assert.ok(
      validateSkillContent(content, "sample-skill").includes(
        `<skill>: ${diagnostic}`
      )
    );
  }
});

test("skill metadata preserves both invocation paths", () => {
  for (const [key, accepted, rejected] of [
    [
      "disable-model-invocation",
      ["false", "NO", "Off", "0", '"false"'],
      ["true", "YES", "On", "1", "null", "[]"]
    ],
    [
      "user-invocable",
      ["true", "YES", "On", "1", '"true"'],
      ["false", "NO", "Off", "0", "null", "[]"]
    ]
  ]) {
    for (const value of accepted) {
      assert.deepEqual(
        validateSkillContent(
          skillContent(
            `name: sample-skill\ndescription: Task.\n${key}: ${value}`
          ),
          "sample-skill"
        ),
        []
      );
    }
    for (const value of rejected) {
      const errors = validateSkillContent(
        skillContent(
          `name: sample-skill\ndescription: Task.\n${key}: ${value}`
        ),
        "sample-skill"
      );
      assert.ok(
        errors.includes(
          `<skill>: ${key} must keep the skill model-invocable and user-invocable.`
        )
      );
    }
  }
});

test("skill metadata rejects malformed frontmatter and empty bodies", () => {
  for (const content of [
    "name: sample-skill\ndescription: Task.\n",
    "---\nname: sample-skill\ndescription: Task.\n",
    "\n---\nname: sample-skill\n---\nBody.\n"
  ]) {
    assert.deepEqual(validateSkillContent(content, "sample-skill"), [
      "<skill>: skill must start with closed YAML frontmatter."
    ]);
  }
  assert.deepEqual(validateSkillContent(skillContent(""), "sample-skill"), [
    "<skill>: frontmatter must contain valid YAML."
  ]);
  for (const fields of ["[]", "2026-10-30", "- item"]) {
    assert.deepEqual(
      validateSkillContent(skillContent(fields), "sample-skill"),
      ["<skill>: frontmatter must be a YAML mapping."]
    );
  }
  for (const fields of [
    "name: [",
    "name: sample-skill\nname: different\ndescription: Task.",
    "name: sample-skill\ndescription: Task.\nmetadata:\n  key: one\n  key: two"
  ]) {
    const errors = validateSkillContent(
      skillContent(fields),
      "sample-skill",
      "fixture/SKILL.md"
    );
    assert.equal(errors.length, 1);
    assert.match(
      errors[0],
      /^fixture\/SKILL\.md:\d+: frontmatter must contain valid YAML\.$/u
    );
  }
  assert.deepEqual(
    validateSkillContent(skillContent(undefined, " \n\t"), "sample-skill"),
    ["<skill>: skill body must contain text."]
  );
  assert.deepEqual(
    validateSkillContent(
      skillContent(undefined, "Instruction.\n".repeat(501)),
      "sample-skill"
    ),
    []
  );
});

test("skill metadata command resolves its own checkout", (t) => {
  const { entrypoint, root } = metadataFixture(t);
  const directory = path.join(root, "skills/sample-skill");
  mkdirSync(directory, { recursive: true });
  const alias = path.join(root, "validate.mjs");
  symlinkSync(entrypoint, alias, "file");
  for (const [content, diagnostic] of [
    [null, "skills/sample-skill/SKILL.md: skill file must be readable.\n"],
    [skillContent(), ""],
    [
      skillContent("name: different\ndescription: Task."),
      "skills/sample-skill/SKILL.md: name must match its parent directory.\n"
    ]
  ]) {
    if (content !== null) {
      writeFileSync(path.join(directory, "SKILL.md"), content);
    }
    for (const filename of [entrypoint, alias]) {
      assertMetadataCommand(filename, diagnostic);
    }
  }
});

test("skill metadata command validates internal links by their alias", (t) => {
  const { entrypoint, root } = metadataFixture(t);
  const directory = path.join(root, "bundled/reference");
  mkdirSync(directory, { recursive: true });
  mkdirSync(path.join(root, "skills/ordinary"), { recursive: true });
  writeFileSync(
    path.join(root, "skills/ordinary/SKILL.md"),
    skillContent("name: ordinary\ndescription: Task.")
  );
  symlinkSync("../bundled/reference", path.join(root, "skills/sample-skill"));
  writeFileSync(path.join(root, "bundled/notes.md"), "Supporting notes.\n");
  symlinkSync("../bundled/notes.md", path.join(root, "skills/notes.md"));
  for (const [content, diagnostic] of [
    [null, "skills/sample-skill/SKILL.md: skill file must be readable.\n"],
    [skillContent(), ""],
    [
      skillContent("name: reference\ndescription: Task."),
      "skills/sample-skill/SKILL.md: name must match its parent directory.\n"
    ]
  ]) {
    if (content !== null) {
      writeFileSync(path.join(directory, "SKILL.md"), content);
    }
    assertMetadataCommand(entrypoint, diagnostic, 2);
  }
});

test("skill metadata command rejects paths outside its plugin root", (t) => {
  for (const source of [
    "skills",
    "skills/sample-skill",
    "skills/sample-skill/SKILL.md"
  ]) {
    const { entrypoint, root } = metadataFixture(t);
    const outside = path.join(root, "../plugin-sibling");
    const target = path.join(outside, source);
    mkdirSync(path.join(outside, "skills/sample-skill"), { recursive: true });
    writeFileSync(
      path.join(outside, "skills/sample-skill/SKILL.md"),
      skillContent()
    );
    const alias = path.join(root, source);
    mkdirSync(path.dirname(alias), { recursive: true });
    symlinkSync(target, alias);
    assertMetadataCommand(
      entrypoint,
      `${source}: path must resolve inside the plugin root.\n`
    );
  }
});

test("skill metadata command rejects unreadable linked skill files", (t) => {
  const { entrypoint, root } = metadataFixture(t);
  const directory = path.join(root, "skills/sample-skill");
  mkdirSync(directory, { recursive: true });
  symlinkSync("missing.md", path.join(directory, "SKILL.md"));
  const diagnostic =
    "skills/sample-skill/SKILL.md: skill file must be readable.\n";
  assertMetadataCommand(entrypoint, diagnostic);
  rmSync(path.join(directory, "SKILL.md"));
  mkdirSync(path.join(directory, "SKILL.md"));
  assertMetadataCommand(entrypoint, diagnostic);
});
