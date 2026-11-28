import path from "node:path";

import type { Rule } from "markdownlint";

import {
  protectedDocument,
  sourceAttributedQuoteRanges
} from "./no-em-dash.ts";

const alertPattern =
  /^ {0,3}(?:>[ \t]*)+\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r\n|\r|\n|$)/iu;

/**
 * Require an explicit skill name or URL for skill links outside the bundle.
 */
export default {
  description: "Relative skill links must target a bundled Workgraph skill",
  function: (params, onError) => {
    if (protectedDocument(params)) {
      return;
    }
    const { name, parsers } = params;
    const attributedQuotes = sourceAttributedQuoteRanges(params);
    const pending = [...(parsers.micromark?.tokens ?? [])];
    for (
      let token = pending.pop();
      token !== undefined;
      token = pending.pop()
    ) {
      if (
        token.type === "resourceDestination" ||
        token.type === "definitionDestination"
      ) {
        if (
          !(attributedQuotes.get(token.startLine) ?? []).some(
            ([start, end]) =>
              start <= token.startColumn - 1 && token.startColumn - 1 < end
          )
        ) {
          const destination = token.text.replaceAll(/^<|>$/gu, "");
          if (!/^(?:[a-z][a-z\d+.-]*:|\/|#)/iu.test(destination)) {
            const relative = destination
              .replace(/[?#][\s\S]*$/u, "")
              .replaceAll(/%[\da-fA-F]{2}/gu, (escape) => {
                const decoded = String.fromCodePoint(
                  Number.parseInt(escape.slice(1), 16)
                );
                return /^[\w.~-]$/u.test(decoded) ? decoded : escape;
              });
            if (
              /(?:^|\/)SKILL\.md$/u.test(relative) &&
              !path.matchesGlob(
                path.relative(
                  process.cwd(),
                  path.resolve(path.dirname(name), relative)
                ),
                "skills/*/SKILL.md"
              )
            ) {
              onError({
                detail:
                  "Refer to external skills by name or link to their published URL.",
                lineNumber: token.startLine,
                range: [
                  token.startColumn,
                  Math.max(1, token.endColumn - token.startColumn)
                ]
              });
            }
          }
        }
      } else if (token.type !== "blockQuote" || alertPattern.test(token.text)) {
        pending.push(...token.children);
      }
    }
  },
  names: ["docs/no-relative-skill-links"],
  parser: "micromark",
  tags: ["docs", "links"]
} satisfies Rule;
