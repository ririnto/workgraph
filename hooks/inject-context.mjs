#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Report hook errors without emitting partial context.
 * @param {string} message Failure description.
 * @param {number} code Process exit status.
 */
const fail = (message, code) => {
  console.error(`inject-context: ${message}`);
  process.exit(code);
};

/**
 * Resolve and load required text before emitting any context.
 * Match trimmed delimiter lines and preserve the remaining text.
 * @param {string} file Skill-relative instruction path.
 * @param {boolean} stripFrontmatter Whether to remove skill metadata.
 * @returns {{body: string, content: string, source: string}} Loaded instruction text and canonical path.
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
        (lines[0].trim() !== "---" ||
          closingFrontmatterLine < 1 ||
          !lines
            .slice(1, closingFrontmatterLine)
            .some((line) => line.trim()))) ||
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

/**
 * Map each supported host to its bundled reference filename.
 * Avoid name stems that a host resolves as its automatic memory file.
 * @type {Record<string, string>}
 */
const hostReferenceFiles = {
  claude: "claude-code.md",
  codex: "codex.md"
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
const reference = readInstruction(
  `${role}/references/${hostReferenceFiles[host]}`,
  false
);
const skillContext =
  host === "claude"
    ? `Base directory for this skill: ${path.dirname(skill.source)}\n\n${skill.body.trimStart()}`
    : `<skill>\n<name>workgraph:${role}</name>\n<path>${skill.source}</path>\n${skill.content}\n</skill>`;
process.stdout.write(
  `${JSON.stringify({
    hookSpecificOutput: {
      additionalContext: `${skillContext}\n\nWorkgraph instructions loaded from ${host === "claude" ? path.basename(skill.source) : skill.source}.\nThe active execution host is ${host === "claude" ? "Claude Code" : "Codex"}.\n${host === "claude" ? "The complete skill body is already loaded above, without YAML frontmatter." : "The complete skill file is already loaded above, including YAML frontmatter."}\n\nWorkgraph ${host} guidance loaded from ${host === "claude" ? path.relative(path.dirname(skill.source), reference.source) : reference.source}.\nThe complete reference content is already loaded below.\n\n${
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
