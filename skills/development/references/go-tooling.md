# Go tooling

## Workspaces and tool dependencies

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

## Linting

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
