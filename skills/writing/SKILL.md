---
name: writing
description: Use when drafting, editing, or reviewing Markdown or YAML source, repository guidance, skills, prompts, or other agent instructions.
disable-model-invocation: true
---

# Writing

Apply these source and instruction conventions when the user or target format does not specify another style.
They cover Markdown and YAML source and agent-facing instructions, not general prose style.

## Markdown sentences

Write complete sentences in prose and list items.
Put each sentence on its own source line.
Do not force separate sentences together with semicolons or other punctuation.
Do not replace sentence boundaries to fit several instructions onto one line.
Do not reflow prose to a fixed column width.

Preserve headings, code, metadata, links, and exact quotations in their required syntax.

## Agent-facing documents

Write agent-facing prompts and instruction-management skills as explicit task contracts.
Before drafting, editing, or reviewing agent-facing prompts or instructions, read [Instruction design](references/instruction-design.md) unless its complete content is already loaded.
Prefer short instruction sentences, splitting dense instructions when their conditions remain clear.
Keep conditions and exceptions with the actions they qualify.
Preserve technical meaning, authority boundaries, required syntax, and exact quotations when removing repetition.
Keep uncertainty when removing a hedge would invent confidence.
Use LaTeX or Mermaid when notation or a diagram makes the instructions clearer.

## Tables

Keep labels and headers concise, without requiring sentence punctuation.
Write explanatory cells as complete sentences with terminal punctuation.
Keep each explanatory cell to one sentence.
Put additional explanations in separate rows instead of joining sentences within a cell.

For multiple items under one label, leave later first cells blank and prefix descriptions with `-` and a space.
Use that continuation form only when the items need separate rows.
Preserve valid Markdown row syntax instead of breaking a cell across source lines.

## YAML scalars

Use `|-` or `>-` for multiline YAML strings to omit the final line feed.
Use `|-` for literal line breaks and `>-` for source wrapping of one logical line.
Apply these rules to Markdown frontmatter, including memory records.
Preserve literal or folded semantics and validate parsed values, including template strings.

## Final pass

Read the changed source for repeated rules, sentence boundaries, and detached conditions.
Check table explanations for complete sentences and their required terminal punctuation.
Run the target's applicable Markdown check without changing unrelated files.
