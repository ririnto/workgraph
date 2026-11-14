import type { Rule } from "markdownlint";

const rule: Rule = {
  description: "Markdown must not contain box-drawing characters",
  function: (params, onError) => {
    for (const [index, line] of params.lines.entries()) {
      const match = /(?<character>[─-╿])/u.exec(line);
      if (match?.groups?.character !== undefined) {
        onError({
          detail: "Use ASCII tree markers such as +-- and | instead.",
          lineNumber: index + 1,
          range: [match.index + 1, match.groups.character.length]
        });
      }
    }
  },
  names: ["docs/no-box-drawing"],
  parser: "none",
  tags: ["docs"]
};

/**
 * Provide the box-drawing Markdownlint rule.
 */
export default rule;
