import path from "node:path";

import type { Rule } from "markdownlint";
import parseYaml from "markdownlint-cli2/parsers/yaml";

/**
 * Require a valid YAML mapping at the start of each bundled skill.
 */
export default {
  description: "Bundled skills must start with a valid YAML mapping",
  function: ({ name, frontMatterLines }, onError) => {
    if (
      !path.matchesGlob(path.relative(process.cwd(), name), "skills/*/SKILL.md")
    ) {
      return;
    }
    if (frontMatterLines.length === 0) {
      onError({ detail: "Expected YAML frontmatter.", lineNumber: 1 });
      return;
    }
    const closing = frontMatterLines.findLastIndex(
      (line) => line.trim() !== ""
    );
    try {
      const content = parseYaml(frontMatterLines.slice(1, closing).join("\n"));
      if (
        content === null ||
        typeof content !== "object" ||
        Object.getPrototypeOf(content) !== Object.prototype
      ) {
        onError({
          detail: "Expected a YAML mapping.",
          frontMatter: true,
          lineNumber: 1
        });
      }
    } catch (error) {
      const mark =
        error instanceof Error && "mark" in error ? error.mark : null;
      const line =
        mark !== null &&
        typeof mark === "object" &&
        "line" in mark &&
        typeof mark.line === "number"
          ? mark.line + 2
          : 1;
      onError({
        detail: "Expected valid YAML with unique keys and defined aliases.",
        frontMatter: true,
        lineNumber: line
      });
    }
  },
  names: ["docs/skill-frontmatter"],
  parser: "none",
  tags: ["skills"]
} satisfies Rule;
