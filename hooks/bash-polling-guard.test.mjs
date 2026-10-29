import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(
  new URL("bash-polling-guard.mjs", import.meta.url)
);

const makeInput = (command, extra = {}) => ({
  hook_event_name: "PreToolUse",
  session_id: "session",
  tool_input: { command },
  tool_name: "Bash",
  ...extra
});

const setup = (t, host = "claude") => {
  const root = mkdtempSync(path.join(tmpdir(), "workgraph polling "));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const env = { ...process.env, TEMP: root, TMP: root, TMPDIR: root };
  const run = (command, extra = {}) =>
    spawnSync(process.execPath, [script, host], {
      encoding: "utf-8",
      env,
      input: JSON.stringify(makeInput(command, extra)),
      timeout: 5000
    });
  return { env, root, run };
};

const assertAllowed = (result) => {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
};

const assertDenied = (result) => {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.deepEqual(JSON.parse(result.stdout), {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        "Workgraph blocked a third consecutive tail or sleep command. If a completion callback is available, end the turn and await it. Otherwise, use the host-native wait for the existing command instead of polling."
    }
  });
};

for (const host of ["claude", "codex"]) {
  test(`${host} blocks the third mixed polling call until a nonmatch resets it`, (t) => {
    const { run } = setup(t, host);
    assertAllowed(run("tail -n 10 build.log"));
    assertAllowed(run("sleep 1"));
    assertDenied(run("tail -F build.log"));
    assertDenied(run("sleep 2"));
    assertAllowed(run("printf done"));
    assertAllowed(run("tail -f build.log"));
    assertAllowed(run("sleep .2"));
    assertDenied(run("sleep 1"));
    assertAllowed(run("sleep 1", { tool_name: "Read" }));
    assertDenied(run("sleep 1"));
    assertAllowed(run("printf done"));
    assertAllowed(run("sleep 1"));
    assertAllowed(run("sleep 1"));
    assertDenied(run("sleep 1"));
  });

  test(`${host} matches only supported literal command positions`, (t) => {
    const { run } = setup(t, host);
    const positives = [
      "tail",
      "sleep",
      "\t tail -n20 /tmp/build.log ",
      "sleep 0.5\n",
      "tail -f 'build output.log'",
      'tail -F "build output.log"',
      "tail --follow=name --retry build.log",
      "tail build.log | grep done",
      "tail build.log|grep 'sleep|tail'",
      "tail build.log # progress",
      "sleep 1 # wait"
    ];
    for (const [index, command] of positives.entries()) {
      const extra = { session_id: `positive-${index}` };
      assertAllowed(run(command, extra));
      assertAllowed(run(command, extra));
      assertDenied(run(command, extra));
    }
    const negatives = [
      "echo tail",
      "printf 'sleep 1'",
      'echo "tail build.log"',
      "cat build.log | tail -n 2",
      "printf done | sleep 1",
      "rg tail README.md",
      "git log --grep=sleep",
      "detail build.log",
      "sleeper 1",
      "tail#comment",
      "sleep#comment",
      "# tail build.log",
      '"tail" build.log',
      "'sleep' 1",
      "tail () { printf done; }",
      "sleep () { printf done; }",
      "tail 'unclosed",
      "tail $LOG",
      'tail "$(printf build.log)"',
      "tail `printf build.log`",
      "tail build.log; sleep 1",
      "tail build.log && sleep 1",
      "tail build.log\nsleep 1",
      "tail <<EOF\nsleep 1\nEOF",
      "tail > output.log",
      "tail < input.log",
      "tail | if",
      "tail|if|cat",
      "tail | while true",
      "env sleep 1",
      "sudo tail build.log",
      "/usr/bin/tail build.log",
      "tail\\\n -n 2 build.log",
      `tail ${"a".repeat(10_000)}$value`
    ];
    for (const [index, command] of negatives.entries()) {
      const extra = { session_id: `negative-${index}` };
      assertAllowed(run("sleep 1", extra));
      assertAllowed(run("tail build.log", extra));
      assertAllowed(run(command, extra));
      assertAllowed(run("sleep 1", extra));
      assertAllowed(run("tail build.log", extra));
      assertDenied(run("sleep 1", extra));
    }
  });

  test(`${host} isolates sessions and resets on malformed Bash input`, (t) => {
    const { run, root } = setup(t, host);
    assertAllowed(run("sleep 1"));
    assertAllowed(run("sleep 1"));
    assertAllowed(run("sleep 1", { session_id: "another" }));
    assertAllowed(run("sleep 1", { tool_input: {} }));
    assertAllowed(run("sleep 1"));
    assertAllowed(run("sleep 1"));
    assertDenied(run("sleep 1"));
    assertAllowed(run("tail completed.log", { session_id: "completed-task" }));
    const namespace = path.join(
      root,
      `workgraph-bash-polling-${process.getuid()}`
    );
    assert.ok(
      readdirSync(namespace).every((name) => /^[a-f0-9]{64}$/u.test(name))
    );
    assertAllowed(run("sleep 1", { session_id: "../../outside" }));
    assert.equal(readdirSync(root).length, 1);
  });

  test(`${host} serializes simultaneous calls before deciding`, async (t) => {
    const { env } = setup(t, host);
    const results = await Promise.all(
      Array.from({ length: 8 }, async () => {
        const child = spawn(process.execPath, [script, host], { env });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (data) => {
          stdout += data;
        });
        child.stderr.on("data", (data) => {
          stderr += data;
        });
        child.stdin.end(JSON.stringify(makeInput("sleep 1")));
        const [status] = await once(child, "close");
        return { status, stderr, stdout };
      })
    );
    assert.equal(results.filter((result) => result.stdout === "").length, 2);
    for (const result of results) {
      if (result.stdout) {
        assertDenied(result);
      } else {
        assertAllowed(result);
      }
      assert.equal(result.stderr, "");
    }
  });
}

test("state failures allow execution and disable stale counter decisions", (t) => {
  const { root, run } = setup(t);
  assertAllowed(run("sleep 1"));
  assertAllowed(run("sleep 1"));
  const namespace = path.join(
    root,
    `workgraph-bash-polling-${process.getuid()}`
  );
  const directory = path.join(
    namespace,
    createHash("sha256").update("claude\0session").digest("hex")
  );
  const outside = path.join(root, "private-file");
  writeFileSync(outside, "private content");
  rmSync(path.join(directory, "count"));
  symlinkSync(outside, path.join(directory, "count"));
  const failed = run("sleep 1");
  assertAllowed(failed);
  assert.equal(
    failed.stderr,
    "bash-polling-guard: state unavailable; guard skipped.\n"
  );
  assert.equal(readFileSync(outside, "utf-8"), "private content");
  assertAllowed(run("sleep 1"));
  assertAllowed(run("sleep 1"));
  assertAllowed(run("sleep 1"));
  assertAllowed(run("sleep 1"));
});

test("a stale lock fails open without deleting another invocation's lock", (t) => {
  const { root, run } = setup(t);
  assertAllowed(run("sleep 1"));
  const namespace = path.join(
    root,
    `workgraph-bash-polling-${process.getuid()}`
  );
  const directory = path.join(namespace, readdirSync(namespace)[0]);
  writeFileSync(path.join(directory, "lock"), "");
  const failed = run("printf useful");
  assertAllowed(failed);
  assert.equal(
    failed.stderr,
    "bash-polling-guard: state unavailable; guard skipped.\n"
  );
  assert.ok(readdirSync(directory).includes("lock"));
  rmSync(path.join(directory, "lock"));
  assertAllowed(run("sleep 1"));
  assertAllowed(run("sleep 1"));
  assertAllowed(run("sleep 1"));
});

test("configured hooks run from relocated plugin paths without changing startup hooks", (t) => {
  const { root, env } = setup(t);
  const plugin = path.join(root, "plugin with spaces");
  mkdirSync(path.join(plugin, "hooks"), { recursive: true });
  copyFileSync(script, path.join(plugin, "hooks", "bash-polling-guard.mjs"));
  for (const host of ["claude", "codex"]) {
    const config = JSON.parse(
      readFileSync(
        new URL(
          host === "claude" ? "hooks.json" : "codex-hooks.json",
          import.meta.url
        ),
        "utf-8"
      )
    );
    assert.deepEqual(Object.keys(config.hooks), [
      "SessionStart",
      "SubagentStart",
      "PreToolUse"
    ]);
    for (const event of ["PreToolUse"]) {
      const [entry] = config.hooks[event];
      assert.equal(entry.matcher, "Bash");
      assert.equal(entry.hooks.length, 1);
      const [hook] = entry.hooks;
      assert.equal(hook.type, "command");
      assert.equal(hook.async, undefined);
      assert.equal(hook.timeout, 3);
      for (let index = 0; index < 3; index += 1) {
        const result = spawnSync(`exec ${hook.command}`, {
          cwd: tmpdir(),
          encoding: "utf-8",
          env: { ...env, CLAUDE_PLUGIN_ROOT: plugin, PLUGIN_ROOT: plugin },
          input: JSON.stringify({
            hook_event_name: event,
            session_id: host,
            tool_input: { command: "sleep 1" },
            tool_name: "Bash"
          }),
          shell: true,
          timeout: 5000
        });
        if (event === "PreToolUse" && index === 2) {
          assertDenied(result);
        } else {
          assertAllowed(result);
        }
      }
    }
  }
});
