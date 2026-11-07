import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
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
const hostReferenceFiles = { claude: "claude-code.md", codex: "codex.md" };
const roleFiles = roles.flatMap(([, name]) => [
  `${name}/SKILL.md`,
  ...hosts.map((host) => `${name}/references/${hostReferenceFiles[host]}`)
]);
const runHook = (args, scriptPath = script) =>
  spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: tmpdir(),
    encoding: "utf-8",
    timeout: 5000
  });

const runConfiguredHook = (command, env) =>
  spawnSync(command, {
    cwd: tmpdir(),
    encoding: "utf-8",
    env: { ...process.env, PATH: path.dirname(process.execPath), ...env },
    shell: true,
    timeout: 5000
  });

const copyPlugin = (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph skills "));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  mkdirSync(path.join(root, "hooks"));
  copyFileSync(script, path.join(root, "hooks", "inject-context.mjs"));
  for (const filename of [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "hooks/claude-hooks.json",
    "hooks/codex-hooks.json",
    ...roleFiles.map((file) => `skills/${file}`)
  ]) {
    const destination = path.join(root, filename);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(new URL(`../${filename}`, import.meta.url), destination);
  }
  return root;
};

const assertOutput = (output, event, host, rootSkills = skills, body = "") => {
  const name =
    event === "SessionStart" ? "main-agent-contract" : "subagent-context";
  const source = realpathSync(path.join(rootSkills, name, "SKILL.md"));
  const reference = realpathSync(
    path.join(rootSkills, name, "references", hostReferenceFiles[host])
  );
  const content = readFileSync(source, "utf-8");
  const guidance = readFileSync(reference, "utf-8");
  const { additionalContext: context, hookEventName } =
    output.hookSpecificOutput;
  assert.equal(hookEventName, event);
  const [roleContext, referenceContext, extra] = context.split(
    `\n\nWorkgraph ${host} guidance loaded from `
  );
  assert.equal(extra, undefined);
  const [skillFragment, skillNotice, extraNotice] = roleContext.split(
    "\n\nWorkgraph instructions loaded from "
  );
  assert.equal(extraNotice, undefined);
  assert.equal(
    skillNotice,
    `${host === "claude" ? path.basename(source) : source}.\nThe active execution host is ${host === "claude" ? "Claude Code" : "Codex"}.\n${host === "claude" ? "The complete skill body is already loaded above, without YAML frontmatter." : "The complete skill file is already loaded above, including YAML frontmatter."}`
  );
  const [location, referenceBody] = referenceContext.split(
    ".\nThe complete reference content is already loaded below.\n\n"
  );
  if (host === "claude") {
    const { directory, deliveredBody } = skillFragment.match(
      /^Base directory for this skill: (?<directory>[^\n]+)\n\n(?<deliveredBody>[\s\S]*)$/u
    ).groups;
    assert.equal(directory, path.dirname(source));
    assert.equal(path.resolve(directory, location), reference);
    assert.equal(
      deliveredBody,
      (body || content.split("\n---\n").slice(1).join("\n---\n")).trimStart()
    );
    const lines = referenceBody.split("\n");
    assert.deepEqual(
      lines.map((line) => line.slice(0, line.indexOf("\t"))),
      lines.map((_, index) => String(index + 1))
    );
    assert.equal(
      lines.map((line) => line.slice(line.indexOf("\t") + 1)).join("\n"),
      guidance.replaceAll("\r", "")
    );
  } else {
    assert.equal(location, reference);
    assert.equal(referenceBody, guidance);
    assert.equal(
      skillFragment,
      `<skill>\n<name>workgraph:${name}</name>\n<path>${source}</path>\n${content}\n</skill>`
    );
  }
};

const assertFileFailure = (result, file, detail) => {
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    `inject-context: cannot load instruction file ${file}: ${detail}\n`
  );
};

const missingFileDetail = (target) =>
  `ENOENT: no such file or directory, lstat '${path.join(realpathSync(path.dirname(target)), path.basename(target))}'`;
const emptyFileDetail =
  "empty instructions or missing required skill frontmatter";
const directoryDetail = "EISDIR: illegal operation on a directory, read";

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
  cpSync(path.join(parent, "skills"), path.join(root, "skills"), {
    recursive: true
  });
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
        path.join(root, "skills", name, "references", "claude-code.md"),
        readFileSync(
          path.join(skills, name, "references", "claude-code.md"),
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
      assertOutput(
        output,
        event,
        "claude",
        path.join(root, "skills"),
        content.slice(content.indexOf("\n---\n") + 5).replaceAll("\n", newline)
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
  const descriptor = JSON.parse(
    readFileSync(path.join(root, ".claude-plugin/plugin.json"), "utf-8")
  );
  const config = JSON.parse(
    readFileSync(path.resolve(root, descriptor.hooks), "utf-8")
  );
  assert.deepEqual(
    new Set(Object.keys(config.hooks)),
    new Set(["SessionStart", "SubagentStart", "PreToolUse"])
  );
  for (const [event, name] of roles) {
    assert.equal(config.hooks[event].length, 1);
    const [entry] = config.hooks[event];
    assert.equal(entry.matcher, undefined);
    assert.equal(entry.hooks.length, 1);
    const [hook] = entry.hooks;
    assert.equal(hook.type, "command");
    assert.equal(hook.async, undefined);
    assert.equal(
      hook.command,
      `node "\${CLAUDE_PLUGIN_ROOT}/hooks/inject-context.mjs" ${event} claude`
    );
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
          path.join(
            root,
            "skills",
            name,
            "references",
            hostReferenceFiles[host]
          ),
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
      assertOutput(
        JSON.parse(result.stdout),
        event,
        "claude",
        path.join(root, "skills"),
        body
      );
      const codex = runHook(
        [event, "codex"],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(codex.status, 0, codex.stderr);
      assertOutput(
        JSON.parse(codex.stdout),
        event,
        "codex",
        path.join(root, "skills"),
        body
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
        path.join(root, "skills", name, "references", hostReferenceFiles[host]),
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
        path.join(root, "skills", name, "references", hostReferenceFiles[host])
      );
      const reference = `\n\nWorkgraph ${host} guidance loaded from ${host === "claude" ? path.relative(path.dirname(source), referenceSource) : referenceSource}.\nThe complete reference content is already loaded below.\n\n${host === "claude" ? "1\t# Guidance\n2\t\n3\tKeep spaces. \t\n4\tTerminal lone CR.\n5\t" : guidance}`;
      assert.deepEqual(JSON.parse(result.stdout), {
        hookSpecificOutput: {
          additionalContext: `${fragment}\n\nWorkgraph instructions loaded from ${host === "claude" ? path.basename(source) : source}.\nThe active execution host is ${host === "claude" ? "Claude Code" : "Codex"}.\n${host === "claude" ? "The complete skill body is already loaded above, without YAML frontmatter." : "The complete skill file is already loaded above, including YAML frontmatter."}${reference}`,
          hookEventName: event
        }
      });
    }
  }
});

test("source metadata resolves symlinked instructions to their real paths", (t) => {
  const root = copyPlugin(t);
  for (const file of roleFiles) {
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
      assert.equal(result.stderr, "");
      assertOutput(
        JSON.parse(result.stdout),
        event,
        host,
        path.join(root, "skills")
      );
    }
  }
});

test("configured Codex hooks load complete relocated skill files without a context limit", (t) => {
  const root = copyPlugin(t);
  const descriptor = JSON.parse(
    readFileSync(path.join(root, ".codex-plugin/plugin.json"), "utf-8")
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
    new Set(["SessionStart", "SubagentStart", "PreToolUse"])
  );
  for (const [event] of roles) {
    assert.equal(config.hooks[event].length, 1);
    const [entry] = config.hooks[event];
    assert.equal(entry.matcher, undefined);
    assert.equal(entry.hooks.length, 1);
    const [hook] = entry.hooks;
    assert.equal(hook.type, "command");
    assert.equal(hook.async, undefined);
    assert.equal(hook.timeout, 30);
    assert.equal(hook.additionalContextLimit, 0);
    assert.equal(
      hook.command,
      `node "\${PLUGIN_ROOT}/hooks/inject-context.mjs" ${event} codex`
    );
    const result = runConfiguredHook(hook.command, {
      PLUGIN_ROOT: root
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assertOutput(JSON.parse(result.stdout), event, "codex", selectedSkills);
  }
});

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
        assertOutput(
          JSON.parse(result.stdout),
          event,
          host,
          path.join(root, "skills"),
          body
        );
      }
    }
  }
});

test("each role and host loads without other skills or the unselected host reference", (t) => {
  for (const [event, name] of roles) {
    for (const host of hosts) {
      const root = copyPlugin(t);
      for (const other of readdirSync(path.join(root, "skills"))) {
        if (other !== name) {
          rmSync(path.join(root, "skills", other), { recursive: true });
        }
      }
      rmSync(
        path.join(
          root,
          "skills",
          name,
          "references",
          hostReferenceFiles[host === "claude" ? "codex" : "claude"]
        )
      );
      const result = runHook(
        [event, host],
        path.join(root, "hooks", "inject-context.mjs")
      );
      assert.equal(result.status, 0, result.stderr);
      assertOutput(
        JSON.parse(result.stdout),
        event,
        host,
        path.join(root, "skills")
      );
    }
  }
});

test("invalid or legacy arguments produce no context", () => {
  for (const [args, message] of [
    [[], "expected exactly one hook event and one host"],
    [["SessionStart"], "expected exactly one hook event and one host"],
    [["unknown", "claude"], "unsupported hook event: unknown"],
    [["SessionStart", "unknown"], "unsupported host: unknown"],
    [["SessionStart", "Claude"], "unsupported host: Claude"],
    [["claude", "SessionStart"], "unsupported hook event: claude"],
    [
      ["SessionStart", "claude", "extra"],
      "expected exactly one hook event and one host"
    ]
  ]) {
    const result = runHook(args);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, `inject-context: ${message}\n`);
  }
});

for (const [event, name] of roles) {
  const file = `${name}/SKILL.md`;
  test(`${event} ${file}: missing, empty, or unreadable instructions produce no partial output`, (t) => {
    const root = copyPlugin(t);
    const target = path.join(root, "skills", file);
    const copiedScript = path.join(root, "hooks", "inject-context.mjs");
    rmSync(target);
    assertFileFailure(
      runHook([event, "claude"], copiedScript),
      file,
      missingFileDetail(target)
    );
    writeFileSync(target, " \n\t\n");
    assertFileFailure(
      runHook([event, "claude"], copiedScript),
      file,
      emptyFileDetail
    );
    rmSync(target);
    mkdirSync(target);
    assertFileFailure(
      runHook([event, "claude"], copiedScript),
      file,
      directoryDetail
    );
  });
}

test("invalid frontmatter or empty prose produces no partial output on either host", (t) => {
  const root = copyPlugin(t);
  const file = "main-agent-contract/SKILL.md";
  for (const source of [
    "# No frontmatter\n\nRole instructions.",
    "---\n---\n# Empty frontmatter\n",
    "---\n \t\n---\n# Whitespace frontmatter\n",
    "---\nname: main-agent-contract\n",
    "---\nname: main-agent-contract\n--- trailing text\n# Role\n",
    "---\nname: main-agent-contract\n---",
    "---\nname: main-agent-contract\n---\n \t\n"
  ]) {
    writeFileSync(path.join(root, "skills", file), source);
    for (const host of hosts) {
      assertFileFailure(
        runHook(
          ["SessionStart", host],
          path.join(root, "hooks", "inject-context.mjs")
        ),
        file,
        emptyFileDetail
      );
    }
  }
});

for (const [event, name] of roles) {
  for (const host of hosts) {
    test(`${name} ${host}: missing, empty, or unreadable host reference produces no partial output`, (t) => {
      const root = copyPlugin(t);
      const file = `${name}/references/${hostReferenceFiles[host]}`;
      const target = path.join(root, "skills", file);
      const copiedScript = path.join(root, "hooks", "inject-context.mjs");
      rmSync(target);
      assertFileFailure(
        runHook([event, host], copiedScript),
        file,
        missingFileDetail(target)
      );
      writeFileSync(target, " \n\t\n");
      assertFileFailure(
        runHook([event, host], copiedScript),
        file,
        emptyFileDetail
      );
      rmSync(target);
      mkdirSync(target);
      assertFileFailure(
        runHook([event, host], copiedScript),
        file,
        directoryDetail
      );
    });
  }
}
