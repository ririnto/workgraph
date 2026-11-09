import type { MicromarkToken, Rule } from "markdownlint";

const rule: Rule = {
  description: "Prose sentences must be separated by source lines",
  function: (params, onError) => {
    const pending: MicromarkToken[] = [
      ...(params.parsers.micromark?.tokens ?? [])
    ];
    for (
      let token = pending.pop();
      token !== undefined;
      token = pending.pop()
    ) {
      if (
        ["paragraph", "atxHeadingText", "setextHeadingText"].includes(
          token.type
        )
      ) {
        const lines = new Map<number, string>();
        const inline = [...token.children];
        for (
          let child = inline.pop();
          child !== undefined;
          child = inline.pop()
        ) {
          if (child.type === "data") {
            const line =
              lines.get(child.startLine) ?? params.lines[child.startLine - 1];
            lines.set(
              child.startLine,
              line.replace(/^\s*(?:\d+[.)]|[-+*])\s+/u, (prefix) =>
                " ".repeat(prefix.length)
              )
            );
          } else if (
            [
              "codeText",
              "literalAutolink",
              "autolink",
              "link",
              "image",
              "htmlText",
              "characterReference",
              "characterEscape"
            ].includes(child.type)
          ) {
            for (
              let lineNumber = child.startLine;
              lineNumber <= child.endLine;
              lineNumber += 1
            ) {
              const line =
                lines.get(lineNumber) ?? params.lines[lineNumber - 1];
              const start =
                lineNumber === child.startLine ? child.startColumn - 1 : 0;
              const end =
                lineNumber === child.endLine
                  ? child.endColumn - 1
                  : line.length;
              lines.set(
                lineNumber,
                `${line.slice(0, start)}${"x".repeat(end - start)}${line.slice(end)}`
              );
            }
          } else {
            inline.push(...child.children);
          }
        }
        for (const [lineNumber, line] of lines) {
          if (
            /[.!?]["')\]]*\s+(?:[A-Z][a-z]+\s+[a-z]|[A-Z][a-z]+[.!?])/u.test(
              line
            )
          ) {
            onError({
              detail: "Put each sentence on its own source line.",
              lineNumber
            });
          }
          if (
            /;\s+(?:(?:and|but|so|then)\s+(?:it|this|that|they|we|you|the\s+\w+)\s+|(?:however|therefore),?\s+|(?:it|this|that|they|we|you|the\s+\w+)\s+)(?:is|are|was|were|has|have|can|must|should|will|does|do)\b/iu.test(
              line
            )
          ) {
            onError({
              detail: "Do not join prose with semicolons.",
              lineNumber
            });
          }
        }
      } else {
        pending.push(...token.children);
      }
    }
  },
  names: ["docs/prose-format"],
  parser: "micromark",
  tags: ["docs"]
};

/**
 * Provide the sentence-per-line Markdownlint rule.
 */
export default rule;
