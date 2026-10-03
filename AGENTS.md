# Workgraph Repository Instructions

These instructions apply to repository contributors and are not injected into consumer sessions.
Follow explicit user requirements before repository defaults and skills, within host and safety constraints.
Complete authorized changes and relevant checks before returning a final result, or report the specific blocker.

## Instruction Ownership

Keep contributor conventions and validation commands here.
Keep consumer behavior in `skills/`.
Keep role procedures self-contained in each role's `SKILL.md`.
Keep host-specific orchestration and model guidance in Main Agent references, and inject only the selected host's reference.
Add no host reference in Worker hook output.
Identify each loaded source by its actual file path and state which complete content is already present.
Match native loading by excluding YAML for Claude and retaining the complete skill file for Codex.
Load every selected file before emitting context, without requiring model retrieval during hook startup.
Keep all skills model-invocable and user-invocable.
Keep Workflow focused on its lower-level operation without repeating the Main contract.
Remove replaced paths and aliases without compatibility layers.

Use `README.md` for installation and runtime behavior.
Read `docs/design.md` when changing instruction boundaries or hook delivery.
Read `docs/research.md` when changing behavior based on external research.
Record third-party attribution in `THIRD_PARTY_NOTICES.md`.

## Writing

Write maintained instructions, documentation, and messages to other agents in concise English.
Use the user's requested language for user-facing explanations.

In all Markdown documents, use complete sentences in prose and list items, with one sentence per source line.
Keep conditions and exceptions with their actions.
Keep each paragraph focused on one idea.
Do not join separate sentences with semicolons or substitute punctuation.
Preserve required syntax in headings, code, metadata, and exact quotations.
Table labels and fragments need no sentence punctuation.
Use complete sentences and terminal punctuation for table explanations.
For multiple items, a table may use successive rows with blank first cells and `- description` cells.
Use that structure only when the items need separate rows.
Do not reflow Markdown to a fixed column width.

Apply Markdown lint and these prose rules to `.md` files.
Ultracite's code rules do not apply to Markdown.

Use direct verbs, concrete terms, and ASCII diagram characters.
Remove filler and repetition without changing technical meaning or explicit requirements.

## Implementation

Use Node built-ins compatible with Node.js 18 and later for the plugin runtime.
Resolve bundled files from the executing module's location.
Keep hook commands portable through the selected host's plugin-root variable.
Emit context only after all required files load and contain text.
Keep host permissions and task execution in the host.

Update consumers when replacing paths or interfaces, and remove the replaced implementation in the same change.
Use Node and npm for development.
Follow the Node engine range in `package.json`.
Keep the dependency pins in `package-lock.json` consistent with the manifest.

Match the existing lint configuration.
Use `const` for bindings that do not change.
Keep explanations in declaration comments rather than comments inside function bodies.
Leave no blank lines inside function bodies.
Use no trailing commas in TypeScript.
Use `.yaml` for maintained YAML files unless the consumer requires another extension.
Use block sequences except for an explicit empty sequence.

## Validation

Select the narrowest applicable read-only gate.

- Use `npm run check:markdownlint-cli2` for prose-only changes.
- Use `npm run check:hooks` for changes confined to hook execution.
- Use `npm run check` for mixed changes or repository-wide validation of Markdown, ultracite, and Node hook tests.

After plugin configuration changes, run `claude plugin validate ./` and `claude plugin validate .claude-plugin/plugin.json`.
For injected prose, run the hook tests and inspect Main and Worker contexts for each supported host.
Confirm the selected role and host reference appear without repository guidance or the other host's model policy.

For Workflow invocation changes, run `claude plugin eval ./ --case workflow-invocation --runs 1 --ablation none --allow-tools Workflow --no-publish --output-dir ../workgraph-eval-results` in a trusted checkout.
This behavioral check uses real agents and requires a host with Workflow enabled.
Keep evaluation reports local and outside the repository with `--output-dir`.
Inspect tool results because an attempted invocation alone does not prove successful execution.

Review sentence completeness, line boundaries, and conditions.
Report model adherence as unverified unless a behavioral evaluation supplies evidence.
Reuse passing checks for unchanged inputs, configuration, and toolchain.
Rerun or broaden checks only for changed inputs, failures, or unresolved concerns.
Report exact commands, results, and unverified behavior.
Run formatting fixes only within the authorized change.

## Version And Publication

Keep matching versions in both host plugin manifests using `yyyy.mm.dd.seq`.
Follow the release procedure in `README.md`.
Omit version fields from the marketplace and private package manifest.
Publish only to a user-authorized destination after inspecting the diff and required evidence.
Preserve unrelated changes and stop on unexplained concurrent edits.
Keep credentials, private environment details, and external work-item identifiers out of committed content.
Use repository-relative paths and portable examples.
