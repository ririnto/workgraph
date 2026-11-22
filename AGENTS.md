# Workgraph Repository Instructions

Use these instructions when contributing to Workgraph.
Explicit user requirements take priority over project defaults within host and safety constraints.

## Instruction ownership

- Document contributor conventions, exceptions, and checks that repository files and tooling do not make clear on their own.
  Link longer procedures where the relevant work first needs them.
  Put consumer procedures in `skills/` and user-facing host setup, invocation, and updates in `docs/harness/`.
- Keep each role body self-contained and host-neutral.
  Put native mechanics and execution timing in the selected role's host reference.
  Main's references own orchestration and model guidance.
- Keep required procedures in each skill body and link conditional resources inside the plugin where their read conditions apply.
  Link the owner of a rule when both sources load together.
- Route lifecycle and language guidance through Development, with lifecycle procedures in `skills/development/playbooks/`.
  Workflow owns its native operation, Main owns coordination, and Delivery owns repository integration.
- Load the role and its selected host reference completely and confirm both contain text before emitting hook context.
  Identify the actual source paths and content already present.
  Deliver the skill body without frontmatter for Claude and the complete file for Codex.
- Keep every skill user-invocable, disable implicit model invocation with each host's control, and route model reads through bundled `SKILL.md` links.
- Use `README.md` for installation and runtime behavior, `docs/design.md` for changes to loading boundaries, and `docs/research.md` for decisions based on external guidance.
  Record third-party attribution in `THIRD_PARTY_NOTICES.md`.

## Writing

Write maintained instructions and documentation in concise English.
Follow the active role's request-origin communication policy for conversations and handbacks.
Write one prose sentence per source line.
Use lists for enumerated items.
For agent-facing instruction changes, follow [Development instruction design](skills/development/references/instruction-design.md).

Apply Markdown lint to `.md` files.
Ultracite's code rules do not apply to Markdown.
Exclude generated and vendored material from mechanical prose edits.

## Implementation

- Use Node built-ins compatible with the engine range in `package.json` for the plugin runtime.
- Resolve bundled files from the executing module's location.
- Keep hook commands portable through the selected host's plugin-root variable.
- Keep host permissions and task execution in the host.

- Use Node and pnpm for development.
- Keep dependency versions in the `pnpm-workspace.yaml` catalog and resolutions in `pnpm-lock.yaml` consistent with the manifest.

- Match the existing lint configuration.
- Use `const` for bindings that do not change.
- Keep explanations in declaration comments rather than comments inside function bodies.
- Leave no blank lines inside function bodies.
- Use no trailing commas in TypeScript.
- Use `.yaml` for maintained YAML files unless the consumer requires another exact filename.
- Use block sequences except for an explicit empty sequence.
- Keep repository shell scripts in POSIX `sh` with the `.editorconfig` two-space indentation and check their formatting with `shfmt`.

## Tests

Follow Development's [verification guidance](skills/development/SKILL.md#verification) for test design, coverage, and evidence.
Assert strings only by exact equality, never by inclusion or non-inclusion.
Do not keep or add tests that validate document or prompt prose.

## Repository Reviews

For Workgraph contributor pull-request reviews, follow the scoped policy in [docs/reviews.md](docs/reviews.md).

## Validation

Keep development validation gates in `scripts/` and their Node tests in `test/`.
Select the narrowest applicable read-only gate.

- Use `pnpm run check:markdownlint-cli2` for prose-only changes.
- Use `node --test "hooks/**/*.test.mjs"` for changes confined to hook execution.
- Use `pnpm run check:issue-forms` for issue form YAML changes.
- Use `pnpm run check:plugin-version` for host manifest version checks.
- Use `pnpm run check:skill-metadata` for skill frontmatter, invocation policy, and native prompt compatibility checks.
- Use `pnpm run check:test` for the maintained test suites.
- Use `pnpm run check` for mixed changes or repository-wide validation.
  Its production dependency audit contacts the package registry.

After plugin configuration changes, run `claude plugin validate --strict ./` and `claude plugin validate --strict .claude-plugin/plugin.json`.
For injected prose, use the existing hook tests for role selection, host isolation, and context size.
Inspect the affected rendered context when the changed property needs further evidence.

Follow the [evaluation reporting requirements](README.md#development) for repeated behavioral runs, individual outcomes, and limited smoke checks.

For Workflow invocation changes, run `PATH="$(dirname "$(node -p process.execPath)"):$PATH" claude plugin eval ./ --case delivery-completion-evidence --runs 1 --ablation none --allow-tools Workflow --no-publish --output-dir ../workgraph-eval-results` in a trusted checkout.
This behavioral check uses real agents and requires a host with Workflow enabled.
Keep evaluation reports local and outside the repository with `--output-dir`.
Inspect tool results because an attempted invocation alone does not prove successful execution.

Report exact commands, results, and unverified behavior under the active role's evidence policy.
Claim model adherence only to the extent observed in behavioral evaluations.
Run formatting fixes only within the authorized change.

## Version And Publication

Follow [CONTRIBUTING.md](CONTRIBUTING.md) for commit bodies and issue and pull request templates.

Keep matching versions in the Codex, Claude, Cursor, and OpenPlugin manifests using the `yyyy.MM.dd.seq` scheme in `README.md`.
Keep root `plugin.json` absent so the reviewed Codex loader reaches its native hook configuration.
Keep each host's hook configuration explicit and omit conventionally discovered hook files to preserve manual activation in skills-only clients.
Include the matching plugin version bump in every plugin-source pull request.
Follow the release procedure in `README.md`.
Omit version fields from the marketplace and private package manifest.
Publish only to a user-authorized destination after inspecting the diff and required evidence.
Assess observed changes for current correctness, safety, and suitability without tracing authorship, origin, or history.
Adopt, repair, or reject them within authority while preserving unrelated changes.
Pause only affected operations for unmet acceptance, true security or authority boundaries, or actual conflicting writes.
Keep credentials, private environment details, and external work-item identifiers out of committed content.
Use repository-relative paths and portable examples.
