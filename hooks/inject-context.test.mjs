import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("inject-context.mjs", import.meta.url));
const skills = new URL("../skills/", import.meta.url);
const roles = [
  [
    "SessionStart",
    "main-agent-contract",
    "Use when orchestrating as the Workgraph Main Agent, not as a dispatched node."
  ],
  [
    "SubagentStart",
    "subagent-context",
    "Use when executing a bounded task as a Workgraph dispatch node."
  ]
];

/** Run the hook with the current Node and capture its result. */
const runHook = (args, scriptPath = script, cwd = tmpdir()) =>
  spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: "utf-8"
  });

/** Copy the plugin into a disposable directory owned by the test. */
const copyPlugin = (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph skills "));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  mkdirSync(path.join(root, "hooks"));
  copyFileSync(script, path.join(root, "hooks", "inject-context.mjs"));
  cpSync(skills, path.join(root, "skills"), { recursive: true });
  return root;
};

for (const [event, name, description] of roles) {
  test(`${event}: injects only the selected self-contained skill body`, () => {
    const result = runHook([event]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), {
      hookSpecificOutput: {
        additionalContext: readFileSync(
          new URL(`${name}/SKILL.md`, skills),
          "utf-8"
        )
          .split(/^---$/mu)
          .slice(2)
          .join("---")
          .trim(),
        hookEventName: event
      }
    });
  });

  test(`${name}: user-only skill contains a self-contained role`, () => {
    const [prefix, frontmatter, body] = readFileSync(
      new URL(`${name}/SKILL.md`, skills),
      "utf-8"
    ).split(/^---$/mu);
    assert.equal(prefix, "");
    assert.deepEqual(frontmatter.trim().split("\n"), [
      `name: ${name}`,
      `description: ${description}`,
      "disable-model-invocation: true",
      "user-invocable: true"
    ]);
    assert.ok(body.trim());
    assert.match(body, /^# Workgraph (?:Main Agent|Worker)$/mu);
    assert.match(body, /Invoking this skill does not/u);
  });
}

test("configured hooks load relocated role skills without filtering agent types", (t) => {
  const root = copyPlugin(t);
  const config = JSON.parse(
    readFileSync(new URL("hooks.json", import.meta.url), "utf-8")
  );
  assert.deepEqual(Object.keys(config.hooks).toSorted(), [
    "SessionStart",
    "SubagentStart"
  ]);
  for (const [event, name] of roles) {
    assert.equal(config.hooks[event].length, 1);
    const [entry] = config.hooks[event];
    assert.equal(entry.matcher, undefined);
    assert.equal(entry.hooks.length, 1);
    const [hook] = entry.hooks;
    assert.equal(hook.type, "command");
    assert.equal(hook.async, undefined);
    const selected = `# Relocated ${event}\n\nUse the copied skill.\n\n---\n\nKeep body separators.`;
    for (const newline of ["\n", "\r\n"]) {
      writeFileSync(
        path.join(root, "skills", name, "SKILL.md"),
        `---\nname: ${name}\ndescription: |\n  Keep --- in metadata.\n---\n\n${selected}\n`.replaceAll(
          "\n",
          newline
        )
      );
      const result = spawnSync(hook.command, {
        cwd: tmpdir(),
        encoding: "utf-8",
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: root },
        shell: true
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.deepEqual(JSON.parse(result.stdout), {
        hookSpecificOutput: {
          additionalContext: selected.replaceAll("\n", newline),
          hookEventName: event
        }
      });
    }
  }
});

test("invalid arguments produce no context", () => {
  for (const args of [[], ["SessionStart", "extra"], ["unknown"]]) {
    const result = runHook(args);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /inject-context:/u);
  }
});

for (const [event, name] of roles) {
  const file = `${name}/SKILL.md`;
  test(`${event} ${file}: missing, empty, or unreadable instructions produce no partial output`, (t) => {
    const root = copyPlugin(t);
    const target = path.join(root, "skills", file);
    const copiedScript = path.join(root, "hooks", "inject-context.mjs");
    rmSync(target);
    const missing = runHook([event], copiedScript);
    assert.equal(missing.status, 1);
    assert.equal(missing.stdout, "");
    assert.ok(missing.stderr.includes(file));
    writeFileSync(target, " \n\t\n");
    const empty = runHook([event], copiedScript);
    assert.equal(empty.status, 1);
    assert.equal(empty.stdout, "");
    assert.ok(empty.stderr.includes(file));
    rmSync(target);
    mkdirSync(target);
    const unreadable = runHook([event], copiedScript);
    assert.equal(unreadable.status, 1);
    assert.equal(unreadable.stdout, "");
    assert.ok(unreadable.stderr.includes(file));
  });

  test(`${name}: missing frontmatter, unclosed frontmatter, or empty prose produces no partial output`, (t) => {
    const root = copyPlugin(t);
    const target = path.join(root, "skills", name, "SKILL.md");
    for (const source of [
      "# No frontmatter\n\nRole instructions.",
      `---\nname: ${name}\n`,
      `---\nname: ${name}\n---`,
      `---\nname: ${name}\n---\n \t\n`
    ]) {
      writeFileSync(target, source);
      const result = runHook(
        [event],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(result.status, 1, source);
      assert.equal(result.stdout, "", source);
      assert.ok(result.stderr.includes(`${name}/SKILL.md`), result.stderr);
    }
  });
}
