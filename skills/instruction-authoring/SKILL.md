---
name: instruction-authoring
description: Use when creating, editing, or reviewing SKILL.md, AGENTS.md, role contracts, hook instructions, or supporting instruction references.
---

# Instruction Authoring

Read [Writing](../writing/SKILL.md) unless its complete content is already loaded.

## Define The Boundary

Identify the instruction's audience, loading point, required behavior, and acceptance evidence before editing.
Use `AGENTS.md` for repository conventions and skills for task procedures.
Keep host, model, and tool mechanics in their existing instruction sources.
Remove rules that duplicate those sources or other loaded instructions.
Preserve explicit user requirements and authority boundaries when simplifying text.
Include only rules that change a relevant decision or action.
Do not turn a task example or temporary environment detail into a general requirement.

## Compose The Files

Put the required action before its rationale, then explain the reason when it helps.
When writing concise-output rules, constrain visible length without reducing required analysis or evidence.
Keep each skill usable within its stated scope.
Write a short activation description that distinguishes the skill from neighboring skills.
Put shared procedure in the skill body and conditional detail in focused skills or references.
Link each conditional file from its caller with a trigger and a resolvable path.
Read each selected file before applying its rules.
Identify sources already loaded completely so agents do not retrieve them again.
Keep role and host differences in files selected for that role and host.
Lower-level files add their procedure without explaining or repeating the caller's contract.
Use named branches or tags for maintained source links.
Remove replaced paths and update their consumers in the same change.

## Validate The Result

Confirm frontmatter and invocation fields against the target host's supported skill format.
Keep model invocation enabled unless the user requires another policy.
Check links from installed or relocated source directories, rather than assuming the repository working directory.
Inspect actual hook contexts when changing injected instructions.
Verify diagrams and formulas with their target renderer.
Run the narrowest existing checks covering the changed boundary.
Distinguish source checks, rendered output, and model behavior in the handback.
