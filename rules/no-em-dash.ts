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
        if (prose && !excluded) {
          for (const [index, line] of token.text
            .split(/\r\n|[\r\n]/u)
            .entries()) {
            for (const match of line.matchAll(/\u2014/gu)) {
              onError({
                lineNumber: token.startLine + index,
                range: [(index === 0 ? token.startColumn : 1) + match.index, 1]
              });
            }
          }
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
