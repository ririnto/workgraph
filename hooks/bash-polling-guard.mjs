#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setInterval } from "node:timers/promises";

/** Literal shell words exclude expansions and compound syntax deliberately. */
const word = String.raw`(?:[\w./,:=@%+*?~-]|'[^'\r\n]*'|"[^"$\x60\\\r\n]*")+`;
const pipelineCommand = String.raw`(?!(?:if|then|else|elif|fi|do|done|for|while|until|case|esac|function|in|select|time|coproc)(?:[ \t|]|$))[\w./-]+(?:[ \t]+${word})*`;
const pollingCommand = new RegExp(
  String.raw`^[ \t]*(?<command>tail|sleep)(?=[ \t|]|\r?$)(?:[ \t]+${word})*(?:[ \t]*\|[ \t]*${pipelineCommand})*[ \t]*(?:#[^\r\n]*)?(?:\r?\n)?$`,
  "u"
);

/** Create private namespaces without following preexisting directory symlinks. */
const privateDirectory = (directory) => {
  try {
    mkdirSync(directory, { mode: 0o700 });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
  const metadata = lstatSync(directory);
  if (
    !metadata.isDirectory() ||
    metadata.uid !== process.getuid() ||
    metadata.mode % 0o100 !== 0
  ) {
    throw new Error("unsafe state directory");
  }
};

/** Read only the bounded counter file, never a symlink or another file type. */
const readCount = (file) => {
  let descriptor;
  try {
    descriptor = openSync(
      file,
      constants.O_RDONLY + constants.O_NOFOLLOW + constants.O_NONBLOCK
    );
    const metadata = fstatSync(descriptor);
    if (!metadata.isFile() || metadata.size !== 1) {
      throw new Error("invalid counter");
    }
    const count = readFileSync(descriptor, "utf-8");
    if (!/^[0-3]$/u.test(count)) {
      throw new Error("invalid counter");
    }
    return Number(count);
  } catch (error) {
    if (error.code === "ENOENT") {
      return 0;
    }
    throw error;
  } finally {
    if (descriptor !== undefined) {
      closeSync(descriptor);
    }
  }
};

/** Acquire one session lock with a bounded wait, leaving stale locks untouched. */
const acquireLock = async (lock) => {
  let attempts = 0;
  for await (const _tick of setInterval(10)) {
    try {
      closeSync(openSync(lock, "wx", 0o600));
      return;
    } catch (error) {
      attempts += 1;
      if (error.code !== "EEXIST" || attempts === 100) {
        throw error;
      }
    }
  }
};

/** Serialize one session's transitions and disable enforcement after state failures. */
const guard = async (input, host) => {
  if (
    typeof input.session_id !== "string" ||
    !input.session_id ||
    input.hook_event_name !== "PreToolUse" ||
    input.tool_name !== "Bash"
  ) {
    return;
  }
  if (
    typeof process.getuid !== "function" ||
    typeof constants.O_NOFOLLOW !== "number"
  ) {
    throw new TypeError("unsupported state platform");
  }
  const root = path.join(
    tmpdir(),
    `workgraph-bash-polling-${process.getuid()}`
  );
  privateDirectory(root);
  const directory = path.join(
    root,
    createHash("sha256").update(`${host}\0${input.session_id}`).digest("hex")
  );
  privateDirectory(directory);
  const lock = path.join(directory, "lock");
  const counter = path.join(directory, "count");
  const disabled = path.join(directory, "disabled");
  let locked = false;
  let temporary;
  try {
    await acquireLock(lock);
    locked = true;
    if (existsSync(disabled)) {
      return;
    }
    const matches =
      typeof input.tool_input?.command === "string" &&
      pollingCommand.test(input.tool_input.command);
    const count = matches ? Math.min(readCount(counter) + 1, 3) : 0;
    temporary = path.join(directory, randomUUID());
    writeFileSync(temporary, String(count), { flag: "wx", mode: 0o600 });
    renameSync(temporary, counter);
    temporary = undefined;
    if (count === 3 && !existsSync(disabled)) {
      process.stdout.write(
        `${JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason:
              "Workgraph blocked a third consecutive tail or sleep command. End the turn and await the completion callback instead of polling."
          }
        })}\n`
      );
    }
  } catch {
    if (!existsSync(disabled)) {
      closeSync(openSync(disabled, "wx", 0o600));
    }
    console.error("bash-polling-guard: state unavailable; guard skipped.");
  } finally {
    if (temporary !== undefined) {
      unlinkSync(temporary);
    }
    if (locked) {
      unlinkSync(lock);
    }
  }
};

try {
  const [host] = process.argv.slice(2);
  if (process.argv.length === 3 && ["claude", "codex"].includes(host)) {
    await guard(JSON.parse(readFileSync(0, "utf-8")), host);
  }
} catch {
  console.error(
    "bash-polling-guard: input or state unavailable; guard skipped."
  );
}
