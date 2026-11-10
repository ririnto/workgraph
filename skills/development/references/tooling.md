# Development tooling

Read the shared guidance and the section for the language being configured or assessed.

## Shared lint guidance

For authorized lint setup, select tools compatible with the project's language, runtime, and requirements.

When lint automation is authorized, prefer built-in rules and supported configuration before custom rules.
Use existing standard tools for other languages.
Add a custom rule only for a demonstrated recurring failure that existing tools cannot prevent.
Verify tool-version support and realistic exceptions before adding it.
Scope rules through existing file or module boundaries when those boundaries carry the requirement.
Make rules AST-aware and preserve literals, comments, and automatic semicolon insertion where applicable.

### Validate lint rules

Use small positive and negative fixtures for intended matches and realistic exceptions.
Reuse adopted rule coverage instead of retesting the tool's implementation.
Offer automatic fixes only when evaluation, side effects, and program behavior remain unchanged.
Verify formatter idempotence and convergence between rule fixes and formatting.
Stage separately authorized rules on representative source before enabling them across the project.
Start with read-only checks and review their reports before any safe-fix rollout.
Do not add suppressions, disable rules, or weaken checks to make a rollout pass.

If a rule cannot detect violations safely, do not add it.
If only its automatic fix is unsafe, omit the fix and retain only a proven safe diagnostic.
Validate scheduling, control flow, and lifecycle effects before offering automatic fixes that change them.

## Go

### Workspaces and tool dependencies

Use `go.work` when repository modules need workspace coordination and the declared Go version supports it.
Keep adopted Go tools and their versions in a repository-owned `go.mod` or dedicated modfile.
Workspace coordination does not replace module ownership of tool dependencies.
Manage and run tools using their owning module.
Use an explicit `-modfile=<file>.mod` only outside workspace mode.

For Go 1.24 or later, use `go get -tool <tool-package>@<version>` to record tool dependencies in the module file.
Run them with `go tool <tool-package>`.
For earlier declared versions, retain tool dependencies through blank imports in a build-constrained `tools.go` file.
Use build constraints supported by the declared Go version.
Run those tools with `go run <tool-package>` without a version suffix to use the module's dependency requirements.
See the official [tool dependency guidance](https://go.dev/doc/modules/managing-dependencies#tools) and [workspace reference](https://go.dev/ref/mod#workspaces).

### Linting

When the repository already uses golangci-lint or the user authorizes adopting it, use golangci-lint for Go linting.

When using tool directives or `tools.go` for golangci-lint, isolate it in a dedicated repository-owned module or modfile.
For `tools.go`, use the isolated tool module to keep its imports out of application `go mod tidy`.
Keep its dependency graph separate from application modules and other tools.
Use `GOWORK=off` for isolated resolution or builds when an enclosing workspace would change dependency selection or conflict with `-modfile`.
Keep that override scoped to the tool build, and run lint analysis with the application's required workspace configuration.
Do not treat workspace membership alone as a defect when the selected installation supports it and preserves the required dependency versions.
Do not upgrade golangci-lint's dependencies independently.
See golangci-lint's [source-install guidance](https://golangci-lint.run/docs/welcome/install/local/#install-from-sources) for the limitations of module-based installation.

Prefer built-in linters before custom extensions.
Use its module plugin system for custom linters because golangci-lint recommends it over Go plugins.

Separately from tool dependency management, check whether golangci-lint's build Go version supports the project's Go version.
Check custom-linter API compatibility with the selected golangci-lint version.
Cover intended reports and non-reports with meaningful custom-linter tests.
Offer automatic fixes only when tests verify behavior preservation.
Preserve independently required security and semantic checks.

## Java

Preserve existing Java tooling, including Spotless with Palantir Java Format and Checkstyle when selected.
Map Kotlin rules only where Java syntax and the selected tool provide a safe equivalent.
Keep Kotlin-only constructs and Java's unsupported trailing commas out of Java rule translations.
Check formatter, checker, build-tool, and lint-runtime compatibility separately from the compilation target.

Review multiline Javadoc, meaningful documentation, and method-body spacing beyond the selected tools' proven coverage.
Do not treat lexical logging patterns as semantic checks because text blocks and shadowed names can produce false positives.
Keep import conversion and control-flow changes under semantic review instead of promising syntax-only automatic fixes.

## Kotlin

For authorized Kotlin lint automation, prefer ktlint built-in rules.
For that automation, use ktlint's supported custom-rule API when built-ins cannot express a safe requirement.
Verify compatibility with the project's ktlint version before implementing custom rules or fixes.
Check Kotlin, Gradle, JVM, ktlint engine, and plugin compatibility together before selecting versions.
Stay within Kotlin's officially supported Gradle range even when a newer stable Gradle release exists.
Attach custom rulesets to the consumer's actual ktlint runtime instead of relying on `buildSrc` visibility.
Verify native consumer lint reports a disposable violation before accepting a ruleset integration.

Restrict syntax-only import rules to type references and leave expression receiver chains unchanged.
Verify resolution beyond the current file before accepting import fixes from rules without compiler symbol information.

## JavaScript and TypeScript

For authorized Node.js lint automation with Ultracite, prefer supported built-in Oxlint rules and Oxfmt formatting.
Invoke Oxlint and Oxfmt through Ultracite.
Preserve Ultracite defaults and existing ignore patterns when creating or explicitly changing configuration.
Preserve mandatory project extensions rather than replacing them with a minimal preset.
Check installed versions before adding custom rules or assuming a formatter can enforce a requirement.
Do not add dependencies with known vulnerabilities.

## Rust

### Configure formatting and linting

For authorized setup, use the repository's Rust toolchain with its `rustfmt` and Clippy components.
Keep formatter settings in the existing `rustfmt.toml` or `.rustfmt.toml`.
For an unconfigured project, start with stable defaults and a 100-column width:

```toml
max_width = 100
```

Run `cargo fmt` to select editions from Cargo manifests.
Check optional formatting settings against the selected rustfmt version before adding them.
Use module-level import grouping, lowercase hexadecimal digits, and readable macro patterns in review where the formatter cannot enforce them.
Do not switch toolchains solely to enable an unavailable formatting option.

Use the existing Clippy lint set, adding individual rules for a demonstrated requirement.
Do not enable the entire `clippy::restriction` group because its rules can conflict.
Keep human review for ownership, API semantics, and unsafe invariants that lints cannot establish.

### Verify Cargo projects

Run existing repository checks first.
When establishing checks for an ordinary Cargo workspace, start with:

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

Keep warning enforcement compatible with the selected Cargo version and existing CI.
Select packages, targets, and feature combinations from the supported build matrix.
Use `--all-features` only when all features are designed to work together.
Keep documentation tests in the test scope.
If the test command selects `--all-targets`, run `cargo test --workspace --doc` separately for library documentation examples.
Preserve the repository's lockfile policy and use `--locked` where checks require its recorded resolution.
