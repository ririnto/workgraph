# Go

Wrap errors with `%w` when callers must inspect the chain.
Return errors and log them at the boundary where handling ends.
Name error variables `err` and check errors when failure can realistically affect the result.
Explicitly discard an error only when it cannot affect the result.
Keep sentinel errors at package scope with `ErrXxx` names and error types with `XxxError` names.

Pass `context.Context` first in request-scoped functions instead of storing it in structs.
Let finite goroutines finish by returning from their functions.
Stop long-running or coordinated goroutines with a cancellation or channel-closure signal.
Use a `sync.WaitGroup` only to wait for them after that signal lets them exit.
Synchronize shared memory between goroutines.

Define interfaces at consumption sites, accept interfaces, and return concrete types.
Use pointer receivers for mutation or shared identity and value receivers for small independent structs.
Use `any`, `slices`, and `maps` only when the declared Go version supports them.
When the declared Go version is 1.23 or later, use these functions to express what the loop iterates:

- Use `maps.Keys` when only map keys are needed.
- Use `maps.Values` when the map key is unused.
- Use `slices.Values` when the slice index is unused.

Preserve needed keys or indices and existing behavior when changing iteration.

Use `strings.Builder` for repeated concatenation in loops.
Pre-size maps and slices when required hot-path performance justifies it.
Sort map keys when iteration order is observable.

Use Go documentation comments for exported declarations, starting with the identifier's name.
State each package's responsibility in its package comment.

Use table-driven subtests for pure logic when they fit the behavior under test.
Use `t.Parallel()` for independent cases whose setup and shared resources permit it.

## Tooling

### Workspaces and tool dependencies

Use `go.work` when repository modules need workspace coordination and the declared Go version supports it.
Declare adopted tools and their versions in the Go project that uses them.
A workspace can make the declared tools available when a check runs from another module in that workspace.

For Go 1.24 or later, use `go get -tool <tool-package>@<version>` to record tool dependencies in the module file.
Run them with `go tool <tool-package>`.
For earlier declared versions, retain tool dependencies through blank imports in a build-constrained `tools.go` file.
Use build constraints supported by the declared Go version.
Run those tools with `go run <tool-package>` without a version suffix to use the module's dependency requirements.
See the official [tool dependency guidance](https://go.dev/doc/modules/managing-dependencies#tools) and [workspace reference](https://go.dev/ref/mod#workspaces).

### Linting

When the repository already uses golangci-lint or the user authorizes adopting it, use golangci-lint for Go linting.

Prefer built-in linters before custom extensions.
Use its module plugin system for custom linters because golangci-lint recommends it over Go plugins.

Separately from tool dependency management, check whether golangci-lint's build Go version supports the project's Go version.
Check custom-linter API compatibility with the selected golangci-lint version.
Cover intended reports and non-reports with meaningful custom-linter tests.
Offer automatic fixes only when tests verify behavior preservation.
Preserve independently required security and semantic checks.

#### Go dead paths and comments

When the project adopts the bundled lint checks, use the [Go lint examples](#adopt-go-checks).
Go's package loader uses build tags and module roots to select source.
Run required configurations when build tags change the files being checked.

The `comments` analyzer reports loose line and block comments inside Go functions and closures.
It preserves parser-attached declaration documentation, SPDX and copyright markers, and recognized directives such as `//go:generate`, `//line`, `/*line ...*/`, `//nolint`, and Staticcheck's `//lint:ignore` and `//lint:file-ignore`.
Preserve the directives' existing consumers and let the consumer's other lint rules check suppression policy.
The checks supply diagnostics without editing source.

The `gocritic` checks `commentedOutCode` and `commentedOutImport` look for disabled Go statements and imports.
They use recognition heuristics and can miss snippets.
The `unused` check finds unused symbols within its package analysis and treats exports as potentially used.
Confirm calls through reflection or external packages before removing declarations.

Matching code in `status.go` has an unused function and a commented-out statement.

```go
package status

func oldStatus() int {
    return 0
}

func Read() int {
    // return oldStatus()
    return 1
}
```

The same file passes these checks with an exported function and a declaration comment.

```go
package status

// Read returns the status used by the current protocol.
func Read() int {
    return 1
}
```

#### Adopt Go checks

Copy the directory containing the [lint config](../assets/golang/.golangci.yaml), [Go module](../assets/golang/go.mod), and [checksums](../assets/golang/go.sum).
The module declares the local golangci-lint command and shfmt.
The [command's plugin import](../assets/golang/cmd/golangci-lint/plugins.go) registers the bundled analyzer through golangci-lint's [manual module plugin procedure](https://golangci-lint.run/docs/plugins/module-plugins/#the-manual-way).
Run the commands from the copied module root to check the [example package](../assets/golang/example/status.go).

```sh
GOWORK=off go tool golangci-lint run --config .golangci.yaml ./example/...
GOWORK=off go tool shfmt -i 2 -d example/
```

In an existing project, merge the selected `linters.enable` entries and settings with the existing config.
To adopt only the dead-path checks, keep `gocritic` and `unused` and run the project's declared golangci-lint directly.
For body comments, copy the [analyzer source](../assets/golang/comments.go) into a package in the consumer's module.
Copy [the command](../assets/golang/cmd/golangci-lint/main.go) and [its plugin import](../assets/golang/cmd/golangci-lint/plugins.go) into `cmd/golangci-lint/` and update the blank import to the analyzer's new package path.
Keep the versions in the [asset module](../assets/golang/go.mod) if the consumer's graph permits them, then run `go get -tool ./cmd/golangci-lint` and `go mod tidy` from the consumer's module root.
Keep the consumer's file selection and other checks.
Use the same lint and read-only shfmt commands locally and in CI.
Run and verify the registered tool when changing the Go toolchain or lint version.
