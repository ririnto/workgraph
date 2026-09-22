# Repository Guidelines

Workgraph is a standalone Claude Code plugin and single-plugin marketplace.

## Task Guidance

Follow explicit user instructions over repository defaults and skills, within host and safety constraints.
Read only instructions and references relevant to the affected paths and requested outcome.
Keep one plan in the existing task context or the user's designated location.
Define completion and required evidence before editing; continue authorized work until completion or a concrete blocker.
Use direct execution for small or tightly coupled work and honor requests to work without delegation.
Use Agent or the available native Workflow tool when authorized delegation improves the outcome.
Keep graph planning proportional: identify dependencies, owned resources, evidence, and termination without adding a graph runtime.
Use English for inter-agent prompts, messages, steering, and results; user-facing explanations follow the requested language.
For any pending background tool, including Bash, continue independent work or end the turn and resume on native completion.
Do not fill the wait with repeated thinking, status messages, polling, or tool calls.

## Project Structure

- `.claude-plugin/` owns the marketplace and plugin manifests.
  `plugin.json` is the only version owner.
- `hooks/` owns runtime hook configuration and context injection.
- `skills/` owns the portable Agent Skills that define Workgraph behavior, including the injected bounded-node contract.
- `README.md` owns installation, use, and layout guidance.
- `LICENSE` owns the MIT license text.
- `THIRD_PARTY_NOTICES.md` owns attribution and pinned source metadata.
- `.gitignore` owns local cache and scratch exclusions.
- `.github/dependabot.yaml` owns the weekly npm dependency update schedule.
  It groups coupled updates, ignores semver-major updates, and ignores 0.x semver-minor updates so a 0.x minor needs a reviewed manifest and lockfile change.
- `.markdownlint-cli2.jsonc` owns the Markdown lint configuration.
- `rules/` owns the `no-box-drawing` markdownlint custom rule.
- `package.json` and `package-lock.json` own the Markdown and Oxlint toolchain dependency pins.
  External requirement: the repo-wide lint baseline directive.
- `oxlint.config.ts` and `oxfmt.config.ts` own the ultracite Oxlint+Oxfmt provider configuration.

Preserve these named top-level components and their responsibilities.
Adding, removing, or moving a top-level component requires updates to the architecture, consumers, and relevant documentation.

## Code Style

Common rules apply to every language in this repository.
Language-specific rules apply to their language only and live under their language heading.
Write instruction and guidance content in concise English.

Remove blank lines inside function bodies.
Blank lines between declarations and lint-required spacing stay.
Inline a single-use local only when evaluation order, evaluation count, exception timing, mutable snapshots, and closure capture are preserved.
Explanations live in documentation comments on declarations, never as inline comments inside function bodies.
Document every externally exposed declaration.

### TypeScript And JavaScript

Prefer `const` for bindings that do not need reassignment.
Prefer a function reference over a pass-through lambda when behavior and binding are identical.
Use no named capture group when `match[0]` reads the same value.
Use no trailing comma in TypeScript.

### YAML

Use the `.yaml` extension for every maintained YAML file unless the consuming host or tool requires `.yml` (for example `.gitlab-ci.yml` at a GitLab repository root).
Write sequences in block style.
Keep a flow sequence only for an explicit empty sequence (`key: []`), because block style cannot express an empty sequence without turning it into null.

## Versioning

`.claude-plugin/plugin.json` is the only version owner.
Use the `yyyy.mm.dd.seq` format.
Do not add a second version source.
Do not add a version to `marketplace.json`.

## Validation

- Run `claude plugin validate ./` after plugin changes.
- Use `npm run check` as the read-only lint gate for Markdown and ultracite.
- When hooks or injected contracts change, run the affected hook routes directly and inspect their emitted context.
- Reuse passing evidence for unchanged inputs, configuration, and toolchain; a new commit hash alone does not invalidate it.
- Run only affected checks; broaden or repeat them for changes, failures, or unresolved concerns.
- Do not add tests that merely repeat low-impact prose or configuration changes.
- Run `npm run fix` only when source changes are authorized.

Use Node and npm for the development toolchain, not bun.
`package.json` defines the supported development Node version.

## Boundaries

Do not add a second marketplace, host adapter, compatibility surface, package manager, or runtime dependency without an external requirement.
Do not add package manifests, lockfiles, scripts, release workflows, alternate harness manifests, tests, or evaluation trees without an external requirement.
Do not commit work-item identifiers, review-system URLs, or private local environment details.
Use repository-relative paths and portable examples in committed guidance and reports.
Use branch names as the reference for work tracking, handoffs, and tracking content.
Do not base tracking documents or links on fixed commit, file, or content hashes.
The Main Agent owns the plan and integration and publication decisions, whether execution is direct or delegated.
Delegated Git mutations require an explicit grant naming operations, refs, ownership, and required pre-action evidence.
Direct Git mutations require user authorization and the same scope and evidence checks.
Passed permissions cannot increase authority.
Preserve unrelated work and stop unexplained changes rather than overwrite them.
