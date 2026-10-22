import type {
  ArrowFunctionExpression,
  Function as OxcFunction,
  Node
} from "@oxc-project/types";

/**
 * Workgraph adapts the Sinon Harness control flow while preserving its diagnostic contract.
 * The upstream Apache-2.0 license is retained in LICENSES/sinon-harness.txt.
 */

interface SourceRange {
  readonly end: number;
  readonly start: number;
}

interface Comment extends SourceRange {
  readonly type: string;
  readonly value: string;
}

interface RuleContext {
  readonly sourceCode: {
    readonly getCommentsBefore: (node: Node) => readonly Comment[];
    readonly getCommentsInside: (node: Node) => readonly Comment[];
  };
  readonly report: (diagnostic: {
    readonly messageId: string;
    readonly node: Node;
  }) => void;
}

type FunctionNode =
  | (OxcFunction & {
      readonly type: "FunctionDeclaration" | "FunctionExpression";
    })
  | ArrowFunctionExpression;

/**
 * Recognized tool directive comments that must stay inline with the code they control.
 */
const toolDirectivePattern =
  /^\s*(?:@ts-(?:check|expect-error|ignore|nocheck)|(?:eslint|oxlint)-(?:disable(?:-line|-next-line)?|enable)|(?:oxfmt|prettier)-ignore|(?:c8|istanbul|v8) ignore)(?![\w-])/u;

const isFunctionNode = (node: Node): node is FunctionNode =>
  node.type === "FunctionDeclaration" ||
  node.type === "FunctionExpression" ||
  node.type === "ArrowFunctionExpression";

const noInlineCommentsRule = {
  create(context: RuleContext) {
    const documentedCommentOffsets = new Set<number>();
    const reportedOffsets = new Set<number>();
    const recordDeclarationDocumentation = (node: Node): void => {
      for (const { start, type, value } of context.sourceCode.getCommentsBefore(
        node
      )) {
        if (type === "Block" && value.startsWith("*")) {
          documentedCommentOffsets.add(start);
        }
      }
    };
    const inspectFunction = (node: Node): void => {
      if (
        !isFunctionNode(node) ||
        !node.body ||
        (node.body.type !== "BlockStatement" &&
          node.type !== "ArrowFunctionExpression")
      ) {
        return;
      }
      const forbiddenComments = context.sourceCode
        .getCommentsInside(node.body)
        .filter(
          ({ start, type, value }) =>
            (type === "Line" ||
              (type === "Block" &&
                (!value.startsWith("*") ||
                  !documentedCommentOffsets.has(start)))) &&
            !toolDirectivePattern.test(value)
        );
      for (const { start } of forbiddenComments) {
        if (!reportedOffsets.has(start)) {
          reportedOffsets.add(start);
          context.report({ messageId: "noInlineComments", node });
        }
      }
    };
    return {
      ...Object.fromEntries(
        [
          "ClassDeclaration",
          "FunctionDeclaration",
          "MethodDefinition",
          "PropertyDefinition",
          "TSAbstractMethodDefinition",
          "TSAbstractPropertyDefinition",
          "TSDeclareFunction",
          "TSEnumDeclaration",
          "TSImportEqualsDeclaration",
          "TSInterfaceDeclaration",
          "TSModuleDeclaration",
          "TSTypeAliasDeclaration",
          "VariableDeclaration"
        ].map((type) => [type, recordDeclarationDocumentation])
      ),
      "ArrowFunctionExpression:exit": inspectFunction,
      "FunctionDeclaration:exit": inspectFunction,
      "FunctionExpression:exit": inspectFunction
    };
  },
  meta: {
    docs: {
      description:
        "Disallow comments inside function bodies except for tool directives and declaration documentation."
    },
    messages: {
      noInlineComments:
        "Remove inline comments from function bodies unless they document a declaration or are tool directives."
    },
    type: "problem"
  } as const
};

const style = {
  meta: { name: "style" },
  rules: { "no-inline-comments-in-functions": noInlineCommentsRule }
};

/**
 * Provide the native Oxlint plugin for function-body inline-comment checks.
 */
export default style;
