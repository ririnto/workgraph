import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

/** @typedef {{Offset: number, Line: number, Col: number}} Position */
/** @typedef {{
 *   Type?: string, Pos?: Position, End?: Position, OpPos?: Position,
 *   Word?: Syntax, Parts?: Syntax[], Value?: string, Dollar?: boolean,
 *   Redirs?: Syntax[], Cmd?: Syntax, Stmts?: Syntax[],
 *   Cond?: Syntax | Syntax[], Then?: Syntax[], Do?: Syntax[],
 *   Negated?: boolean, Background?: boolean
 * }} Syntax The fields used from shfmt's JSON syntax tree. */

const word = String.raw`(?:[\w./-]+|'[^'\n]*'|"(?:[^"\\$\x60\n]*|\$(?:[a-zA-Z_]\w*|\{[a-zA-Z_]\w*\}))")`;
const unaryTest = String.raw`(?:-n|-z|-f)\s+${word}`;
const doubleBracket = new RegExp(String.raw`^\[\[\s+${unaryTest}\s+\]\]$`, "u");
const guardTest = String.raw`(?:${unaryTest}|${word}\s+(?:=|!=|-eq)\s+${word})`;
const exitGuard = new RegExp(
  String.raw`^(?:\[\s+${guardTest}\s+\]|test\s+${guardTest})\s*\|\|\s*exit\s+[1-9]\d{0,2}$`,
  "u"
);

/**
 * @param {Buffer} source The script bytes.
 * @param {Syntax | undefined} node A parsed node with byte offsets.
 * @returns {string} The spelling of the parsed syntax.
 */
const spelling = (source, node) =>
  node?.Pos && node.End
    ? source.toString("utf-8", node.Pos.Offset, node.End.Offset)
    : "";

/**
 * @param {Syntax} part A parsed shell word part.
 * @returns {string | null} Its literal text when it needs no expansion.
 */
const literal = (part) => {
  if (
    part.Type === "Lit" ||
    (part.Type === "SglQuoted" && part.Dollar !== true)
  ) {
    return part.Value ?? "";
  }
  if (
    part.Type === "DblQuoted" &&
    part.Dollar !== true &&
    part.Parts?.every((child) => child.Type === "Lit") === true
  ) {
    return part.Parts.map((child) => child.Value).join("");
  }
  return null;
};

const files = execFileSync(
  "git",
  [
    "ls-files",
    "-z",
    "--",
    ".husky/pre-commit",
    ".husky/pre-push",
    "*.sh",
    ":(exclude,glob)test/fixtures/**"
  ],
  { encoding: "utf-8" }
).split("\0");
for (const file of files.filter(Boolean)) {
  const source = readFileSync(file);
  /** @type {unknown[]} */
  const pending = [
    JSON.parse(
      execFileSync("go", ["tool", "shfmt", "--to-json", "--filename", file], {
        cwd: path.resolve(import.meta.dirname, ".."),
        encoding: "utf-8",
        env: { ...process.env, GOWORK: "off" },
        input: source
      })
    )
  ];
  /** @type {{position: Position, message: string}[]} */
  const diagnostics = [];
  while (pending.length > 0) {
    const entry = pending.pop();
    if (Array.isArray(entry)) {
      for (const child of entry) {
        pending.push(child);
      }
    } else if (entry !== null && typeof entry === "object") {
      /** @type {Syntax} */
      const node = entry;
      for (const redirect of node.Redirs ?? []) {
        if (
          redirect.OpPos &&
          /^(?:>|&>)/u.test(
            source.toString(
              "utf-8",
              redirect.OpPos.Offset,
              redirect.OpPos.Offset + 2
            )
          )
        ) {
          const parts = redirect.Word?.Parts?.map(literal);
          if (
            parts &&
            !parts.includes(null) &&
            parts.join("") === "/dev/null"
          ) {
            diagnostics.push({
              message:
                "[R31] Preserve shell diagnostics instead of redirecting output to /dev/null.",
              position: redirect.OpPos
            });
          }
        }
      }
      if (
        node.Type === "TestClause" &&
        node.Pos &&
        doubleBracket.test(spelling(source, node))
      ) {
        diagnostics.push({
          message: "[R33] Use a portable [ ] test for this condition.",
          position: node.Pos
        });
      }
      for (const statement of [
        ...(node.Stmts ?? []),
        ...(Array.isArray(node.Cond) ? node.Cond : []),
        ...(node.Then ?? []),
        ...(node.Do ?? [])
      ]) {
        if (
          statement.Pos &&
          statement.Negated !== true &&
          statement.Background !== true &&
          (statement.Redirs?.length ?? 0) === 0 &&
          statement.Cmd?.Type === "BinaryCmd" &&
          exitGuard.test(spelling(source, statement.Cmd))
        ) {
          diagnostics.push({
            message: "[R33] Use an explicit if statement for this exit guard.",
            position: statement.Pos
          });
        }
      }
      for (const child of Object.values(node)) {
        pending.push(child);
      }
    }
  }
  for (const { position, message } of diagnostics.toSorted(
    (first, second) => first.position.Offset - second.position.Offset
  )) {
    process.stderr.write(
      `${file}:${position.Line}:${position.Col} ${message}\n`
    );
    process.exitCode = 1;
  }
}
