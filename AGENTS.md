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
- `.markdownlint-cli2.jsonc` owns the Markdown lint configuration.
- `rules/` owns the `no-box-drawing` markdownlint custom rule.
- `package.json` and `package-lock.json` own the Markdown and Oxlint toolchain dependency pins.
  External requirement: the repo-wide lint baseline directive.
- `oxlint.config.ts` and `oxfmt.config.ts` own the ultracite Oxlint+Oxfmt provider configuration.

Preserve these named top-level components and their responsibilities.
Adding, removing, or moving a top-level component requires updates to the architecture, consumers, and relevant documentation.

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

Run this command as the aggregated lint gate (markdownlint-cli2 plus ultracite):

```sh
npm run check
```

The development toolchain requires Node and npm.
It does not use bun.

Use focused direct hook smoke checks when available without adding dependencies.

## Boundaries

Do not add a second marketplace, host adapter, compatibility surface, package manager, or runtime dependency without an external requirement.
Do not add package manifests, lockfiles, scripts, release workflows, alternate harness manifests, tests, or evaluation trees without an external requirement.
The Main Agent owns the release decision and ungranted git work.
Subagents run git only under an explicit dispatch grant for verified work.
