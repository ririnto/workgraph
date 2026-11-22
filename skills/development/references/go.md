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

For a standalone example, copy the [application module](../assets/golang/example/go.mod), [source](../assets/golang/example/status.go), and [check script](../assets/golang/example/check.sh) to the consumer root.
Copy the [tool module](../assets/golang/example/tools/go.mod) and [checksums](../assets/golang/example/tools/go.sum) into `tools/`.
Copy the [dead-path configuration](../assets/golang/dead-paths/.golangci.yaml) to `.golangci.yaml`.
Run `./check.sh` locally and in CI from the consumer root.
The script uses the pinned golangci-lint and shfmt tools through [Go tool declarations](https://go.dev/ref/mod#go-mod-file-tool).
The tool modfile keeps the app's dependency selection separate.

For loose body comments, copy the [custom build configuration](../assets/golang/body-comments/.custom-gcl.yml) to the consumer root and copy the [module manifest](../assets/golang/go-comments/go.mod), [sums](../assets/golang/go-comments/go.sum), and [analyzer](../assets/golang/go-comments/comments.go) into `lint/go-comments/`.
Use the [comments configuration](../assets/golang/body-comments/.golangci.yaml) as `.golangci.yaml` to check that group independently.
To compose both groups or add one to an existing config, merge the selected `linters.enable` entries and `linters.settings` mappings with the consumer's settings.
Keep the built-in defaults, file selection, and existing security checks.
Build the custom binary with the pinned version in the build config and check the same module roots as CI.

```sh
go tool -modfile=tools/go.mod golangci-lint custom
./custom-gcl run --config .golangci.yaml ./...
go tool -modfile=tools/go.mod shfmt -i 2 -d check.sh
```

Rebuild and verify the custom binary when changing the Go toolchain or lint version.
Follow golangci-lint's [tool usage recommendations](https://golangci-lint.run/docs/welcome/install/local/#go-tool-usage-recommendations) when integrating it with an existing tools module.
