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

import { validateSkillContent } from "../scripts/skill-metadata.mjs";

const skillContent = (
  fields = "name: sample-skill\ndescription: Use for the sample task.\ndisable-model-invocation: true",
  body = "Run the sample task.\n"
) => `---\n${fields}\n---\n${body}`;

/**
 * @param {import("node:test").TestContext} t Test lifecycle.
 * @returns {{entrypoint: string, root: string}} Relocated validator and plugin root.
 */
const metadataFixture = (t) => {
  const temporary = mkdtempSync(
    path.join(tmpdir(), "workgraph-skill-metadata-")
  );
  t.after(() => {
    rmSync(temporary, { force: true, recursive: true });
  });
  const root = path.join(temporary, "plugin");
  const source = fileURLToPath(
    new URL("../scripts/skill-metadata.mjs", import.meta.url)
  );
  const entrypoint = path.join(root, "scripts/skill-metadata.mjs");
  mkdirSync(path.dirname(entrypoint), { recursive: true });
  cpSync(source, entrypoint);
  symlinkSync(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(root, "node_modules")
  );
  return { entrypoint, root };
};

/**
 * @param {string} filename Entrypoint.
 * @param {string} diagnostic Expected stderr.
 * @param {number} count Expected skill count.
 */
const assertMetadataCommand = (filename, diagnostic = "", count = 1) => {
  const result = spawnSync(process.execPath, [filename], {
    cwd: tmpdir(),
    encoding: "utf-8",
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

await test("skill metadata accepts standard fields and host extensions", () => {
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
disable-model-invocation: true
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

await test("skill metadata checks required fields and directory identity", () => {
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
    assert.deepEqual(
      validateSkillContent(
        skillContent(`${fields}\ndisable-model-invocation: true`),
        directory
      ),
      [`<skill>: ${diagnostic}`]
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
      skillContent(
        `name: ${JSON.stringify(name)}\ndescription: Task.\ndisable-model-invocation: true`
      ),
      name
    );
    assert.deepEqual(errors, [
      "<skill>: name must contain letters or numbers separated by single hyphens."
    ]);
  }
});

await test("skill metadata counts and normalizes Unicode characters", () => {
  for (const [name, directory] of [
    ["技能", "技能"],
    ["мой-навык", "мой-навык"],
    ["cafe\u0301", "café"],
    ["ｓａｍｐｌｅ", "sample"],
    ["𐐨".repeat(64), "𐐨".repeat(64)]
  ]) {
    assert.deepEqual(
      validateSkillContent(
        skillContent(
          `name: ${name}\ndescription: Task.\ndisable-model-invocation: true`
        ),
        directory
      ),
      []
    );
  }
  /** @type {[string, number, string, string][]} */
  const boundaries = [
    ["name", 64, "𐐨", "𐐨".repeat(64)],
    ["description", 1024, "😀", "sample-skill"],
    ["compatibility", 500, "😀", "sample-skill"]
  ];
  for (const [key, limit, value, directory] of boundaries) {
    const defaults = {
      description: "Use for the sample task.",
      "disable-model-invocation": true,
      name: directory
    };
    /** @type {Record<string, string | boolean>} */
    const fields = { ...defaults, [key]: value.repeat(limit) };
    assert.deepEqual(
      validateSkillContent(skillContent(JSON.stringify(fields)), directory),
      []
    );
    fields[key] = value.repeat(limit + 1);
    assert.deepEqual(
      validateSkillContent(
        skillContent(JSON.stringify(fields)),
        key === "name" ? value.repeat(limit + 1) : directory
      ),
      [`<skill>: ${key} must contain at most ${limit} characters.`]
    );
  }
});

await test("portable skill prompts fit Codex's complete-file byte budget", () => {
  const source = skillContent();
  const boundary = source + "x".repeat(8000 - source.length);
  const unicodeBoundary = `${boundary.slice(0, -2)}é`;
  for (const content of [boundary, unicodeBoundary]) {
    assert.deepEqual(validateSkillContent(content, "sample-skill"), []);
  }
  for (const content of [
    `${boundary}x`,
    `${unicodeBoundary}x`,
    `\uFEFF${boundary}`,
    boundary.replaceAll("\n", "\r\n")
  ]) {
    assert.deepEqual(validateSkillContent(content, "sample-skill"), [
      "<skill>: complete file must fit Codex's 8000-byte portable skill prompt limit."
    ]);
  }
});

await test("only Development can opt into a bounded same-file continuation", () => {
  const fields =
    "name: development\ndescription: Task.\ndisable-model-invocation: true";
  const enabled = skillContent(
    `${fields}\nmetadata:\n  workgraph-continuation: same-file`
  );
  const content = enabled + "é".repeat(12_000);
  assert.deepEqual(validateSkillContent(content, "development"), []);
  const disabled = skillContent(fields, "x".repeat(8000));
  assert.deepEqual(validateSkillContent(disabled, "development"), [
    "<skill>: complete file must fit Codex's 8000-byte portable skill prompt limit."
  ]);
  assert.deepEqual(
    validateSkillContent(
      content.replace("name: development", "name: sample-skill"),
      "sample-skill"
    ),
    [
      "<skill>: complete file must fit Codex's 8000-byte portable skill prompt limit."
    ]
  );
});

await test("skill metadata rejects invalid optional field types", () => {
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
      `name: sample-skill\ndescription: Task.\ndisable-model-invocation: true\n${extra}`
    );
    assert.deepEqual(validateSkillContent(content, "sample-skill"), [
      `<skill>: ${diagnostic}`
    ]);
  }
});

await test("skill metadata blocks model invocation and keeps user invocation on", () => {
  /** @type {[string, string[], string[], string][]} */
  const invocationCases = [
    [
      "disable-model-invocation",
      ["true", "YES", "On", "1", '"true"'],
      ["false", "NO", "Off", "0", "null", "[]"],
      "must be true."
    ],
    [
      "user-invocable",
      ["true", "YES", "On", "1", '"true"'],
      ["false", "NO", "Off", "0", "null", "[]"],
      "must keep the skill user-invocable."
    ]
  ];
  for (const [key, accepted, rejected, diagnostic] of invocationCases) {
    for (const value of accepted) {
      assert.deepEqual(
        validateSkillContent(
          skillContent(
            `name: sample-skill\ndescription: Task.\n${key === "user-invocable" ? "disable-model-invocation: true\n" : ""}${key}: ${value}`
          ),
          "sample-skill"
        ),
        []
      );
    }
    for (const value of rejected) {
      const errors = validateSkillContent(
        skillContent(
          `name: sample-skill\ndescription: Task.\n${key === "user-invocable" ? "disable-model-invocation: true\n" : ""}${key}: ${value}`
        ),
        "sample-skill"
      );
      assert.deepEqual(errors, [`<skill>: ${key} ${diagnostic}`]);
    }
  }
  assert.deepEqual(
    validateSkillContent(
      skillContent("name: sample-skill\ndescription: Task."),
      "sample-skill"
    ),
    ["<skill>: disable-model-invocation must be true."]
  );
});

await test("skill metadata rejects malformed frontmatter and empty bodies", () => {
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
  /** @type {[string, number][]} */
  const invalidYaml = [
    ["name: [", 2],
    ["name: sample-skill\nname: different\ndescription: Task.", 3],
    [
      "name: sample-skill\ndescription: Task.\nmetadata:\n  key: one\n  key: two",
      6
    ]
  ];
  for (const [fields, line] of invalidYaml) {
    const errors = validateSkillContent(
      skillContent(fields),
      "sample-skill",
      "fixture/SKILL.md"
    );
    assert.deepEqual(errors, [
      `fixture/SKILL.md:${line}: frontmatter must contain valid YAML.`
    ]);
  }
  assert.deepEqual(
    validateSkillContent(skillContent(undefined, " \n\t"), "sample-skill"),
    ["<skill>: skill body must contain text."]
  );
});

await test("skill metadata command resolves its own checkout", (t) => {
  const { entrypoint, root } = metadataFixture(t);
  const directory = path.join(root, "skills/sample-skill");
  mkdirSync(path.join(directory, "agents"), { recursive: true });
  writeFileSync(
    path.join(directory, "agents/openai.yaml"),
    "policy:\n  allow_implicit_invocation: false\n"
  );
  const alias = path.join(root, "validate.mjs");
  symlinkSync(entrypoint, alias, "file");
  /** @type {[string | null, string][]} */
  const cases = [
    [null, "skills/sample-skill/SKILL.md: skill file must be readable.\n"],
    [
      skillContent(
        "name: different\ndescription: Task.\ndisable-model-invocation: true"
      ),
      "skills/sample-skill/SKILL.md: name must match its parent directory.\n"
    ],
    [skillContent(), ""]
  ];
  for (const [content, diagnostic] of cases) {
    if (content !== null) {
      writeFileSync(path.join(directory, "SKILL.md"), content);
    }
    assertMetadataCommand(entrypoint, diagnostic);
  }
  assertMetadataCommand(alias);
});

await test("skill metadata command requires a Codex invocation policy", (t) => {
  const { entrypoint, root } = metadataFixture(t);
  const directory = path.join(root, "skills/sample-skill");
  mkdirSync(path.join(directory, "agents"), { recursive: true });
  writeFileSync(path.join(directory, "SKILL.md"), skillContent());
  const policy = path.join(directory, "agents/openai.yaml");
  /** @type {[string | null, string][]} */
  const cases = [
    [null, "policy file must be readable."],
    ["policy: [", "policy file must contain valid YAML."],
    ["policy: {}", "policy.allow_implicit_invocation must be false."],
    [
      "policy:\n  allow_implicit_invocation: true",
      "policy.allow_implicit_invocation must be false."
    ],
    ["policy:\n  allow_implicit_invocation: false", ""]
  ];
  for (const [content, diagnostic] of cases) {
    if (content !== null) {
      writeFileSync(policy, content);
    }
    assertMetadataCommand(
      entrypoint,
      diagnostic && `skills/sample-skill/agents/openai.yaml: ${diagnostic}\n`
    );
  }
});

await test("skill metadata command validates internal links by their alias", (t) => {
  const { entrypoint, root } = metadataFixture(t);
  const directory = path.join(root, "bundled/reference");
  mkdirSync(path.join(directory, "agents"), { recursive: true });
  mkdirSync(path.join(root, "skills/ordinary/agents"), { recursive: true });
  for (const skill of [directory, path.join(root, "skills/ordinary")]) {
    writeFileSync(
      path.join(skill, "agents/openai.yaml"),
      "policy:\n  allow_implicit_invocation: false\n"
    );
  }
  writeFileSync(
    path.join(root, "skills/ordinary/SKILL.md"),
    skillContent(
      "name: ordinary\ndescription: Task.\ndisable-model-invocation: true"
    )
  );
  symlinkSync("../bundled/reference", path.join(root, "skills/sample-skill"));
  writeFileSync(path.join(root, "bundled/notes.md"), "Supporting notes.\n");
  symlinkSync("../bundled/notes.md", path.join(root, "skills/notes.md"));
  /** @type {[string | null, string][]} */
  const cases = [
    [null, "skills/sample-skill/SKILL.md: skill file must be readable.\n"],
    [skillContent(), ""],
    [
      skillContent(
        "name: reference\ndescription: Task.\ndisable-model-invocation: true"
      ),
      "skills/sample-skill/SKILL.md: name must match its parent directory.\n"
    ]
  ];
  for (const [content, diagnostic] of cases) {
    if (content !== null) {
      writeFileSync(path.join(directory, "SKILL.md"), content);
    }
    assertMetadataCommand(entrypoint, diagnostic, 2);
  }
});

await test("skill metadata command rejects paths outside its plugin root", (t) => {
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
    mkdirSync(path.join(outside, "skills/sample-skill/agents"), {
      recursive: true
    });
    writeFileSync(
      path.join(outside, "skills/sample-skill/agents/openai.yaml"),
      "policy:\n  allow_implicit_invocation: false\n"
    );
    const alias = path.join(root, source);
    mkdirSync(path.dirname(alias), { recursive: true });
    symlinkSync(target, alias);
    if (source.endsWith("SKILL.md")) {
      mkdirSync(path.join(root, "skills/sample-skill/agents"), {
        recursive: true
      });
      writeFileSync(
        path.join(root, "skills/sample-skill/agents/openai.yaml"),
        "policy:\n  allow_implicit_invocation: false\n"
      );
    }
    assertMetadataCommand(
      entrypoint,
      `${source}: path must resolve inside the plugin root.\n${source === "skills/sample-skill" ? "skills/sample-skill/agents/openai.yaml: path must resolve inside the plugin root.\n" : ""}`
    );
  }
});

await test("skill metadata command rejects unreadable linked skill files", (t) => {
  const { entrypoint, root } = metadataFixture(t);
  const directory = path.join(root, "skills/sample-skill");
  mkdirSync(path.join(directory, "agents"), { recursive: true });
  writeFileSync(
    path.join(directory, "agents/openai.yaml"),
    "policy:\n  allow_implicit_invocation: false\n"
  );
  symlinkSync("missing.md", path.join(directory, "SKILL.md"));
  const diagnostic =
    "skills/sample-skill/SKILL.md: skill file must be readable.\n";
  assertMetadataCommand(entrypoint, diagnostic);
  rmSync(path.join(directory, "SKILL.md"));
  mkdirSync(path.join(directory, "SKILL.md"));
  assertMetadataCommand(entrypoint, diagnostic);
});
