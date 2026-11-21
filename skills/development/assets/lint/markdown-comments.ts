import type { Rule } from "markdownlint";

/** Preserve comments consumed by Markdown tooling or carrying legal metadata. */
const reservedComment =
  /^(?:markdownlint-(?:disable(?:-line|-next-line)?|enable|capture|restore|configure)\b|prettier-ignore(?:-start|-end)?\b|SPDX-License-Identifier:|copyright\b|@license\b)/iu;

/** Check parsed Markdown comments and leave code examples, directives, and approved markers intact. */
const rule: Rule = {
  description: "Remove hidden workaround and dead-path notes",
  function: (params, onError) => {
    const config: unknown = params.config;
    const approved = new Set(
      config !== null &&
        typeof config === "object" &&
        "allowed" in config &&
        Array.isArray(config.allowed)
        ? config.allowed.filter((entry: unknown) => typeof entry === "string")
        : []
    );
    const pending = [...(params.parsers.micromark?.tokens ?? [])];
    for (const token of pending) {
      if (
        (token.type === "htmlFlow" || token.type === "htmlText") &&
        token.text.startsWith("<!--")
      ) {
        for (const { groups } of token.text.matchAll(
          /<!--(?<body>[\s\S]*?)-->/gu
        )) {
          const body = groups?.body?.trim() ?? "";
          if (!reservedComment.test(body) && !approved.has(body)) {
            onError({
              detail:
                "Put necessary guidance in visible prose. Remove dead instructions and workaround notes.",
              lineNumber: token.startLine
            });
            break;
          }
        }
      } else {
        for (const child of token.children) {
          pending.push(child);
        }
      }
    }
  },
  names: ["comments/no-hidden-notes"],
  parser: "micromark",
  tags: ["comments"]
};

/**
 * Provide the local Markdownlint comments rule.
 */
export default rule;
