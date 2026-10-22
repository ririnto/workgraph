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
    readonly getTokens: (node: Node) => readonly SourceRange[];
    readonly text: string;
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

const isFunctionNode = (node: Node): node is FunctionNode =>
  node.type === "FunctionDeclaration" ||
  node.type === "FunctionExpression" ||
  node.type === "ArrowFunctionExpression";

const noBlankLinesRule = {
  create(context: RuleContext) {
    const reportedOffsets = new Set<number>();
    const inspectFunction = (node: Node): void => {
      if (isFunctionNode(node) && node.body) {
        const { body } = node;
        if (
          body.type !== "BlockStatement" &&
          node.type !== "ArrowFunctionExpression"
        ) {
          return;
        }
        const tokens = context.sourceCode.getTokens(body);
        const comments = context.sourceCode.getCommentsInside(body);
        const isProtected = (offset: number): boolean =>
          tokens.some(({ start, end }) => start <= offset && offset < end) ||
          comments.some(({ start, end }) => start <= offset && offset < end);
        const statements = body.type === "BlockStatement" ? body.body : [];
        const firstStatementIndex = statements.findIndex(
          (element) =>
            !("directive" in element && typeof element.directive === "string")
        );
        const exemptionStart =
          firstStatementIndex > 0
            ? statements[firstStatementIndex - 1]?.end
            : undefined;
        const exemptionEnd =
          firstStatementIndex > 0
            ? statements[firstStatementIndex]?.start
            : undefined;
        const isExempted = (offset: number): boolean =>
          exemptionStart !== undefined &&
          exemptionEnd !== undefined &&
          exemptionStart <= offset &&
          offset < exemptionEnd;
        const bodyText = context.sourceCode.text.slice(body.start, body.end);
        const blankLineOffsets = Array.from(
          bodyText.matchAll(/^[^\S\r\n\u2028\u2029]*$/gmu),
          ({ index }) => index
        )
          .filter((index): index is number => index !== undefined)
          .filter(
            (index) =>
              !(bodyText[index - 1] === "\r" && bodyText[index] === "\n")
          )
          .map((index) => index + body.start)
          .filter((offset) => !isProtected(offset) && !isExempted(offset));
        for (const offset of blankLineOffsets) {
          if (!reportedOffsets.has(offset)) {
            reportedOffsets.add(offset);
            context.report({ messageId: "noBlankLines", node });
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
      description:
        "Disallow physical blank lines inside function bodies, except for the gap " +
        "between a JavaScript directive prologue and the first ordinary statement."
    },
    messages: {
      noBlankLines: "Remove blank lines from function bodies."
    },
    type: "problem"
  } as const
};

const style = {
  meta: { name: "style" },
  rules: { "no-blank-lines-in-functions": noBlankLinesRule }
};

/**
 * Provide the native Oxlint plugin for function-body blank-line checks.
 */
export default style;
