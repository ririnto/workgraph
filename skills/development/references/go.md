# Go

Wrap errors with `%w` when callers must inspect the chain.
Return errors and log them at the boundary where handling ends.
Name error variables `err`, check them after calls, and do not discard them with `_`.
Keep sentinel errors at package scope with `ErrXxx` names and error types with `XxxError` names.

Pass `context.Context` first in request-scoped functions instead of storing it in structs.
Let finite goroutines finish by returning from their functions.
Stop long-running or coordinated goroutines with a cancellation or channel-closure signal.
Use a `sync.WaitGroup` only to wait for them after that signal lets them exit.
Synchronize shared memory between goroutines.

Define interfaces at consumption sites, accept interfaces, and return concrete types.
Use pointer receivers for mutation or shared identity and value receivers for small independent structs.
Use `any`, `slices`, and `maps` only when the declared Go version supports them.
Use `maps.Values` and `slices.Values` for value-only loops when Go 1.23 or later is declared.
Retain key or index iteration when the loop needs those values or must preserve its behavior.

Use `strings.Builder` for repeated concatenation in loops.
Pre-size maps and slices when required hot-path performance justifies it.
Sort map keys when iteration order is observable.

Use Go documentation comments for exported declarations, starting with the identifier's name.
State each package's responsibility in its package comment.

Use table-driven subtests for pure logic when they fit the behavior under test.
Use `t.Parallel()` for independent cases whose setup and shared resources permit it.

## Workspaces and tool dependencies

Use `go.work` to coordinate repository modules when the declared Go version supports workspaces.
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

Use the project's existing lint tools and authorized configuration.
Keep tooling dependencies isolated when they would otherwise alter application dependencies.
Check toolchain and custom-linter API compatibility before selecting versions.
Cover intended reports and non-reports with meaningful custom-linter tests.
Offer automatic fixes only when tests verify behavior preservation.
Preserve independently required security and semantic checks.
