#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Report hook errors without emitting partial context.
 */
const fail = (message, code) => {
  console.error(`inject-context: ${message}`);
  process.exit(code);
};

/**
 * Resolve and load required text before emitting any context.
 * Match trimmed delimiter lines and preserve the remaining text.
 */
const readInstruction = (file, stripFrontmatter) => {
  try {
    const source = realpathSync(
      fileURLToPath(new URL(`../skills/${file}`, import.meta.url))
    );
    const content = readFileSync(source, "utf-8");
    const lines = stripFrontmatter
      ? content.replace(/^\uFEFF/u, "").split("\n")
      : undefined;
    const closingFrontmatterLine = lines?.findIndex(
      (line, index) => index > 0 && line.trim() === "---"
    );
    const body = stripFrontmatter
      ? lines.slice(closingFrontmatterLine + 1).join("\n")
      : content;
    if (
      (stripFrontmatter &&
        (lines[0].trim() !== "---" || closingFrontmatterLine < 2)) ||
      !body.trim()
    ) {
      throw new Error(
        "empty instructions or missing required skill frontmatter"
      );
    }
    return { body, content, source };
  } catch (error) {
    fail(`cannot load instruction file ${file}: ${error.message}`, 1);
  }
};

if (process.argv.length !== 4) {
  fail("expected exactly one hook event and one host", 2);
}
const [event, host] = process.argv.slice(2);
if (event !== "SessionStart" && event !== "SubagentStart") {
  fail(`unsupported hook event: ${event}`, 2);
}
if (host !== "claude" && host !== "codex") {
  fail(`unsupported host: ${host}`, 2);
}
const role =
  event === "SessionStart" ? "main-agent-contract" : "subagent-context";
const skill = readInstruction(`${role}/SKILL.md`, true);
const reference = readInstruction(`${role}/references/${host}.md`, false);
const skillContext =
  host === "claude"
    ? `Workgraph instructions loaded from ${skill.source}.\nThe active execution host is Claude Code.\nThe complete skill body is already loaded below, without YAML frontmatter.\n\nBase directory for this skill: ${path.dirname(skill.source)}\n\n${skill.body}`
    : `Workgraph instructions loaded from ${skill.source}.\nThe active execution host is Codex.\nThe complete skill file is already loaded below, including YAML frontmatter.\n\n<skill>\n<name>workgraph:${role}</name>\n<path>${skill.source}</path>\n${skill.content}\n</skill>`;
process.stdout.write(
  `${JSON.stringify({
    hookSpecificOutput: {
      additionalContext: `${skillContext}\n\nWorkgraph ${host} guidance loaded from ${reference.source}.\nThe complete reference content is already loaded below.\n\n${
        host === "claude"
          ? reference.content
              .replace(/^\uFEFF/u, "")
              .replaceAll("\r\n", "\n")
              .replace(/\r$/u, "")
              .split("\n")
              .map((line, index) => `${index + 1}\t${line.replace(/\r$/u, "")}`)
              .join("\n")
          : reference.content
      }`,
      hookEventName: event
    }
  })}\n`
);
