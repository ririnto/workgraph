# Repository Guidelines

Workgraph is a standalone Claude Code plugin and single-plugin marketplace.

## Project Structure

- `.claude-plugin/` owns the marketplace and plugin manifests. `plugin.json` is the only version owner.
- `hooks/` owns runtime hook configuration and context injection files.
- `skills/` owns the portable Agent Skills that define Workgraph behavior.
- `README.md` owns installation, use, and layout guidance.
- `LICENSE` owns the MIT license text.
- `THIRD_PARTY_NOTICES.md` owns attribution and pinned source metadata.
- `.gitignore` owns local cache and scratch exclusions.

Preserve these named top-level components and their responsibilities.
Adding, removing, or moving a top-level component requires updates to the architecture, consumers, and relevant documentation.

## Versioning

`.claude-plugin/plugin.json` is the only version owner.
Use the `yyyy.mm.dd.seq` format.
Do not add a second version source or a version to `marketplace.json`.

## Validation

Run this command after plugin changes:

```sh
claude plugin validate ./
```

Use focused direct hook smoke checks and Markdown lint when available without adding dependencies.

## Boundaries

Do not add a second marketplace, host adapter, compatibility surface, package manager, or runtime dependency without an external requirement.
Do not add package manifests, lockfiles, scripts, release workflows, alternate harness manifests, tests, or evaluation trees without an external requirement.
The root session owns git integration and publication. Subagents must not run git.
