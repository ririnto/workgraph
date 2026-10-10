# Contributing

Read [AGENTS.md](AGENTS.md) before changing this repository.
Use [README.md](README.md#development) for development setup and the existing validation commands.

## Documents

Write one complete sentence per source line and separate paragraphs with a blank line.
Apply these conventions to maintained Markdown, contributor instructions, `AGENTS.md`, and `SKILL.md` files.
Keep conditions and exceptions with their actions.
Preserve technical meaning, permissions, code, metadata, exact quotations, licenses, and required table syntax.
Exclude generated and vendored material from mechanical prose edits.

Use `.yaml` for maintained YAML files unless their consumer requires another exact filename.
Check references and the consuming tool when renaming a file.

## Issues

Use the [bug report form](.github/ISSUE_TEMPLATE/bug_report.yaml) for reproducible defects.
Use the [improvement request form](.github/ISSUE_TEMPLATE/improvement.yaml) for documentation changes, new requirements, and follow-up work.
Complete the template sections when creating issues through an API or CLI.
Link related work and describe the evidence, scope, acceptance criteria, owner, and next action.
Keep credentials and private environment details out of reports and attachments.

These templates use GitHub's [issue form schema](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema).
The repository checks their YAML and the textarea fields used by these forms.

## Commits

Write a descriptive commit title and separate it from the body with a blank line.
Explain the reason, main changes, verification results, and material limitations in the body.
Put each body sentence on its own source line and separate paragraphs with blank lines.
Record failed or unrun checks with their cause and the validation they leave outstanding.

```text
docs: clarify contribution requirements

Contributors need consistent review evidence for documentation changes.
Add issue and pull request templates with scope and verification sections.

Run the Markdown check and record its result.
Record any unavailable host validation without claiming model adherence.
```

## Pull Requests

Use the [pull request template](.github/pull_request_template.md), including when creating a PR through an API or CLI.
Explain the problem, resulting changes, verification, and remaining limitations.
Link the issue and use a closing reference only when the change satisfies its acceptance criteria.
Keep new requirements in separate linked issues.
Follow the [Delivery skill](skills/delivery/SKILL.md) for publication, independent review, integration, and cleanup.
