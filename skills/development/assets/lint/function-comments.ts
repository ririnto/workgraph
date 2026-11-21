import type { Context, ESTree, Plugin } from "@oxlint/plugins";

/** Recognize line comments consumed by tools or carrying attribution. */
const reservedComment =
  /^\s*(?:@ts-(?:check|nocheck|ignore|expect-error)\b|(?:eslint|oxlint)-(?:disable(?:-line|-next-line)?|enable)\b|(?:oxfmt|prettier)-ignore\b|(?:c8|istanbul|v8) ignore\b|[#@]\s*source(?:Mapping)?URL=|!?\s*(?:@license|@preserve)\b|SPDX-License-Identifier:|copyright\b)/iu;

/**
 * Check standalone line comments in JavaScript and TypeScript function bodies.
 */
export default {
  meta: { name: "workgraph-comments" },
  rules: {
    "no-function-body-line-comments": {
      create(context: Context) {
        const { sourceCode } = context;
        const reported = new Set<number>();
        return {
          "FunctionDeclaration, FunctionExpression, ArrowFunctionExpression"(
            node: ESTree.Node
          ) {
            if (
              (node.type !== "FunctionDeclaration" &&
                node.type !== "FunctionExpression" &&
                node.type !== "ArrowFunctionExpression") ||
              node.body?.type !== "BlockStatement"
            ) {
              return;
            }
            for (const comment of sourceCode.getCommentsInside(node.body)) {
              if (
                comment.type !== "Line" ||
                !comment.value.trim() ||
                reservedComment.test(comment.value) ||
                reported.has(comment.start) ||
                sourceCode.text
                  .slice(
                    comment.start - comment.loc.start.column,
                    comment.start
                  )
                  .trim()
              ) {
                continue;
              }
              reported.add(comment.start);
              context.report({
                loc: comment.loc,
                messageId: "explainDeclaration"
              });
            }
          }
        };
      },
      meta: {
        messages: {
          explainDeclaration:
            "Use a declaration comment for the relevant contract, or change the code so it explains itself."
        },
        type: "suggestion"
      }
    }
  }
} satisfies Plugin;
