import type { MicromarkToken, Rule } from "markdownlint";

const rule: Rule = {
  description: "Prose and headings must not contain em dashes",
  function: (params, onError) => {
    const pending: MicromarkToken[] = [
      ...(params.parsers.micromark?.tokens ?? [])
    ];
    for (
      let token = pending.pop();
      token !== undefined;
      token = pending.pop()
    ) {
      if (token.type === "data") {
        let { parent } = token;
        let prose = false;
        let excluded = false;
        while (parent) {
          if (
            [
              "codeText",
              "literalAutolink",
              "autolink",
              "resource",
              "definition",
              "labelText"
            ].includes(parent.type)
          ) {
            excluded = true;
          }
          if (
            [
              "paragraph",
              "atxHeadingText",
              "setextHeadingText",
              "tableData",
              "tableHeader"
            ].includes(parent.type)
          ) {
            prose = true;
          }
          ({ parent } = parent);
        }
        const index = token.text.indexOf("—");
        if (prose && !excluded && index !== -1) {
          onError({
            lineNumber: token.startLine,
            range: [token.startColumn + index, 1]
          });
        }
      } else {
        pending.push(...token.children);
      }
    }
  },
  names: ["docs/no-em-dash"],
  parser: "micromark",
  tags: ["docs"]
};

/**
 * Provide the prose em-dash Markdownlint rule.
 */
export default rule;
