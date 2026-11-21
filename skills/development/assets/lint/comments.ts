import type { Context, ESTree, Plugin } from "@oxlint/plugins";

/** Identify tool directives and license markers whose text has a separate consumer. */
const reservedComment =
  /^\s*(?:[*!]\s*)*(?:@ts-(?:check|nocheck|ignore|expect-error)\b|(?:eslint|oxlint)-(?:disable(?:-line|-next-line)?|enable)\b|eslint(?:-env)?\s|globals?\s|(?:oxfmt|prettier)-ignore\b|(?:c8|istanbul|v8) ignore\b|[#@]\s*source(?:Mapping)?URL=|[#@]__(?:PURE|NO_SIDE_EFFECTS)__\b|@(?:license|preserve|vite-ignore)\b|webpack(?:ChunkName|Mode|Ignore|Include|Exclude|Prefetch|Preload|FetchPriority|Exports)\s*:|SPDX-(?:License-Identifier|FileCopyrightText):|copyright\b[ \t]*:?[ \t]*(?:[0-9]{4}\b|©|\(c\))|©)/iu;

/**
 * Report comments outside their declaration or tooling contract.
 */
export default {
  meta: { name: "comments" },
  rules: {
    "no-body-comments": {
      create(context: Context) {
        const { sourceCode } = context;
        const candidates = new Map<
          number,
          ReturnType<typeof sourceCode.getCommentsInside>[number]
        >();
        const documentation = new Set<number>();
        return {
          "FunctionDeclaration, FunctionExpression, ArrowFunctionExpression"(
            node: ESTree.Node
          ) {
            if (
              (node.type === "FunctionDeclaration" ||
                node.type === "FunctionExpression" ||
                node.type === "ArrowFunctionExpression") &&
              node.body?.type === "BlockStatement"
            ) {
              for (const comment of sourceCode.getCommentsInside(node.body)) {
                candidates.set(comment.start, comment);
              }
            }
          },
          "VariableDeclaration, FunctionDeclaration, ClassDeclaration, MethodDefinition, Property, PropertyDefinition, AccessorProperty, TSInterfaceDeclaration, TSTypeAliasDeclaration, TSEnumDeclaration, TSEnumMember, TSModuleDeclaration, TSDeclareFunction, TSMethodSignature, TSPropertySignature"(
            node: ESTree.Node
          ) {
            const comment = sourceCode.getCommentsBefore(node).at(-1);
            if (comment?.type === "Block" && comment.value.startsWith("*")) {
              documentation.add(comment.start);
            }
          },
          "Program:exit"() {
            for (const [start, comment] of candidates) {
              if (
                !documentation.has(start) &&
                !reservedComment.test(comment.value)
              ) {
                context.report({
                  loc: comment.loc,
                  messageId: "removeComment"
                });
              }
            }
          }
        };
      },
      meta: {
        messages: {
          removeComment:
            "Remove dead code and workaround notes. Fix the underlying code or document the contract at its declaration."
        },
        type: "suggestion"
      }
    }
  }
} satisfies Plugin;
