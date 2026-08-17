#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Plugin root resolved from this module location, never from cwd. */
// oxlint-disable-next-line unicorn/prefer-import-meta-properties -- Node >=18 support
const pluginRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/**
 * Resolved route: the contract file to inject and the hook event name.
 *
 * @typedef {object} ResolvedRoute
 * @property {string} contractFile - Contract file injected as context.
 * @property {"SessionStart" | "SubagentStart"} eventName - Hook event name.
 */

/**
 * Map a route argument to its contract file and hook event name.
 *
 * @param {string} route - Route argument passed to the hook.
 * @returns {ResolvedRoute | undefined} Route mapping, or undefined when unknown.
 */
const resolveRoute = (route) =>
  ({
    "session-start": {
      contractFile: path.join(
        pluginRoot,
        "skills/main-agent-contract/SKILL.md"
      ),
      eventName: "SessionStart"
    },
    "subagent-start": {
      contractFile: path.join(pluginRoot, "hooks/subagent-context.md"),
      eventName: "SubagentStart"
    }
  })[route];

/**
 * Print a failure to stderr and exit with a code.
 *
 * @param {string} message - Failure description for stderr.
 * @param {1 | 2} code - Process exit code.
 * @returns {never} Never returns; the process exits.
 */
const fail = (message, code) => {
  console.error(`inject-context: ${message}`);
  process.exit(code);
};

if (process.argv.length !== 3) {
  fail("expected exactly one route", 2);
}
const route = resolveRoute(process.argv[2] ?? "");
if (!route) {
  fail(`unknown route: ${process.argv[2]}`, 2);
}
if (!existsSync(route.contractFile)) {
  fail(`contract is missing or unreadable: ${route.contractFile}`, 1);
}
const contract = readFileSync(route.contractFile, "utf-8").trim();
if (!contract) {
  fail(`contract is empty: ${route.contractFile}`, 1);
}
process.stdout.write(
  `${JSON.stringify({
    hookSpecificOutput: {
      additionalContext: contract,
      hookEventName: route.eventName
    }
  })}\n`
);
