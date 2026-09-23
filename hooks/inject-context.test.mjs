import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
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
const contexts = new URL("context/", import.meta.url);
const roles = [
  ["SessionStart", "main.md"],
  ["SubagentStart", "worker.md"]
];

/** Run the hook with the current Node and capture its result. */
const runHook = (args, scriptPath = script, cwd = tmpdir()) =>
  spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: "utf-8"
  });

/** Copy the plugin into a disposable directory owned by the test. */
const copyPlugin = (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph context "));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const hooks = path.join(root, "hooks");
  mkdirSync(path.join(hooks, "context"), { recursive: true });
  copyFileSync(script, path.join(hooks, "inject-context.mjs"));
  for (const file of ["common.md", "main.md", "worker.md"]) {
    copyFileSync(new URL(file, contexts), path.join(hooks, "context", file));
  }
  return hooks;
};

for (const [event, role] of roles) {
  test(`${event}: injects common instructions and only the selected role`, () => {
    const result = runHook([event]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    const common = readFileSync(new URL("common.md", contexts), "utf-8").trim();
    const selected = readFileSync(new URL(role, contexts), "utf-8").trim();
    assert.deepEqual(JSON.parse(result.stdout), {
      hookSpecificOutput: {
        additionalContext: `${common}\n\n${selected}`,
        hookEventName: event
      }
    });
  });
}

test("configured hooks load relocated context without filtering sources or agent types", (t) => {
  const hooks = copyPlugin(t);
  const config = JSON.parse(
    readFileSync(new URL("hooks.json", import.meta.url), "utf-8")
  );
  assert.deepEqual(Object.keys(config.hooks).toSorted(), [
    "SessionStart",
    "SubagentStart"
  ]);
  for (const [event, role] of roles) {
    assert.equal(config.hooks[event].length, 1);
    const [entry] = config.hooks[event];
    assert.equal(entry.matcher, undefined);
    assert.equal(entry.hooks.length, 1);
    const [hook] = entry.hooks;
    assert.equal(hook.type, "command");
    assert.equal(hook.async, undefined);
    const selected = `# Relocated ${event}\n\nUse the copied context.`;
    writeFileSync(path.join(hooks, "context", role), selected);
    const result = spawnSync(hook.command, {
      cwd: tmpdir(),
      encoding: "utf-8",
      env: { ...process.env, CLAUDE_PLUGIN_ROOT: path.dirname(hooks) },
      shell: true
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    const output = JSON.parse(result.stdout).hookSpecificOutput;
    assert.equal(output.hookEventName, event);
    assert.ok(output.additionalContext.endsWith(selected));
  }
});

for (const [name, role] of [
  ["main-agent-contract", "main.md"],
  ["subagent-context", "worker.md"]
]) {
  test(`${name}: user-only skill references common instructions and its role`, () => {
    const skill = readFileSync(
      new URL(`../skills/${name}/SKILL.md`, import.meta.url),
      "utf-8"
    );
    const [, frontmatter, body] = skill.split("---\n");
    assert.ok(frontmatter.split("\n").includes(`name: ${name}`));
    assert.match(frontmatter, /^disable-model-invocation: true$/mu);
    assert.match(frontmatter, /^user-invocable: true$/mu);
    const references = [
      ...body.matchAll(/\]\(\$\{CLAUDE_PLUGIN_ROOT\}\/(?<path>[^)]*)\)/gu)
    ].map((match) => match.groups.path);
    assert.deepEqual(references, [
      "hooks/context/common.md",
      `hooks/context/${role}`
    ]);
    for (const reference of references) {
      assert.ok(
        readFileSync(
          new URL(`../${reference}`, import.meta.url),
          "utf-8"
        ).trim()
      );
    }
  });
}

test("invalid arguments produce no context", () => {
  for (const args of [[], ["SessionStart", "extra"], ["unknown"]]) {
    const result = runHook(args);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /inject-context:/u);
  }
});

for (const [file, event] of [
  ["common.md", "SessionStart"],
  ["main.md", "SessionStart"],
  ["worker.md", "SubagentStart"]
]) {
  test(`${file}: missing, empty, or unreadable instructions produce no partial output`, (t) => {
    const hooks = copyPlugin(t);
    const target = path.join(hooks, "context", file);
    const copiedScript = path.join(hooks, "inject-context.mjs");
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
}
