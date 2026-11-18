#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Report hook errors without emitting partial context.
 * @param {string} message Failure description.
 * @param {number} code Process exit status.
 * @returns {never} This function exits the process.
 */
const fail = (message, code) => {
  console.error(`inject-context: ${message}`);
  process.exit(code);
};

/**
 * Resolve and load required text before emitting any context.
 * Match trimmed delimiter lines and preserve the remaining text.
 * @param {string} file Path relative to the bundled instructions directory.
 * @param {boolean} stripFrontmatter Whether to remove role metadata.
 * @returns {{body: string, content: string, source: string}} Loaded instruction text and canonical path.
 */
const readInstruction = (file, stripFrontmatter) => {
  try {
    const source = realpathSync(
      fileURLToPath(new URL(`../instructions/${file}`, import.meta.url))
    );
    const content = readFileSync(source, "utf-8");
    const lines = stripFrontmatter
      ? content.replace(/^\uFEFF/u, "").split("\n")
      : [];
    const closingFrontmatterLine = lines.findIndex(
      (line, index) => index > 0 && line.trim() === "---"
    );
    if (
      stripFrontmatter &&
      (lines[0].trim() !== "---" ||
        closingFrontmatterLine < 1 ||
        !lines.slice(1, closingFrontmatterLine).some((line) => line.trim()))
    ) {
      throw new Error(
        "empty instructions or missing required role frontmatter"
      );
    }
    const body = stripFrontmatter
      ? lines.slice(closingFrontmatterLine + 1).join("\n")
      : content;
    if (!body.trim()) {
      throw new Error(
        "empty instructions or missing required role frontmatter"
      );
    }
    return { body, content, source };
  } catch (error) {
    return fail(
      `cannot load instruction file ${file}: ${error instanceof Error ? error.message : String(error)}`,
      1
    );
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
const instructions = readInstruction(`${role}/instructions.md`, true);
const reference = readInstruction(
  `${role}/references/${hostReferenceFiles[host]}`,
  false
);
const roleContext =
  host === "claude"
    ? `Base directory for this skill: ${path.dirname(instructions.source)}\n\n${instructions.body.trimStart()}`
    : `<skill>\n<name>workgraph:${role}</name>\n<path>${instructions.source}</path>\n${instructions.content}\n</skill>`;
process.stdout.write(
  `${JSON.stringify({
    hookSpecificOutput: {
      additionalContext: `${roleContext}\n\nWorkgraph instructions loaded from ${host === "claude" ? path.basename(instructions.source) : instructions.source}.\nThe active execution host is ${host === "claude" ? "Claude Code" : "Codex"}.\n${host === "claude" ? "The complete role body is already loaded above, without YAML frontmatter." : "The complete role file is already loaded above, including YAML frontmatter."}\n\nWorkgraph ${host} guidance loaded from ${host === "claude" ? path.relative(path.dirname(instructions.source), reference.source) : reference.source}.\nThe complete reference content is already loaded below.\n\n${
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
