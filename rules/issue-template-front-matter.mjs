import yamlParser from "markdownlint-cli2/parsers/yaml";

const issueTemplatePath = /(?:^|\/)\.github\/ISSUE_TEMPLATE\/[^/]+\.md$/u;
const requiredFields = ["name", "about"];

/**
 * Check GitHub Markdown issue templates for their required YAML metadata.
 */
const rule = {
  description: "GitHub issue templates require non-empty name and about fields",
  function: (params, onError) => {
    const name = params.name.replaceAll("\\", "/");
    if (!issueTemplatePath.test(name)) {
      return;
    }
    let frontMatter;
    try {
      frontMatter = yamlParser(params.frontMatterLines.slice(1, -1).join("\n"));
    } catch {
      onError({
        detail: "Issue template front matter must be valid YAML.",
        lineNumber: 1
      });
      return;
    }
    if (
      !frontMatter ||
      typeof frontMatter !== "object" ||
      Array.isArray(frontMatter)
    ) {
      onError({
        detail: "Issue template front matter must be a YAML mapping.",
        lineNumber: 1
      });
      return;
    }
    for (const field of requiredFields) {
      if (
        typeof frontMatter[field] !== "string" ||
        frontMatter[field].trim() === ""
      ) {
        onError({
          detail: `Issue template front matter requires a non-empty string ${field} field.`,
          lineNumber: 1
        });
      }
    }
  },
  names: ["docs/issue-template-front-matter"],
  parser: "none",
  tags: ["docs", "metadata"]
};

export default rule;
