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
const hookTimeoutMilliseconds = 5000;

/**
 * Run the hook with the current Node and capture its result.
 */
const runHook = (args, scriptPath = script, cwd = tmpdir()) =>
  spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: "utf-8",
    killSignal: "SIGKILL",
    timeout: hookTimeoutMilliseconds
  });

/**
 * Replace the test shell so timeout termination reaches the hook process.
 */
const runConfiguredHook = (command, env) =>
  spawnSync(`exec ${command}`, {
    cwd: tmpdir(),
    encoding: "utf-8",
    env: { ...process.env, ...env },
    killSignal: "SIGKILL",
    shell: true,
    timeout: hookTimeoutMilliseconds
  });

/**
 * Copy the plugin into a disposable directory owned by the test.
 */
const copyPlugin = (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph skills "));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  mkdirSync(path.join(root, "hooks"));
  copyFileSync(script, path.join(root, "hooks", "inject-context.mjs"));
  copyFileSync(
    new URL("codex-hooks.json", import.meta.url),
    path.join(root, "hooks", "codex-hooks.json")
  );
  cpSync(
    new URL("../.codex-plugin/", import.meta.url),
    path.join(root, ".codex-plugin"),
    { recursive: true }
  );
  cpSync(skills, path.join(root, "skills"), { recursive: true });
  return root;
};

/**
 * Assert the complete output, including exact source paths and loaded text.
 */
const expectedOutput = (event, host, rootSkills = skills, body = "") => {
  const name =
    event === "SessionStart" ? "main-agent-contract" : "subagent-context";
  const source = realpathSync(path.join(rootSkills, name, "SKILL.md"));
  const content = readFileSync(source, "utf-8");
  const context =
    host === "claude"
      ? `Workgraph source paths are relative to the skill base directory below.\nWorkgraph instructions loaded from ${path.basename(source)}.\nThe active execution host is Claude Code.\nThe complete skill body is already loaded below, without YAML frontmatter.\n\nBase directory for this skill: ${path.dirname(source)}\n\n${(body || content.slice(content.indexOf("\n---\n") + 5)).trimStart()}`
      : `Workgraph instructions loaded from ${source}.\nThe active execution host is Codex.\nThe complete skill file is already loaded below, including YAML frontmatter.\n\n<skill>\n<name>workgraph:${name}</name>\n<path>${source}</path>\n${content}\n</skill>`;
  const reference = realpathSync(
    path.join(rootSkills, name, "references", `${host}.md`)
  );
  return {
    hookSpecificOutput: {
      additionalContext: `${context}\n\nWorkgraph ${host} guidance loaded from ${host === "claude" ? path.relative(path.dirname(source), reference) : reference}.\nThe complete reference content is already loaded below.\n\n${
        host === "claude"
          ? readFileSync(reference, "utf-8")
              .replace(/^\uFEFF/u, "")
              .replaceAll("\r\n", "\n")
              .replace(/\r$/u, "")
              .split("\n")
              .map((line, index) => `${index + 1}\t${line.replace(/\r$/u, "")}`)
              .join("\n")
          : readFileSync(reference, "utf-8")
      }`,
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
    test(`${event} ${host}: injects the exact selected body and role-specific host reference`, () => {
      const result = runHook([event, host]);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.deepEqual(JSON.parse(result.stdout), expectedOutput(event, host));
      if (host === "claude") {
        assert.ok(
          JSON.parse(result.stdout).hookSpecificOutput.additionalContext
            .length <= 10_000,
          "Claude must receive the complete context without host spilling"
        );
      }
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
    assert.doesNotMatch(frontmatter, /^user-invocable: false$/mu);
    assert.ok(body.trim());
  });
}

test("Claude contexts stay inline with long plugin paths and LF or CRLF", (t) => {
  const parent = realpathSync(copyPlugin(t));
  const rootLength = Math.max(311, parent.length + 202);
  const root = path.join(
    parent,
    "a".repeat(100),
    "b".repeat(rootLength - parent.length - 102)
  );
  mkdirSync(path.join(root, "hooks"), { recursive: true });
  assert.equal(realpathSync(root).length, rootLength);
  copyFileSync(script, path.join(root, "hooks", "inject-context.mjs"));
  cpSync(skills, path.join(root, "skills"), { recursive: true });
  for (const newline of ["\n", "\r\n"]) {
    for (const [event, name] of roles) {
      const content = readFileSync(
        path.join(skills, name, "SKILL.md"),
        "utf-8"
      );
      writeFileSync(
        path.join(root, "skills", name, "SKILL.md"),
        content.replaceAll("\n", newline)
      );
      writeFileSync(
        path.join(root, "skills", name, "references", "claude.md"),
        readFileSync(
          path.join(skills, name, "references", "claude.md"),
          "utf-8"
        ).replaceAll("\n", newline)
      );
      const result = runHook(
        [event, "claude"],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      const output = JSON.parse(result.stdout);
      assert.deepEqual(
        output,
        expectedOutput(
          event,
          "claude",
          path.join(root, "skills"),
          content
            .slice(content.indexOf("\n---\n") + 5)
            .replaceAll("\n", newline)
        )
      );
      const contextLength = output.hookSpecificOutput.additionalContext.length;
      t.diagnostic(
        `${event} ${newline === "\n" ? "LF" : "CRLF"}: ${contextLength} characters at canonical root length ${rootLength}`
      );
      assert.ok(
        contextLength <= 9750,
        `Claude ${event} lacks inline context headroom (${contextLength} characters)`
      );
    }
  }
});

test("configured Claude hooks load relocated skills and references with LF or CRLF", (t) => {
  const root = copyPlugin(t);
  const config = JSON.parse(
    readFileSync(new URL("hooks.json", import.meta.url), "utf-8")
  );
  assert.deepEqual(
    new Set(Object.keys(config.hooks)),
    new Set(["SessionStart", "SubagentStart"])
  );
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
      const body =
        `\n# Relocated ${event}\n\nUse the copied skill.\n\n---\n\nKeep body separators.\n`.replaceAll(
          "\n",
          newline
        );
      writeFileSync(
        path.join(root, "skills", name, "SKILL.md"),
        `---\nname: ${name}\ndescription: |\n  Keep --- in metadata.\n  Keep inline dashes ---\n---\n`.replaceAll(
          "\n",
          newline
        ) + body
      );
      for (const host of hosts) {
        writeFileSync(
          path.join(root, "skills", name, "references", `${host}.md`),
          `\n# Only ${host}\n\nUse ${host} guidance.\n`.replaceAll(
            "\n",
            newline
          )
        );
      }
      const result = runConfiguredHook(hook.command, {
        CLAUDE_PLUGIN_ROOT: root
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.deepEqual(
        JSON.parse(result.stdout),
        expectedOutput(event, "claude", path.join(root, "skills"), body)
      );
      const codex = runHook(
        [event, "codex"],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(codex.status, 0, codex.stderr);
      assert.deepEqual(
        JSON.parse(codex.stdout),
        expectedOutput(event, "codex", path.join(root, "skills"), body)
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
    const raw = `\uFEFF---\r\nname: ${name}\r\n---\r\n\r\n \t\r\n  ${body}`;
    writeFileSync(path.join(root, "skills", name, "SKILL.md"), raw);
    for (const host of hosts) {
      writeFileSync(
        path.join(root, "skills", name, "references", `${host}.md`),
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
      const referenceSource = realpathSync(
        path.join(root, "skills", name, "references", `${host}.md`)
      );
      const reference = `\n\nWorkgraph ${host} guidance loaded from ${host === "claude" ? path.relative(path.dirname(source), referenceSource) : referenceSource}.\nThe complete reference content is already loaded below.\n\n${host === "claude" ? "1\t# Guidance\n2\t\n3\tKeep spaces. \t\n4\tTerminal lone CR.\n5\t" : guidance}`;
      assert.deepEqual(JSON.parse(result.stdout), {
        hookSpecificOutput: {
          additionalContext: `${host === "claude" ? "Workgraph source paths are relative to the skill base directory below.\n" : ""}Workgraph instructions loaded from ${host === "claude" ? path.basename(source) : source}.\nThe active execution host is ${host === "claude" ? "Claude Code" : "Codex"}.\n${host === "claude" ? "The complete skill body is already loaded below, without YAML frontmatter." : "The complete skill file is already loaded below, including YAML frontmatter."}\n\n${fragment}${reference}`,
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
    "main-agent-contract/references/claude.md",
    "main-agent-contract/references/codex.md",
    "subagent-context/SKILL.md",
    "subagent-context/references/codex.md",
    "subagent-context/references/claude.md"
  ]) {
    const target = path.join(root, "skills", file);
    const source = file.includes("/references/")
      ? path.join(root, "host sources", `${file}.source`)
      : `${target}.source`;
    mkdirSync(path.dirname(source), { recursive: true });
    copyFileSync(target, source);
    rmSync(target);
    symlinkSync(source, target);
  }
  for (const [event] of roles) {
    for (const host of hosts) {
      const result = runHook(
        [event, host],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(
        JSON.parse(result.stdout),
        expectedOutput(event, host, path.join(root, "skills"))
      );
      if (host === "claude") {
        const context = JSON.parse(result.stdout).hookSpecificOutput
          .additionalContext;
        const base = context.match(
          /^Base directory for this skill: (?<directory>.+)$/mu
        ).groups.directory;
        const loaded = [
          ...context.matchAll(/^Workgraph .* loaded from (?<source>.+)\.$/gmu)
        ].map((match) => path.resolve(base, match.groups.source));
        assert.deepEqual(loaded, [
          realpathSync(
            path.join(
              root,
              "skills",
              event === "SessionStart"
                ? "main-agent-contract"
                : "subagent-context",
              "SKILL.md"
            )
          ),
          realpathSync(
            path.join(
              root,
              "skills",
              event === "SessionStart"
                ? "main-agent-contract"
                : "subagent-context",
              "references",
              "claude.md"
            )
          )
        ]);
      }
    }
  }
});

test("configured Codex hooks load complete relocated skill files without a context limit", (t) => {
  const root = copyPlugin(t);
  const descriptor = JSON.parse(
    readFileSync(path.join(root, ".codex-plugin", "plugin.json"), "utf-8")
  );
  const selectedSkills = path.resolve(root, descriptor.skills);
  const selectedHooks = path.resolve(root, descriptor.hooks);
  assert.equal(
    realpathSync(selectedSkills),
    realpathSync(path.join(root, "skills"))
  );
  assert.equal(
    realpathSync(selectedHooks),
    realpathSync(path.join(root, "hooks", "codex-hooks.json"))
  );
  const config = JSON.parse(readFileSync(selectedHooks, "utf-8"));
  assert.deepEqual(
    new Set(Object.keys(config.hooks)),
    new Set(["SessionStart", "SubagentStart"])
  );
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
    const result = runConfiguredHook(hook.command, {
      PLUGIN_ROOT: root
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.deepEqual(
      JSON.parse(result.stdout),
      expectedOutput(event, "codex", selectedSkills)
    );
  }
});

test("hook test runners terminate children that keep active handles", (t) => {
  const root = copyPlugin(t);
  const scriptPath = path.join(root, "hooks", "inject-context.mjs");
  writeFileSync(
    scriptPath,
    'process.stdout.write("active handle started\\n");\nsetInterval(() => {}, 1000);\n'
  );
  const config = JSON.parse(
    readFileSync(path.join(root, "hooks", "codex-hooks.json"), "utf-8")
  );
  const [entry] = config.hooks.SessionStart;
  const [hook] = entry.hooks;
  const { command } = hook;
  for (const result of [
    runHook(["SessionStart", "codex"], scriptPath),
    runConfiguredHook(command, { PLUGIN_ROOT: root })
  ]) {
    assert.equal(result.error?.code, "ETIMEDOUT");
    assert.equal(result.status, null);
    assert.equal(result.signal, "SIGKILL");
    assert.match(result.stdout, /active handle started/u);
    assert.throws(() => process.kill(result.pid, 0), { code: "ESRCH" });
  }
});

for (const [event, name] of roles) {
  test(`${name}: loads only the selected role and host reference`, (t) => {
    const root = copyPlugin(t);
    const otherRole =
      name === "main-agent-contract"
        ? "subagent-context"
        : "main-agent-contract";
    rmSync(path.join(root, "skills", otherRole, "references"), {
      recursive: true
    });
    for (const host of hosts) {
      const unselected = host === "claude" ? "codex" : "claude";
      const target = path.join(
        root,
        "skills",
        name,
        "references",
        `${unselected}.md`
      );
      const content = readFileSync(target, "utf-8");
      rmSync(target);
      const result = runHook(
        [event, host],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(
        JSON.parse(result.stdout),
        expectedOutput(event, host, path.join(root, "skills"))
      );
      const context = JSON.parse(result.stdout).hookSpecificOutput
        .additionalContext;
      assert.doesNotMatch(
        context,
        new RegExp(
          `${otherRole}/references|${name}/references/${unselected}\\.md`,
          "u"
        )
      );
      writeFileSync(target, content);
    }
  });
}

test("Codex delimiter lines preserve raw files and remove Claude body prefixes", (t) => {
  const root = copyPlugin(t);
  for (const [event, name] of roles) {
    for (const newline of ["\n", "\r\n"]) {
      const body =
        `  Remaining metadata text.\n---\n\n# Role\nKeep body spaces. \t\n`.replaceAll(
          "\n",
          newline
        );
      writeFileSync(
        path.join(root, "skills", name, "SKILL.md"),
        ` \t--- \t\nname: ${name}\ndescription: |\n  First metadata line.\n  --- \t\n`.replaceAll(
          "\n",
          newline
        ) + body
      );
      for (const host of hosts) {
        const result = runHook(
          [event, host],
          path.join(root, "hooks", "inject-context.mjs")
        );
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stderr, "");
        assert.deepEqual(
          JSON.parse(result.stdout),
          expectedOutput(event, host, path.join(root, "skills"), body)
        );
      }
    }
  }
});

test("roles resolve conditional skills from relocated sources without injecting them", (t) => {
  const root = copyPlugin(t);
  for (const [event, name] of roles) {
    const source = path.join(root, "skills", name, "SKILL.md");
    const linked = [
      ...readFileSync(source, "utf-8").matchAll(
        /\]\((?<file>\.\.\/[^)]+\/SKILL\.md)\)/gu
      )
    ].map((match) => path.resolve(path.dirname(source), match.groups.file));
    assert.deepEqual(
      new Set(linked.map((file) => path.basename(path.dirname(file)))),
      new Set(
        event === "SessionStart"
          ? ["delivery", "writing", "instruction-authoring", "development"]
          : ["writing", "instruction-authoring", "development"]
      )
    );
    for (const file of linked) {
      const [, metadata, body] = readFileSync(file, "utf-8").split(/^---$/mu);
      assert.match(
        metadata,
        new RegExp(`^name: ${path.basename(path.dirname(file))}$`, "mu")
      );
      assert.match(metadata, /^description: .+$/mu);
      assert.doesNotMatch(metadata, /^user-invocable: false$/mu);
      assert.ok(body.trim());
      for (const host of hosts) {
        const result = runHook(
          [event, host],
          path.join(root, "hooks", "inject-context.mjs")
        );
        assert.equal(result.status, 0, result.stderr);
        assert.ok(
          !JSON.parse(
            result.stdout
          ).hookSpecificOutput.additionalContext.includes(body)
        );
        assert.deepEqual(
          JSON.parse(result.stdout),
          expectedOutput(event, host, path.join(root, "skills"))
        );
      }
    }
  }
});

test("only relocated Claude Main routes to the bundled Workflow procedure without injecting it", (t) => {
  const root = copyPlugin(t);
  for (const [event, name] of roles) {
    for (const host of hosts) {
      const source = path.join(
        root,
        "skills",
        name,
        "references",
        `${host}.md`
      );
      const routes = [
        ...readFileSync(source, "utf-8").matchAll(
          /^(?<instruction>.*\b(?<name>[a-z-]+) skill\b.*)$/gimu
        )
      ];
      assert.deepEqual(
        routes.map((match) => match.groups.name.toLowerCase()),
        event === "SessionStart" && host === "claude" ? ["workflow"] : []
      );
      for (const routeMatch of routes) {
        assert.match(routeMatch.groups.instruction, /^Before\b/iu);
        assert.match(routeMatch.groups.instruction, /\bunless\b.+\bloaded\b/iu);
        const skillName = routeMatch.groups.name.toLowerCase();
        const route = path.join(root, "skills", skillName, "SKILL.md");
        const workflow = readFileSync(route, "utf-8");
        assert.match(workflow, new RegExp(`^name: ${skillName}$`, "mu"));
        const references = [
          ...workflow.matchAll(/`(?<file>references\/[^`]+\.md)`/gu)
        ].map((match) => path.resolve(path.dirname(route), match.groups.file));
        assert.ok(
          references.includes(
            path.join(root, "skills", "workflow", "references", "authoring.md")
          )
        );
        for (const reference of references) {
          assert.ok(readFileSync(reference, "utf-8").trim());
        }
        const result = runHook(
          [event, host],
          path.join(root, "hooks", "inject-context.mjs")
        );
        assert.equal(result.status, 0, result.stderr);
        const context = JSON.parse(result.stdout).hookSpecificOutput
          .additionalContext;
        assert.ok(context.includes(routeMatch.groups.instruction));
        assert.ok(!context.includes(workflow));
        for (const reference of references) {
          assert.ok(!context.includes(readFileSync(reference, "utf-8")));
        }
        rmSync(path.dirname(route), { recursive: true });
        assert.equal(
          runHook([event, host], path.join(root, "hooks", "inject-context.mjs"))
            .status,
          0
        );
      }
    }
  }
});

test("worker hooks load only their role and selected host reference", (t) => {
  const root = copyPlugin(t);
  rmSync(path.join(root, "skills", "main-agent-contract"), {
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
      "---\n---\n# Empty frontmatter\n",
      "---\n \t\n---\n# Whitespace frontmatter\n",
      `---\nname: ${name}\n`,
      `---\nname: ${name}\n--- trailing text\n# Role\n`,
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

for (const [event, name] of roles) {
  for (const host of hosts) {
    test(`${name} ${host}: missing, empty, or unreadable host reference produces no partial output`, (t) => {
      const root = copyPlugin(t);
      const file = `${name}/references/${host}.md`;
      const target = path.join(root, "skills", file);
      const copiedScript = path.join(root, "hooks", "inject-context.mjs");
      rmSync(target);
      assertFileFailure(runHook([event, host], copiedScript), file);
      writeFileSync(target, " \n\t\n");
      assertFileFailure(runHook([event, host], copiedScript), file);
      rmSync(target);
      mkdirSync(target);
      assertFileFailure(runHook([event, host], copiedScript), file);
    });
  }
}
