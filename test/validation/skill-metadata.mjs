import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import yamlParser from "markdownlint-cli2/parsers/yaml";

const namePattern = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const isMapping = (value) =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;
const nonEmptyString = (value) =>
  typeof value === "string" && value.trim() !== "";

const validateName = (value, directoryName, report) => {
  if (!nonEmptyString(value)) {
    report("name must be a non-empty string.");
    return;
  }
  const name = value.trim().normalize("NFKC");
  if ([...name].length > 64) {
    report("name must contain at most 64 characters.");
  }
  if (name !== name.toLowerCase()) {
    report("name must be lowercase.");
  }
  if (!namePattern.test(name)) {
    report("name must contain letters or numbers separated by single hyphens.");
  }
  if (name !== directoryName.normalize("NFKC")) {
    report("name must match its parent directory.");
  }
};

const validateFields = (metadata, report) => {
  for (const [key, limit] of [
    ["description", 1024],
    ["compatibility", 500]
  ]) {
    if (key === "description" || Object.hasOwn(metadata, key)) {
      const value = metadata[key];
      if (!nonEmptyString(value)) {
        report(`${key} must be a non-empty string.`);
      } else if ([...value].length > limit) {
        report(`${key} must contain at most ${limit} characters.`);
      }
    }
  }
  for (const key of ["license", "allowed-tools"]) {
    if (Object.hasOwn(metadata, key) && typeof metadata[key] !== "string") {
      report(`${key} must be a string.`);
    }
  }
  if (
    Object.hasOwn(metadata, "metadata") &&
    (!isMapping(metadata.metadata) ||
      Object.values(metadata.metadata).some(
        (value) => typeof value !== "string"
      ))
  ) {
    report("metadata must be a mapping with string values.");
  }
};

const validateInvocation = (metadata, report) => {
  for (const [key, allowed] of [
    ["disable-model-invocation", [false, 0, "false", "no", "off", "0"]],
    ["user-invocable", [true, 1, "true", "yes", "on", "1"]]
  ]) {
    if (Object.hasOwn(metadata, key)) {
      const value = metadata[key];
      const normalized =
        typeof value === "string" ? value.toLowerCase() : value;
      if (!allowed.includes(normalized)) {
        report(
          `${key} must keep the skill model-invocable and user-invocable.`
        );
      }
    }
  }
};

/**
 * Validate portable skill metadata and Workgraph's invocation policy.
 * Preserve host extensions outside the checked fields.
 * @param {string} content Complete SKILL.md source.
 * @param {string} directoryName Name of the containing skill directory.
 * @param {string} source Diagnostic source label.
 * @returns {string[]} Frontmatter, field, and body diagnostics.
 */
export const validateSkillContent = (
  content,
  directoryName,
  source = "<skill>"
) => {
  const errors = [];
  const report = (message) => errors.push(`${source}: ${message}`);
  const lines = content.replace(/^\uFEFF/u, "").split("\n");
  const closing = lines.findIndex(
    (line, index) => index > 0 && line.trim() === "---"
  );
  if (lines[0].trim() !== "---" || closing < 1) {
    report("skill must start with closed YAML frontmatter.");
    return errors;
  }
  if (!lines.slice(closing + 1).some((line) => line.trim())) {
    report("skill body must contain text.");
  }
  try {
    const metadata = yamlParser(lines.slice(1, closing).join("\n"));
    if (isMapping(metadata)) {
      validateName(metadata.name, directoryName, report);
      validateFields(metadata, report);
      validateInvocation(metadata, report);
    } else {
      report("frontmatter must be a YAML mapping.");
    }
  } catch (error) {
    const line = Number.isInteger(error?.mark?.line)
      ? error.mark.line + 2
      : null;
    const location = line === null ? source : `${source}:${line}`;
    errors.push(`${location}: frontmatter must contain valid YAML.`);
  }
  return errors;
};

const bundledPath = (root, source) => {
  const resolved = realpathSync(path.join(root, source));
  const relative = path.relative(root, resolved);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`${source}: path must resolve inside the plugin root.`);
  }
  return resolved;
};

const run = () => {
  const root = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
  const skillsRoot = bundledPath(root, "skills");
  const skills = readdirSync(skillsRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() ||
        (entry.isSymbolicLink() &&
          statSync(path.join(skillsRoot, entry.name), {
            throwIfNoEntry: false
          })?.isDirectory())
    )
    .map((entry) => entry.name)
    .toSorted();
  const errors = [];
  if (skills.length === 0) {
    errors.push("skills: no skill directories were found.");
  }
  for (const directoryName of skills) {
    const source = path.join("skills", directoryName, "SKILL.md");
    try {
      bundledPath(root, path.join("skills", directoryName));
      const filename = bundledPath(root, source);
      if (!statSync(filename).isFile()) {
        throw new Error(`${source}: skill file must be readable.`);
      }
      const content = readFileSync(filename, "utf-8");
      errors.push(...validateSkillContent(content, directoryName, source));
    } catch (error) {
      errors.push(
        error.code ? `${source}: skill file must be readable.` : error.message
      );
    }
  }
  if (errors.length > 0) {
    for (const error of errors) {
      process.stderr.write(`${error}\n`);
    }
    process.exitCode = 1;
  } else {
    process.stdout.write(`Validated ${skills.length} skill metadata files.\n`);
  }
};

if (
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  realpathSync(import.meta.filename) === realpathSync(process.argv[1])
) {
  try {
    run();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
