import type { MicromarkToken, Rule } from "markdownlint";

const separatorFiller = "---";

/**
 * Collect every descendant token of the requested type in document order.
 *
 * @param tokens Root tokens to search.
 * @param type Micromark token type to collect.
 * @returns The matching tokens, including nested ones.
 */
const collect = (
  tokens: readonly MicromarkToken[],
  type: string
): MicromarkToken[] => {
  const matches: MicromarkToken[] = [];
  const pending: MicromarkToken[] = [];
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    pending.push(tokens[index]);
  }
  for (let token = pending.pop(); token !== undefined; token = pending.pop()) {
    if (token.type === type) {
      matches.push(token);
    }
    for (let index = token.children.length - 1; index >= 0; index -= 1) {
      pending.push(token.children[index]);
    }
  }
  return matches;
};

/**
 * Markdownlint rule requiring exactly three hyphens in each table separator cell.
 *
 * Only the delimiter row that directly follows a table header is a separator.
 * Alignment colons are allowed around the hyphens.
 */
const rule: Rule = {
  description: "Markdown table separators must use exactly three hyphens",
  function: (params, onError) => {
    const delimiterRows = collect(
      params.parsers.micromark?.tokens ?? [],
      "tableDelimiterRow"
    );
    for (const row of delimiterRows) {
      for (const [index, cell] of collect(
        row.children,
        "tableDelimiter"
      ).entries()) {
        const [filler] = collect(cell.children, "tableDelimiterFiller");
        if (filler && filler.text !== separatorFiller) {
          onError({
            context: row.text.trim(),
            detail: `Separator cell ${index + 1} must use exactly ${separatorFiller}.`,
            fixInfo: {
              deleteCount: filler.text.length,
              editColumn: filler.startColumn,
              insertText: separatorFiller
            },
            lineNumber: filler.startLine,
            range: [filler.startColumn, filler.text.length]
          });
        }
      }
    }
  },
  names: ["docs/table-separators"],
  parser: "micromark",
  tags: ["docs", "tables"]
};

/**
 * Provide the table separator Markdownlint rule.
 */
export default rule;
