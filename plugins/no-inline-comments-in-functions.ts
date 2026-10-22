import type {
  ArrowFunctionExpression,
  Function as OxcFunction,
  Node
} from "@oxc-project/types";

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
    const reportedOffsets = new Set<number>();
    const inspectFunction = (node: Node): void => {
      if (isFunctionNode(node) && node.body?.type === "BlockStatement") {
        const { body } = node;
        const forbiddenComments = context.sourceCode
          .getCommentsInside(body)
          .filter(
            ({ type, value }) =>
              (type === "Line" ||
                (type === "Block" && !value.startsWith("*"))) &&
              !toolDirectivePattern.test(value)
          );
        for (const { start } of forbiddenComments) {
          if (!reportedOffsets.has(start)) {
            reportedOffsets.add(start);
            context.report({ messageId: "noInlineComments", node });
          }
        }
      }
    };
    return {
      "ArrowFunctionExpression:exit": inspectFunction,
      "FunctionDeclaration:exit": inspectFunction,
      "FunctionExpression:exit": inspectFunction
    };
  },
  meta: {
    docs: {
      description: "Disallow non-documentation comments inside function bodies."
    },
    messages: {
      noInlineComments: "Remove inline comments from function bodies."
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
