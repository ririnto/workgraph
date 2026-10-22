import type {
  Class,
  ClassElement,
  ExportAllDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  MethodDefinition,
  Node,
  PropertyDefinition,
  TSExportAssignment,
  VariableDeclaration
} from "@oxc-project/types";

/**
 * Workgraph adapts the Sinon Harness control flow while preserving its diagnostic contract.
 * The upstream Apache-2.0 license is retained in LICENSES/sinon-harness.txt.
 */

/**
 * Oxlint comment token shape used by sourceCode comment lookup.
 */
interface Comment {
  end: number;
  start: number;
  type: string;
  value: string;
}

/**
 * Minimal Oxlint-compatible rule context surface used by this plugin.
 */
interface RuleContext {
  filename?: string;
  getFilename?: () => string;
  sourceCode: {
    text: string;
    getCommentsBefore: (node: Node) => Comment[];
  };
  report: (diagnostic: {
    data?: Record<string, string | undefined>;
    messageId: string;
    node: Node;
  }) => void;
}

/**
 * Extract a printable name from an identifier, literal, or qualified name node.
 *
 * @param value Candidate AST node or nullish value.
 * @returns The printable name, or undefined when the node carries none.
 */
const nameOf = (value: unknown): string | undefined => {
  const node = typeof value === "object" && value !== null ? value : undefined;
  let name: string | undefined;
  if (node && "name" in node && typeof node.name === "string") {
    ({ name } = node);
  } else if (
    node &&
    "value" in node &&
    (typeof node.value === "string" ||
      typeof node.value === "number" ||
      typeof node.value === "boolean" ||
      typeof node.value === "bigint")
  ) {
    name = String(node.value);
  } else if (node && "left" in node && "right" in node) {
    const left = nameOf(node.left);
    const right = nameOf(node.right);
    name =
      left !== undefined && right !== undefined
        ? `${left}.${right}`
        : undefined;
  }
  return name;
};

/**
 * Extract the display name for a declaration, method, or property node.
 *
 * @param node Declaration, method, or property node to name for diagnostics.
 * @returns The declared name or "[anonymous]" when no stable name exists.
 */
const nodeName = (node: Node): string =>
  nameOf("id" in node ? node.id : undefined) ??
  nameOf("key" in node ? node.key : undefined) ??
  "[anonymous]";

/**
 * Narrow a class element to public members that require TSDoc.
 *
 * @param element Class body element to inspect.
 * @returns True for public or protected methods and properties, including
 *   constructors and implicitly public members.
 */
const isPublicClassElement = (
  element: ClassElement
): element is MethodDefinition | PropertyDefinition =>
  (element.type === "MethodDefinition" ||
    element.type === "TSAbstractMethodDefinition" ||
    element.type === "PropertyDefinition" ||
    element.type === "TSAbstractPropertyDefinition") &&
  element.key.type !== "PrivateIdentifier" &&
  element.accessibility !== "private";

/**
 * Diagnostic labels for exported declaration node types.
 */
const declarationKinds: Readonly<Record<string, string>> = {
  ClassDeclaration: "class",
  FunctionDeclaration: "function",
  TSDeclareFunction: "function",
  TSEnumDeclaration: "enum",
  TSImportEqualsDeclaration: "import alias",
  TSInterfaceDeclaration: "interface",
  TSModuleDeclaration: "namespace",
  TSTypeAliasDeclaration: "type alias",
  VariableDeclaration: "variable"
};

/**
 * Narrow an AST node to a class declaration.
 *
 * @param node AST node to inspect.
 * @returns True when the node is a class declaration.
 */
const isClassDeclaration = (
  node: Node
): node is Class & { type: "ClassDeclaration" } =>
  node.type === "ClassDeclaration";

/**
 * Extract the display name for the first declarator in a variable declaration.
 *
 * @param node Variable declaration node to inspect.
 * @returns The first binding identifier name, or a generic declaration label.
 */
const variableName = (node: VariableDeclaration): string =>
  nameOf(node.declarations[0]?.id) ?? "variable declaration";

/**
 * Describe an export statement that has no inline declaration for diagnostics.
 *
 * @param node Export list or re-export statement.
 * @returns The exported names followed by the re-export source when present.
 */
const exportStatementName = (
  node: ExportAllDeclaration | ExportNamedDeclaration
): string => {
  const names =
    node.type === "ExportAllDeclaration"
      ? "*"
      : node.specifiers
          .map((specifier) => nameOf(specifier.exported) ?? "[anonymous]")
          .join(", ");
  return node.source ? `${names} from "${node.source.value}"` : names;
};

/**
 * Require multiline TSDoc on exported TypeScript public API declarations.
 */
const exportTsdocRule = {
  create(context: RuleContext) {
    const { sourceCode } = context;
    const checkedClasses = new WeakSet<Class>();
    /**
     * Find TSDoc blocks before a node or its export wrapper.
     *
     * @param node AST node to inspect.
     * @returns Documentation comment tokens without their block delimiters.
     */
    const tsdocComments = (node: Node): Comment[] =>
      [
        ...sourceCode.getCommentsBefore(node),
        ...(node.parent?.type.startsWith("Export") === true
          ? sourceCode.getCommentsBefore(node.parent)
          : [])
      ].filter(
        (comment) => comment.type === "Block" && comment.value.startsWith("*")
      );
    /**
     * Report missing TSDoc or delimiters that share a documentation line.
     *
     * @param node AST node to attach the diagnostic to.
     * @param kind Human-readable declaration kind for the diagnostic message.
     * @param name Human-readable declaration name for the diagnostic message.
     * @returns Nothing.
     */
    const report = (node: Node, kind: string, name: string): void => {
      const comments = tsdocComments(node);
      if (
        comments.length === 0 ||
        !comments.every(
          (comment) =>
            /^\*[ \t]*\r?\n[\s\S]*\r?\n[ \t]*$/u.test(comment.value) &&
            /^[ \t]*$/u.test(
              sourceCode.text.slice(
                sourceCode.text.lastIndexOf("\n", comment.start - 1) + 1,
                comment.start
              )
            ) &&
            /^[ \t\r]*$/u.test(
              sourceCode.text.slice(comment.end).split("\n", 1)[0] ?? ""
            )
        )
      ) {
        context.report({
          data: { kind, name },
          messageId: comments.length === 0 ? "missingTsdoc" : "multilineTsdoc",
          node
        });
      }
    };
    /**
     * Report documentation diagnostics for an exposed class's public members.
     *
     * @param node Exposed class declaration node to validate.
     * @returns Nothing.
     */
    const reportClassMembers = (node: Class): void => {
      for (const element of node.body.body) {
        if (isPublicClassElement(element)) {
          report(
            element,
            element.type.endsWith("PropertyDefinition") ? "property" : "method",
            nodeName(element)
          );
        }
      }
    };
    /**
     * Validate an exposed class once without reading already checked members.
     *
     * @param node Exposed class declaration node to validate.
     * @returns Nothing.
     */
    const validateClassMembers = (node: Class): void => {
      if (!checkedClasses.has(node)) {
        checkedClasses.add(node);
        reportClassMembers(node);
      }
    };
    /**
     * Validate TSDoc on a supported exported declaration node.
     *
     * @param node Exported declaration node from an export wrapper.
     * @returns Nothing.
     */
    const validateExportedDeclaration = (
      node: Node | null | undefined
    ): void => {
      const kind = node ? declarationKinds[node.type] : undefined;
      if (node && isClassDeclaration(node)) {
        report(node, "class", nodeName(node));
        validateClassMembers(node);
      } else if (node && kind !== undefined) {
        report(
          node,
          kind,
          node.type === "VariableDeclaration"
            ? variableName(node)
            : nodeName(node)
        );
      }
    };
    /**
     * Resolve a local class declaration or expression in the export statement's scope.
     *
     * @param node Export statement referencing a local binding.
     * @param name Local identifier to resolve.
     * @returns Nothing.
     */
    const validateLocalClass = (node: Node, name: string | undefined): void => {
      const scope = node.parent;
      if (
        name !== undefined &&
        scope &&
        "body" in scope &&
        Array.isArray(scope.body)
      ) {
        for (const statement of scope.body) {
          const declaration =
            statement.type === "ExportNamedDeclaration"
              ? statement.declaration
              : statement;
          if (
            declaration &&
            isClassDeclaration(declaration) &&
            declaration.id?.name === name
          ) {
            validateClassMembers(declaration);
          } else if (declaration?.type === "VariableDeclaration") {
            for (const declarator of declaration.declarations) {
              if (
                nameOf(declarator.id) === name &&
                declarator.init?.type === "ClassExpression"
              ) {
                validateClassMembers(declarator.init);
              }
            }
          }
        }
      }
    };
    return /\.(?:[cm]?ts|tsx)$/u.test(
      context.filename ?? context.getFilename?.() ?? ""
    )
      ? {
          ExportAllDeclaration(node: ExportAllDeclaration) {
            report(node, "re-export", exportStatementName(node));
          },
          ExportDefaultDeclaration(node: ExportDefaultDeclaration) {
            if (node.declaration.type in declarationKinds) {
              validateExportedDeclaration(node.declaration);
            } else {
              report(node, "default export", "default");
              if (node.declaration.type === "Identifier") {
                validateLocalClass(node, node.declaration.name);
              }
            }
          },
          ExportNamedDeclaration(node: ExportNamedDeclaration) {
            if (node.declaration) {
              validateExportedDeclaration(node.declaration);
            } else if (node.source || node.specifiers.length > 0) {
              report(
                node,
                node.source ? "re-export" : "export list",
                exportStatementName(node)
              );
              if (!node.source) {
                for (const specifier of node.specifiers) {
                  validateLocalClass(node, nameOf(specifier.local));
                }
              }
            }
          },
          TSExportAssignment(node: TSExportAssignment) {
            report(node, "export assignment", "=");
          }
        }
      : {};
  },
  meta: {
    docs: {
      description:
        "Require multiline TSDoc on exported TypeScript public API declarations."
    },
    messages: {
      missingTsdoc:
        'Missing TSDoc for exported public API {{kind}} "{{name}}".',
      multilineTsdoc:
        'Use multiline TSDoc with opening and closing delimiters on separate lines for exported public API {{kind}} "{{name}}".'
    },
    type: "suggestion"
  } as const
};

/**
 * Oxlint JS plugin exporting custom TSDoc rules.
 */
const plugin = {
  meta: { name: "tsdoc" },
  rules: {
    "require-export-tsdoc": exportTsdocRule
  }
};

/**
 * Provide the native rule for exported TypeScript API documentation.
 */
export default plugin;
