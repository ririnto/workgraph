# Workgraph Repository Instructions

These instructions apply to repository contributors and are not injected into consumer sessions.
Follow explicit user requirements before repository defaults and skills, within host and safety constraints.
Complete authorized changes and relevant checks before returning a final result, or report the specific blocker.

## Instruction Ownership

Keep contributor conventions and validation commands here.
Keep consumer behavior in `skills/` and the host adapters in `docs/harness/`.
Keep consumer links and required resources inside this plugin.
Keep role procedures self-contained in each role's `SKILL.md`.

Keep host-specific execution timing in each role's references, and inject only the selected host's reference.
Keep shared role and task procedures host-neutral.
Keep native host mechanics in the matching host reference.
Keep user-facing host setup, invocation, and update instructions in the matching `docs/harness/` adapter.
Link policy owners instead of restating their procedures.
Keep orchestration and model guidance in Main Agent references.
Add no orchestration or model guidance in Worker references.

Keep lifecycle procedures in `skills/development/playbooks/`, with Development selecting only the matching playbook and language references.
Keep Workflow focused on its lower-level operation without repeating the Main contract or the Delivery checklist.
Do not duplicate an operational rule, procedure, or checklist across sources that load in the same context.
Link the sole owner instead, and keep each conditional procedure at its stated scope and read trigger.

Identify each loaded source by its actual file path and state which complete content is already present.
Match native loading by excluding YAML for Claude and retaining the complete skill file for Codex.
Load every selected file before emitting context, without requiring model retrieval during hook startup.
Keep all skills model-invocable and user-invocable.

Use `README.md` for installation and runtime behavior.
Read `docs/design.md` when changing instruction boundaries or hook delivery.
Read `docs/research.md` when changing behavior based on external research.
Record third-party attribution in `THIRD_PARTY_NOTICES.md`.

## Writing

Write maintained instructions and documentation in concise English.
Follow the active role's request-origin communication policy for conversations and handbacks.
Instruction Authoring owns the agent-facing prompt task contract, so route instruction-contract design there instead of restating it here.

When drafting, editing, or reviewing prose, read Writing unless its complete content is already loaded.

Apply Markdown lint to `.md` files.
Ultracite's code rules do not apply to Markdown.
Exclude generated and vendored material from mechanical prose edits.

## Implementation

Use Node built-ins compatible with Node.js 26 and later for the plugin runtime.
Resolve bundled files from the executing module's location.
Keep hook commands portable through the selected host's plugin-root variable.
Emit context only after all required files load and contain text.
Keep host permissions and task execution in the host.

Use Node and pnpm for development.
Follow the Node engine range in `package.json`.
Keep dependency versions in the `pnpm-workspace.yaml` catalog and resolutions in `pnpm-lock.yaml` consistent with the manifest.

Match the existing lint configuration.
Use `const` for bindings that do not change.
Keep explanations in declaration comments rather than comments inside function bodies.
Leave no blank lines inside function bodies.
Use no trailing commas in TypeScript.
Use `.yaml` for maintained YAML files unless the consumer requires another exact filename.
Use block sequences except for an explicit empty sequence.

## Repository Reviews

For Workgraph contributor pull-request reviews, follow the scoped policy in [docs/reviews.md](docs/reviews.md).

## Validation

Keep development validation gates in `test/validation/` and their Node tests in `test/`.
Select the narrowest applicable read-only gate.

- Use `pnpm run check:markdownlint-cli2` for prose-only changes.
- Use `pnpm run check:hooks` for changes confined to hook execution.
- Use `pnpm run check:issue-forms` for issue form YAML changes.
- Use `pnpm run check:plugin-version` for host manifest version checks.
- Use `pnpm run check:tooling-tests` for adopted lint rule behavior and control-flow equivalence.
- Use `pnpm run check:validation-tests` for issue form and release version gate tests.
- Use `pnpm run check` for mixed changes or repository-wide validation.
  This covers Markdownlint, Ultracite, hooks, issue forms, plugin versions, tooling tests, validation tests, and the production dependency audit.
- The production dependency audit contacts the package registry.

After plugin configuration changes, run `claude plugin validate ./` and `claude plugin validate .claude-plugin/plugin.json`.
For injected prose, run the hook tests and inspect Main and Worker contexts for each supported host.
Confirm the selected role and host reference appear without repository guidance or the other host's guidance.

Follow the [evaluation reporting requirements](README.md#development) for repeated behavioral runs, individual outcomes, and limited smoke checks.

For Workflow invocation changes, run `claude plugin eval ./ --case workflow-design-invocation --runs 2 --ablation none --allow-tools Workflow --no-publish --output-dir ../workgraph-eval-results` in a trusted checkout.
This behavioral check uses real agents and requires a host with Workflow enabled.
Keep evaluation reports local and outside the repository with `--output-dir`.
Inspect tool results because an attempted invocation alone does not prove successful execution.

Report model adherence as unverified unless a behavioral evaluation supplies evidence.

Follow the active role's evidence policy in [Main Agent Contract](skills/main-agent-contract/SKILL.md) or [Subagent Context](skills/subagent-context/SKILL.md).

Report exact commands, results, and unverified behavior.
Run formatting fixes only within the authorized change.

## Version And Publication

Follow [CONTRIBUTING.md](CONTRIBUTING.md) for commit bodies and issue and pull request templates.

Keep matching versions in both host plugin manifests using `yyyy.mm.dd.seq`.
Include the matching plugin version bump in every plugin-source pull request.
Follow the release procedure in `README.md`.
Omit version fields from the marketplace and private package manifest.
Publish only to a user-authorized destination after inspecting the diff and required evidence.
Assess observed changes for current correctness, safety, and suitability without tracing authorship, origin, or history.
Adopt, repair, or reject them within authority while preserving unrelated changes.
Pause only affected operations for unmet acceptance, true security or authority boundaries, or actual conflicting writes.
Keep credentials, private environment details, and external work-item identifiers out of committed content.
Use repository-relative paths and portable examples.
