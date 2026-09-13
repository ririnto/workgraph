# Repository Guidelines

Workgraph is a standalone Claude Code plugin and single-plugin marketplace.

## Project Structure

- `.claude-plugin/` owns the marketplace and plugin manifests.
  `plugin.json` is the only version owner.
- `hooks/` owns runtime hook configuration and context injection files.
- `skills/` owns the portable Agent Skills that define Workgraph behavior.
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

Run this command after plugin changes:

```sh
claude plugin validate ./
```

Run this command as the aggregated read-only lint gate (markdownlint-cli2 plus ultracite; neither task writes source changes):

```sh
npm run check
```

Run `npm run fix` only when the user approves source changes.

The development toolchain requires Node and npm.
It does not use bun.

Use focused direct hook smoke checks when available without adding dependencies.

## Boundaries

Do not add a second marketplace, host adapter, compatibility surface, package manager, or runtime dependency without an external requirement.
Do not add package manifests, lockfiles, scripts, release workflows, alternate harness manifests, tests, or evaluation trees without an external requirement.
The Main Agent owns the release decision and ungranted git work.
Subagents run git only under an explicit dispatch grant for verified work.
