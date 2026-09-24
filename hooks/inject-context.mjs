#!/usr/bin/env node
import { readFileSync } from "node:fs";

/** Report hook errors without emitting partial context. */
const fail = (message, code) => {
  console.error(`inject-context: ${message}`);
  process.exit(code);
};

/** Read the selected skill body, stripping its leading frontmatter block. */
const readContext = (name) => {
  try {
    const content = readFileSync(
      new URL(`../skills/${name}/SKILL.md`, import.meta.url),
      "utf-8"
    ).trim();
    const body = content
      .match(
        /^---[\t ]*\r?\n[\s\S]*?\r?\n---[\t ]*(?:\r?\n|$)(?<body>[\s\S]*)$/u
      )
      ?.groups.body.trim();
    if (!body) {
      throw new Error("empty instructions or missing skill frontmatter");
    }
    return body;
  } catch (error) {
    fail(`cannot load instruction file ${name}/SKILL.md: ${error.message}`, 1);
  }
};

if (process.argv.length !== 3) {
  fail("expected exactly one hook event", 2);
}
const [event] = process.argv.slice(2);
if (event !== "SessionStart" && event !== "SubagentStart") {
  fail(`unsupported hook event: ${event}`, 2);
}
process.stdout.write(
  `${JSON.stringify({
    hookSpecificOutput: {
      additionalContext: readContext(
        event === "SessionStart" ? "main-agent-contract" : "subagent-context"
      ),
      hookEventName: event
    }
  })}\n`
);
