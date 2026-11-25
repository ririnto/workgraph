import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import yamlParser from "markdownlint-cli2/parsers/yaml";

import snapshots from "../.github/action-inputs.json" with { type: "json" };

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(root, ".github/workflows");
const commitPattern = /^[0-9a-f]{40}$/u;
const actions = new Map(
  Object.entries(snapshots)
    .filter(([, { commit }]) => commitPattern.test(commit))
    .map(([uses, { inputs }]) => [
      uses,
      new Map(
        Object.entries(inputs).map(([input, value]) => [
          input.toLowerCase(),
          value
        ])
      )
    ])
);
const evenMidpoint =
  /^(?<coefficient>\d\.\d{13}[02468])50+e(?<exponent>[+-]\d+)$/u;

/**
 * @param {number} magnitude Absolute number.
 * @param {{ coefficient: string, exponent: string }} midpoint Decimal probe.
 * @returns {boolean} Whether the number is exactly at the midpoint.
 */
const isExactMidpoint = (magnitude, midpoint) => {
  const digits = BigInt(`${midpoint.coefficient.replace(".", "")}5`);
  const power = Number(midpoint.exponent) - 15;
  if (power >= 0) {
    return (
      Number.isInteger(magnitude) &&
      BigInt(magnitude) === digits * 10n ** BigInt(power)
    );
  }
  const denominator = 5n ** BigInt(-power);
  return (
    digits % denominator === 0n &&
    magnitude === Number(digits / denominator) * 2 ** power
  );
};

/**
 * Match the runner's invariant G15 number format, including rounding ties to even.
 * @param {number} value YAML number token.
 * @returns {string} Action input text.
 */
const formatRunnerNumber = (value) => {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Object.is(value, -0)) {
    return "-0";
  }
  const magnitude = Math.abs(value);
  const midpoint = evenMidpoint.exec(magnitude.toExponential(20))?.groups;
  const [coefficient, exponent] =
    midpoint &&
    isExactMidpoint(magnitude, {
      coefficient: midpoint.coefficient,
      exponent: midpoint.exponent
    })
      ? [midpoint.coefficient, midpoint.exponent]
      : magnitude.toExponential(14).split("e");
  const power = Number(exponent);
  if (power >= -4 && power < 15) {
    return `${value < 0 ? "-" : ""}${Number(`${coefficient}e${exponent}`)}`;
  }
  return `${value < 0 ? "-" : ""}${Number(coefficient)}E${power < 0 ? "-" : "+"}${String(Math.abs(power)).padStart(2, "0")}`;
};

/**
 * @param {unknown} value Parsed workflow input.
 * @returns {string | null} The runner's scalar text, or null for an expression or collection.
 */
const literalInput = (value) => {
  if (value === null) {
    return "";
  }
  if (typeof value === "number") {
    return formatRunnerNumber(value);
  }
  if (typeof value === "boolean") {
    return String(value);
  }
  return typeof value === "string" && !value.includes("${{") ? value : null;
};

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
      const defaults = actions.get(uses);
      if (defaults === undefined) {
        continue;
      }
      for (const [input, value] of Object.entries(inputs)) {
        const fallback = defaults.get(input.toLowerCase());
        if (
          typeof fallback === "string" &&
          !fallback.includes("${{") &&
          literalInput(value) === fallback
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
