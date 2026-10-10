---
name: writing
description: Use when drafting, editing, or reviewing prose, Markdown documentation, or instruction text.
---

# Writing

## Reader First

Lead with the answer, completed result, or next useful action.
Put commands, paths, and code beside the action they support.
Number steps when readers must perform actions in a required order.

For direct human work, report state and remaining work when they affect a decision, action, or wait.
For agent-origin messages, follow the active role's communication policy.
Explain errors by naming the cause and the next useful fix.
Offer a duration only when it helps the reader decide and known assumptions support it.

Keep concise lists complete when omitted details would change an option, conclusion, or action.
Use presentation limits to shape visible output, not analysis, source review, or evidence retention.
Offer a next action only when an unresolved user dependency requires the reader to act.
Remove tangents that do not help complete the requested task.

## Direct Prose

Use direct verbs, familiar words, and one term per concept.
Name the actor and use active voice when the actor matters.
Remove filler, empty emphasis, vague qualifiers, business jargon, and repetitive conclusions.
Avoid rhetorical contrasts, staged reveals, fragments for emphasis, and invented terms.
Vary sentence length without adding decorative punctuation or em dashes.
Keep English instruction sentences to 20 words or fewer.

Keep each paragraph focused on one idea.
Keep conditions and exceptions with the actions they qualify.
Preserve technical meaning, authority boundaries, required syntax, and exact quotations when removing repetition.

## Markdown Sentences

Write complete sentences in prose and list items.
Put each sentence on its own source line.
End each sentence before starting the next source line.
Do not force separate sentences together with semicolons or other punctuation.
Do not replace sentence boundaries to fit several instructions onto one line.
Do not reflow prose to a fixed column width.

Preserve headings, code, metadata, links, and exact quotations in their required syntax.
Use lists for parallel, sequential, or comparative items, without nesting unless the hierarchy is necessary.

## Human-Facing Documents

For human-facing documents, lead with the action or outcome and use clear headings, compact lists, and short paragraphs.
Use the action-first, scannable presentation rules in this section.
Check the rendered document for readability after editing it.

## Agent-Facing Documents

Agent-facing documents and prompts are exempt from the human-facing presentation rules and rendered-readability check above.
They still use one sentence per source line and do not join separate sentences with semicolons.
Use LaTeX or Mermaid when notation or a diagram makes the instructions clearer.

## Tables

Use tables for comparisons, mappings, or inputs and outputs.
Keep labels and headers concise, without requiring sentence punctuation.
Write explanatory cells as complete sentences with terminal punctuation.
Keep each explanatory cell to one sentence.
Put additional explanations in separate rows instead of joining sentences within a cell.

For multiple items under one label, leave later first cells blank and prefix descriptions with `-` and a space.
Use that continuation form only when the items need separate rows.
Preserve valid Markdown row syntax instead of breaking a cell across source lines.

## YAML Scalars

Use `|-` or `>-` for multiline YAML strings to omit the final line feed.
Preserve literal or folded semantics and validate parsed values, including template strings.

## Final Pass

Read the changed prose for filler, repeated rules, sentence boundaries, and detached conditions.
Check table explanations for complete sentences and their required terminal punctuation.
Run the target's applicable Markdown check without changing unrelated files.
