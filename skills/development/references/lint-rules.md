# Lint rule guidance

Choose tools compatible with the project's language, runtime, and supported versions.
Make valid use the default through API and module design first.
Prefer built-in rules and supported configuration for remaining mechanical checks.
Add a custom rule when it prevents a recurring violation the existing checks miss.
Scope the check to the syntax and paths that express the requirement.
Include a diagnostic that names the violated boundary and how to fix the cause.
Once the check prevents new violations, migrate existing occurrences within scope and remove the obsolete path.

## Adopt a lint asset

Copy the selected assets into the consuming repository and retain the [MIT license notice](../../../LICENSE).
Register local files by paths relative to the consumer's own configuration.
Update copies through that project's normal review.
Merge the supplied rule settings with the project's existing checks and formatter.
Run the consumer's normal lint command on representative matching and non-matching cases.
Use the project's own tool dependencies and versions.

### Oxlint

Copy [comments.ts](../assets/lint/comments.ts) as `lint/comments.ts`.
Register `./lint/comments.ts` in `jsPlugins` and enable `comments/no-body-comments` in the appropriate file overrides.
Add `@oxlint/plugins` as a development dependency if the consumer type-checks the asset.
For matching and exceptions, see [JavaScript](javascript.md#javascript-body-comments) and [TypeScript](typescript.md#body-comments).
For restricted React effects and timers, use the [product override](react-electron.md#react-effects) where the project has a named integration owner.

### ktlint

Copy the [ktlint editor settings](../assets/lint/kotlin.editorconfig) into the project's `.editorconfig` under `[*.{kt,kts}]`.
Copy the [ruleset module](../assets/lint/ktlint-comments/build.gradle.kts) into the consuming repository with its source and the [service provider entry](../assets/lint/ktlint-comments/src/main/resources/META-INF/services/com.pinterest.ktlint.cli.ruleset.core.api.RuleSetProviderV3).
Use the module's Kotlin catalog or merge its plugin declaration into the consumer's existing catalog.
Build it with the consumer's Gradle installation and pass the selected ktlint runtime version as `-PktlintVersion`.
For example, run `gradle -p lint/ktlint-comments -PktlintVersion=<ktlint-version> jar`.
The module uses compile-only ktlint dependencies so the runtime owns those libraries.
Load the JAR through the project's ktlint Gradle integration or `ktlint --ruleset=lint/ktlint-comments/build/libs/workgraph-ktlint-comments.jar '**/*.kt' '**/*.kts'`.
No rule is installed by Workgraph.
See [Kotlin lint](kotlin.md#kotlin-body-comments) for the match boundaries.

### golangci-lint

Merge the [golangci-lint v2 config](../assets/lint/golangci-lint.yaml) into the project's own `.golangci.yaml`.
The Go package loader selects `.go` source under the requested modules and active build tags.
Copy [the build config](../assets/lint/custom-gcl.yml) to `.custom-gcl.yml` and the [plugin module](../assets/lint/go-comments/go.mod) to `lint/go-comments/` with its source and sums.
Use the golangci-lint version in the build config and an appropriate Go toolchain.
Run `golangci-lint custom` from the consumer root and use `./custom-gcl run --config .golangci.yaml ./...` for the adopted checks.
Keep built-in defaults and consumer settings enabled when registering the module plugin.
Rebuild and verify the plugin when upgrading the toolchain or linter.
See [Go lint](go.md#go-dead-paths-and-comments) for the check boundaries and examples.

### markdownlint-cli2

Copy [markdown-comments.ts](../assets/lint/markdown-comments.ts) as `lint/markdown-comments.ts`.
Merge the [Markdown config](../assets/lint/markdownlint-cli2.jsonc) into the consumer's `.markdownlint-cli2.jsonc`.
Keep the consumer's `**/*.md` paths and existing ignores.
Load the TypeScript rule with a Node runtime that supports type stripping and a compatible local `markdownlint-cli2`.
See [Markdown lint](markdown.md) for the check boundaries.

## Validate lint rules

Run read-only lint on small matching cases and realistic preserved cases.
For a scoped boundary, prove the prohibited use fails inside it and the authorized use passes from the allowed entry.
Offer automatic fixes only when evaluation, side effects, and program behavior remain unchanged.
Verify formatter idempotence and convergence between rule fixes and formatting.
Preserve required checks and directives during rollout.
The comment rules recognize leading SPDX identifiers, the `©` symbol, and `Copyright` followed by a year, `©`, or `(c)`.
Review whether a remaining explanation documents a needed contract or excuses a workaround.
Leave behavioral and intent checks with their [verification owner](runtime-formal-evidence.md).
