import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import yamlParser from "markdownlint-cli2/parsers/yaml";

const fieldIdPattern = /^[A-Za-z0-9_-]+$/u;
/**
 * @param value Input value.
 * @returns Whether the value is a mapping.
 */
const isMapping = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
/**
 * @param value Input value.
 * @returns Whether the value is a non-empty string.
 */
const nonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

/**
 * @param form Parsed form.
 * @param report Diagnostic sink.
 */
const validateTopLevel = (
  form: Record<string, unknown>,
  report: (message: string) => void
) => {
  const { body, description, name } = form;
  for (const [key, value] of Object.entries({ description, name })) {
    if (!nonEmptyString(value)) {
      report(`top-level ${key} must be a non-empty string.`);
    }
  }
  if (nonEmptyString(name) && Array.from(name.trim(), () => 0).length <= 3) {
    report("top-level name must contain more than 3 characters.");
  }
  if (!Array.isArray(body) || body.length === 0) {
    report("top-level body must be a non-empty array.");
  }
};

/**
 * @param id Candidate ID.
 * @param fieldName Field location.
 * @param ids Seen IDs.
 * @param report Diagnostic sink.
 */
const validateFieldId = (
  id: unknown,
  fieldName: string,
  ids: Set<string>,
  report: (message: string) => void
) => {
  if (nonEmptyString(id)) {
    if (!fieldIdPattern.test(id)) {
      report(
        `${fieldName} id may contain only letters, numbers, hyphens, and underscores.`
      );
    }
    const normalizedId = id.toLowerCase();
    if (ids.has(normalizedId)) {
      report(`${fieldName} repeats field id ${id}.`);
    }
    ids.add(normalizedId);
  } else {
    report(`${fieldName} must have a non-empty string id.`);
  }
};

/**
 * @param label Candidate label.
 * @param fieldName Field location.
 * @param labels Seen labels.
 * @param report Diagnostic sink.
 */
const validateFieldLabel = (
  label: unknown,
  fieldName: string,
  labels: Set<string>,
  report: (message: string) => void
) => {
  if (nonEmptyString(label)) {
    const normalizedLabel = label.trim().toLowerCase();
    if (labels.has(normalizedLabel)) {
      report(`${fieldName} repeats field label ${label}.`);
    }
    labels.add(normalizedLabel);
  } else {
    report(`${fieldName} must have a non-empty string label.`);
  }
};

/**
 * @param attributes Candidate attributes.
 * @param fieldName Field location.
 * @param labels Seen labels.
 * @param report Diagnostic sink.
 */
const validateAttributes = (
  attributes: unknown,
  fieldName: string,
  labels: Set<string>,
  report: (message: string) => void
) => {
  if (isMapping(attributes)) {
    validateFieldLabel(attributes.label, fieldName, labels, report);
  } else {
    report(`${fieldName} must have an attributes mapping.`);
  }
};

/**
 * @param body Form fields.
 * @param report Diagnostic sink.
 */
const validateFields = (body: unknown[], report: (message: string) => void) => {
  const ids = new Set<string>();
  const labels = new Set<string>();
  for (const [index, field] of body.entries()) {
    const fieldName = `body[${index + 1}]`;
    if (isMapping(field)) {
      validateFieldId(field.id, fieldName, ids, report);
      validateAttributes(field.attributes, fieldName, labels, report);
    } else {
      report(`${fieldName} must be a mapping.`);
    }
  }
};

/**
 * @param body Candidate fields.
 * @param report Diagnostic sink.
 */
const validateBody = (body: unknown, report: (message: string) => void) => {
  if (Array.isArray(body) && body.length > 0) {
    validateFields(body, report);
  }
};

/**
 * @param form Parsed form.
 * @param report Diagnostic sink.
 */
const validateMappedForm = (
  form: Record<string, unknown>,
  report: (message: string) => void
) => {
  const { body } = form;
  validateTopLevel(form, report);
  validateBody(body, report);
};

/**
 * Validate the issue-form fields Workgraph uses.
 * @param form Parsed YAML value.
 * @param source Diagnostic source label.
 * @returns Schema diagnostics.
 */
export const validateIssueForm = (
  form: unknown,
  source = "<form>"
): string[] => {
  const errors: string[] = [];
  /** @param message Diagnostic text. */
  const report = (message: string) => {
    errors.push(`${source}: ${message}`);
  };
  if (isMapping(form)) {
    validateMappedForm(form, report);
  } else {
    report("issue form must be a YAML mapping.");
  }
  return errors;
};

/**
 * @param content YAML text.
 * @param source Diagnostic source.
 * @returns Form value and diagnostics.
 */
const parseIssueFormContent = (
  content: string,
  source: string
): { errors: string[]; form: unknown; source: string } => {
  try {
    const form = yamlParser(content);
    return { errors: validateIssueForm(form, source), form, source };
  } catch (error) {
    const mark = isMapping(error) && isMapping(error.mark) ? error.mark : null;
    const line =
      mark !== null &&
      typeof mark.line === "number" &&
      Number.isInteger(mark.line)
        ? mark.line + 1
        : null;
    const location = line === null ? source : `${source}:${line}`;
    return {
      errors: [`${location}: issue form must contain valid YAML.`],
      form: null,
      source
    };
  }
};

/**
 * Parse and validate one issue form with markdownlint-cli2's YAML parser.
 * @param content YAML source text.
 * @param source Diagnostic source label.
 * @returns Parse and schema diagnostics.
 */
export const validateIssueFormContent = (
  content: string,
  source = "<form>"
): string[] => parseIssueFormContent(content, source).errors;

/**
 * Validate issue forms together, including unique chooser names.
 * @param forms Labeled YAML sources.
 * @returns Parse, schema, and duplicate-name diagnostics.
 */
export const validateIssueForms = (
  forms: { content: string; source: string }[]
): string[] => {
  const parsedForms = forms.map(({ content, source }) =>
    parseIssueFormContent(content, source)
  );
  const errors = parsedForms.flatMap(({ errors: formErrors }) => formErrors);
  const names = new Set();
  for (const { form, source } of parsedForms) {
    if (isMapping(form) && nonEmptyString(form.name)) {
      const name = form.name.trim().toLowerCase();
      if (names.has(name)) {
        errors.push(
          `${source}: top-level name must be unique across issue forms.`
        );
      }
      names.add(name);
    }
  }
  return errors;
};

const run = () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const directory = path.join(root, ".github/ISSUE_TEMPLATE");
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => path.join(directory, entry.name))
    .toSorted();
  const forms = files.map((file) => ({
    content: readFileSync(file, "utf-8"),
    source: path.relative(root, file)
  }));
  const errors =
    files.length === 0
      ? [".github/ISSUE_TEMPLATE: no .yaml issue forms were found."]
      : validateIssueForms(forms);
  if (errors.length > 0) {
    for (const error of errors) {
      process.stderr.write(`${error}\n`);
    }
    process.exitCode = 1;
  } else {
    process.stdout.write(`Validated ${files.length} GitHub issue forms.\n`);
  }
};

if (
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  realpathSync(import.meta.filename) === realpathSync(process.argv[1])
) {
  run();
}
