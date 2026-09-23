#!/usr/bin/env node
import { readFileSync } from "node:fs";

/** Report hook errors without emitting partial context. */
const fail = (message, code) => {
  console.error(`inject-context: ${message}`);
  process.exit(code);
};

/** Read nonempty instructions relative to this module. */
const readContext = (name) => {
  const file = new URL(`context/${name}.md`, import.meta.url);
  let content;
  try {
    content = readFileSync(file, "utf-8").trim();
  } catch {
    fail(`cannot read instruction file: ${name}.md`, 1);
  }
  if (!content) {
    fail(`instruction file is empty: ${name}.md`, 1);
  }
  return content;
};

if (process.argv.length !== 3) {
  fail("expected exactly one hook event", 2);
}
const [event] = process.argv.slice(2);
if (event !== "SessionStart" && event !== "SubagentStart") {
  fail(`unsupported hook event: ${event}`, 2);
}
const context = [
  readContext("common"),
  readContext(event === "SessionStart" ? "main" : "worker")
].join("\n\n");
process.stdout.write(
  `${JSON.stringify({
    hookSpecificOutput: {
      additionalContext: context,
      hookEventName: event
    }
  })}\n`
);
