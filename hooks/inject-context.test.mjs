import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("inject-context.mjs", import.meta.url));
const skills = fileURLToPath(new URL("../skills/", import.meta.url));
const roles = [
  ["SessionStart", "main-agent-contract"],
  ["SubagentStart", "subagent-context"]
];
const hosts = ["claude", "codex"];

/**
 * Run the hook with the current Node and capture its result.
 */
const runHook = (args, scriptPath = script, cwd = tmpdir()) =>
  spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: "utf-8"
  });

/**
 * Copy the plugin into a disposable directory owned by the test.
 */
const copyPlugin = (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph skills "));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  mkdirSync(path.join(root, "hooks"));
  copyFileSync(script, path.join(root, "hooks", "inject-context.mjs"));
  cpSync(skills, path.join(root, "skills"), { recursive: true });
  return root;
};

/**
 * Assert the complete output, including exact source paths and loaded text.
 */
const expectedOutput = (event, host, rootSkills = skills) => {
  const name =
    event === "SessionStart" ? "main-agent-contract" : "subagent-context";
  const source = realpathSync(path.join(rootSkills, name, "SKILL.md"));
  const content = readFileSync(source, "utf-8");
  const context =
    host === "claude"
      ? `Workgraph instructions loaded from ${source}.\nThe active execution host is Claude Code.\nThe complete skill body is already loaded below, without YAML frontmatter.\n\nBase directory for this skill: ${path.dirname(source)}\n\n${content.replace(/^\uFEFF/u, "").replace(/^---\s*\n(?<frontmatter>[\s\S]*?)---\s*\n?/u, "")}`
      : `Workgraph instructions loaded from ${source}.\nThe active execution host is Codex.\nThe complete skill file is already loaded below, including YAML frontmatter.\n\n<skill>\n<name>workgraph:${name}</name>\n<path>${source}</path>\n${content}\n</skill>`;
  const reference =
    event === "SessionStart"
      ? realpathSync(path.join(rootSkills, name, "references", `${host}.md`))
      : undefined;
  return {
    hookSpecificOutput: {
      additionalContext: reference
        ? `${context}\n\nWorkgraph ${host} guidance loaded from ${reference}.\nThe complete reference content is already loaded below.\n\n${
            host === "claude"
              ? readFileSync(reference, "utf-8")
                  .replace(/^\uFEFF/u, "")
                  .replaceAll("\r\n", "\n")
                  .replace(/\r$/u, "")
                  .split("\n")
                  .map(
                    (line, index) => `${index + 1}\t${line.replace(/\r$/u, "")}`
                  )
                  .join("\n")
              : readFileSync(reference, "utf-8")
          }`
        : context,
      hookEventName: event
    }
  };
};

/**
 * Assert that a required file failure emits no partial context.
 */
const assertFileFailure = (result, file) => {
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.stdout, "");
  assert.ok(result.stderr.includes(file), result.stderr);
};

for (const [event, name] of roles) {
  for (const host of hosts) {
    test(`${event} ${host}: injects the exact selected body and host reference`, () => {
      const result = runHook([event, host]);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.deepEqual(JSON.parse(result.stdout), expectedOutput(event, host));
      assert.match(
        result.stdout,
        new RegExp(
          `The active execution host is ${host === "claude" ? "Claude Code" : "Codex"}\\.`,
          "u"
        )
      );
      assert.doesNotMatch(
        result.stdout,
        new RegExp(
          `The active execution host is ${host === "claude" ? "Codex" : "Claude Code"}\\.`,
          "u"
        )
      );
    });
  }

  test(`${name}: skill contains a complete role body`, () => {
    const [prefix, frontmatter, body] = readFileSync(
      path.join(skills, name, "SKILL.md"),
      "utf-8"
    ).split(/^---$/mu);
    assert.equal(prefix, "");
    assert.match(frontmatter, new RegExp(`^name: ${name}$`, "mu"));
    assert.match(frontmatter, /^user-invocable: true$/mu);
    assert.ok(body.trim());
    assert.equal(
      body.match(/^# (?<heading>.+)$/mu)?.groups?.heading,
      event === "SessionStart" ? "Main Agent Contract" : "Subagent Context"
    );
    assert.match(body, /Invoking this skill does not/u);
  });
}

test("configured Claude hooks load relocated skills and references with LF or CRLF", (t) => {
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
    assert.ok(hook.command.endsWith(`${event} claude`));
    for (const newline of ["\n", "\r\n"]) {
      writeFileSync(
        path.join(root, "skills", name, "SKILL.md"),
        `---\nname: ${name}\ndescription: |\n  Keep --- in metadata.\n---\n\n# Relocated ${event}\n\nUse the copied skill.\n\n---\n\nKeep body separators.\n`.replaceAll(
          "\n",
          newline
        )
      );
      for (const host of hosts) {
        writeFileSync(
          path.join(
            root,
            "skills",
            "main-agent-contract",
            "references",
            `${host}.md`
          ),
          `\n# Only ${host}\n\nUse ${host} guidance.\n`.replaceAll(
            "\n",
            newline
          )
        );
      }
      const result = spawnSync(hook.command, {
        cwd: tmpdir(),
        encoding: "utf-8",
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: root },
        shell: true
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.deepEqual(
        JSON.parse(result.stdout),
        expectedOutput(event, "claude", path.join(root, "skills"))
      );
      const codex = runHook(
        [event, "codex"],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(codex.status, 0, codex.stderr);
      assert.deepEqual(
        JSON.parse(codex.stdout),
        expectedOutput(event, "codex", path.join(root, "skills"))
      );
    }
  }
});

test("native Skill and Read fragments preserve host-specific BOM, CRLF, and terminal whitespace", (t) => {
  const root = copyPlugin(t);
  const body = "# Exact role\r\nKeep terminal spaces. \t\r\n\r\n";
  const guidance =
    "\uFEFF# Guidance\r\n\r\nKeep spaces. \t\r\nTerminal lone CR.\r\n\r";
  for (const [event, name] of roles) {
    const raw = `\uFEFF---\r\nname: ${name}\r\n---\r\n${body}`;
    writeFileSync(path.join(root, "skills", name, "SKILL.md"), raw);
    for (const host of hosts) {
      writeFileSync(
        path.join(
          root,
          "skills",
          "main-agent-contract",
          "references",
          `${host}.md`
        ),
        guidance
      );
      const source = realpathSync(path.join(root, "skills", name, "SKILL.md"));
      const result = runHook(
        [event, host],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(result.status, 0, result.stderr);
      const fragment =
        host === "claude"
          ? `Base directory for this skill: ${path.dirname(source)}\n\n${body}`
          : `<skill>\n<name>workgraph:${name}</name>\n<path>${source}</path>\n${raw}\n</skill>`;
      const reference =
        event === "SessionStart"
          ? `\n\nWorkgraph ${host} guidance loaded from ${realpathSync(path.join(root, "skills", name, "references", `${host}.md`))}.\nThe complete reference content is already loaded below.\n\n${host === "claude" ? "1\t# Guidance\n2\t\n3\tKeep spaces. \t\n4\tTerminal lone CR.\n5\t" : guidance}`
          : "";
      assert.deepEqual(JSON.parse(result.stdout), {
        hookSpecificOutput: {
          additionalContext: `Workgraph instructions loaded from ${source}.\nThe active execution host is ${host === "claude" ? "Claude Code" : "Codex"}.\n${host === "claude" ? "The complete skill body is already loaded below, without YAML frontmatter." : "The complete skill file is already loaded below, including YAML frontmatter."}\n\n${fragment}${reference}`,
          hookEventName: event
        }
      });
    }
  }
});

test("source metadata resolves symlinked instructions to their real paths", (t) => {
  const root = copyPlugin(t);
  for (const file of [
    "main-agent-contract/SKILL.md",
    "main-agent-contract/references/claude.md"
  ]) {
    const target = path.join(root, "skills", file);
    const source = `${target}.source`;
    copyFileSync(target, source);
    rmSync(target);
    symlinkSync(source, target);
  }
  const result = runHook(
    ["SessionStart", "claude"],
    path.join(root, "hooks", "inject-context.mjs")
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    JSON.parse(result.stdout),
    expectedOutput("SessionStart", "claude", path.join(root, "skills"))
  );
});

test("configured Codex hooks load complete relocated skill files without a context limit", (t) => {
  const root = copyPlugin(t);
  const config = JSON.parse(
    readFileSync(new URL("codex-hooks.json", import.meta.url), "utf-8")
  );
  assert.deepEqual(Object.keys(config.hooks).toSorted(), [
    "SessionStart",
    "SubagentStart"
  ]);
  for (const [event] of roles) {
    assert.equal(config.hooks[event].length, 1);
    const [entry] = config.hooks[event];
    assert.equal(entry.matcher, undefined);
    assert.equal(entry.hooks.length, 1);
    const [hook] = entry.hooks;
    assert.equal(hook.type, "command");
    assert.equal(hook.async, undefined);
    assert.equal(hook.timeout, 5);
    assert.equal(hook.additionalContextLimit, 0);
    assert.ok(hook.command.endsWith(`${event} codex`));
    const result = spawnSync(hook.command, {
      cwd: tmpdir(),
      encoding: "utf-8",
      env: { ...process.env, PLUGIN_ROOT: root },
      shell: true
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.deepEqual(
      JSON.parse(result.stdout),
      expectedOutput(event, "codex", path.join(root, "skills"))
    );
  }
});

test("main loads only the selected host reference", (t) => {
  const root = copyPlugin(t);
  for (const host of hosts) {
    const unselected = host === "claude" ? "codex" : "claude";
    const target = path.join(
      root,
      "skills",
      "main-agent-contract",
      "references",
      `${unselected}.md`
    );
    const content = readFileSync(target, "utf-8");
    rmSync(target);
    const result = runHook(
      ["SessionStart", host],
      path.join(root, "hooks", "inject-context.mjs")
    );
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      JSON.parse(result.stdout),
      expectedOutput("SessionStart", host, path.join(root, "skills"))
    );
    const context = JSON.parse(result.stdout).hookSpecificOutput
      .additionalContext;
    if (host === "codex") {
      assert.match(
        context,
        /native delegation tools for independent and dependent assignments/u
      );
      assert.doesNotMatch(context, /Use native Workflow|Use host Agent/u);
    } else {
      assert.match(context, /Use native Workflow/u);
      assert.match(context, /Use host Agent/u);
    }
    writeFileSync(target, content);
  }
});

test("common Main excludes Claude routing and Workflow discovery is Claude-scoped", () => {
  assert.doesNotMatch(
    readFileSync(path.join(skills, "main-agent-contract", "SKILL.md"), "utf-8"),
    /Workflow|host Agent/u
  );
  const [, metadata, body] = readFileSync(
    path.join(skills, "workflow", "SKILL.md"),
    "utf-8"
  ).split(/^---$/mu);
  assert.match(metadata, /Use in the Claude Code main session/u);
  assert.match(body, /In Codex, report that native Workflow did not run/u);
});

test("worker hooks append no host reference", (t) => {
  const root = copyPlugin(t);
  rmSync(path.join(root, "skills", "main-agent-contract", "references"), {
    recursive: true
  });
  for (const host of hosts) {
    const result = runHook(
      ["SubagentStart", host],
      path.join(root, "hooks", "inject-context.mjs")
    );
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      JSON.parse(result.stdout),
      expectedOutput("SubagentStart", host, path.join(root, "skills"))
    );
    assert.doesNotMatch(result.stdout, /guidance loaded from/u);
  }
});

test("invalid or legacy arguments produce no context", () => {
  for (const args of [
    [],
    ["SessionStart"],
    ["unknown", "claude"],
    ["SessionStart", "unknown"],
    ["SessionStart", "Claude"],
    ["claude", "SessionStart"],
    ["SessionStart", "claude", "extra"]
  ]) {
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
    assertFileFailure(runHook([event, "claude"], copiedScript), file);
    writeFileSync(target, " \n\t\n");
    assertFileFailure(runHook([event, "claude"], copiedScript), file);
    rmSync(target);
    mkdirSync(target);
    assertFileFailure(runHook([event, "claude"], copiedScript), file);
  });

  test(`${name}: invalid frontmatter or empty prose produces no partial output`, (t) => {
    const root = copyPlugin(t);
    for (const source of [
      "# No frontmatter\n\nRole instructions.",
      `---\nname: ${name}\n`,
      `---\nname: ${name}\n---`,
      `---\nname: ${name}\n---\n \t\n`
    ]) {
      writeFileSync(path.join(root, "skills", file), source);
      for (const host of hosts) {
        assertFileFailure(
          runHook(
            [event, host],
            path.join(root, "hooks", "inject-context.mjs")
          ),
          file
        );
      }
    }
  });
}

for (const host of hosts) {
  test(`${host}: missing, empty, or unreadable host reference produces no partial output`, (t) => {
    const root = copyPlugin(t);
    const file = `main-agent-contract/references/${host}.md`;
    const target = path.join(root, "skills", file);
    const copiedScript = path.join(root, "hooks", "inject-context.mjs");
    rmSync(target);
    assertFileFailure(runHook(["SessionStart", host], copiedScript), file);
    writeFileSync(target, " \n\t\n");
    assertFileFailure(runHook(["SessionStart", host], copiedScript), file);
    rmSync(target);
    mkdirSync(target);
    assertFileFailure(runHook(["SessionStart", host], copiedScript), file);
  });
}
