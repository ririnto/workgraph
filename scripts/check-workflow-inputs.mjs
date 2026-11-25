import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import yamlParser from "markdownlint-cli2/parsers/yaml";

import snapshots from "../.github/action-inputs.json" with { type: "json" };

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(root, ".github/workflows");
/** @type {Map<string, { commit: string, inputs: Record<string, unknown> }>} */
const actions = new Map(Object.entries(snapshots));
const commitPattern = /^[0-9a-f]{40}$/u;

/**
 * @param {unknown} value Parsed YAML value.
 * @returns {value is Record<string, unknown>} Whether the value is a mapping.
 */
const isMapping = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * @param {unknown} value Parsed YAML value.
 * @returns {value is unknown[]} Whether the value is a sequence.
 */
const isSequence = (value) => Array.isArray(value);

/**
 * @param {unknown} workflow Parsed workflow.
 * @param {string} source Repository-relative workflow path.
 */
const checkWorkflow = (workflow, source) => {
  if (!isMapping(workflow) || !isMapping(workflow.jobs)) {
    return;
  }
  for (const [job, definition] of Object.entries(workflow.jobs)) {
    if (!isMapping(definition) || !isSequence(definition.steps)) {
      continue;
    }
    for (const [index, step] of definition.steps.entries()) {
      if (!isMapping(step)) {
        continue;
      }
      const { uses, with: inputs } = step;
      if (typeof uses !== "string" || !isMapping(inputs)) {
        continue;
      }
      const action = actions.get(uses);
      if (action === undefined || !commitPattern.test(action.commit)) {
        continue;
      }
      for (const [input, value] of Object.entries(inputs)) {
        const fallback = action.inputs[input];
        if (
          typeof fallback === "string" &&
          !fallback.includes("${{") &&
          (typeof value === "string" ||
            typeof value === "boolean" ||
            typeof value === "number") &&
          String(value) === fallback
        ) {
          process.stderr.write(
            `${source}: job ${job}, step ${index + 1} [R35] Omit input "${input}" equal to the documented default for ${uses}.\n`
          );
          process.exitCode = 1;
        }
      }
    }
  }
};

for (const filename of readdirSync(directory, { withFileTypes: true })
  .filter(
    (entry) => entry.isFile() && path.matchesGlob(entry.name, "*.{yaml,yml}")
  )
  .map((entry) => entry.name)
  .toSorted()) {
  const file = path.join(directory, filename);
  checkWorkflow(
    yamlParser(readFileSync(file, "utf-8")),
    path.relative(root, file)
  );
}
