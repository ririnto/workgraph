# Go dead paths and comments

Use the [local golangci-lint setup](lint-rules.md#golangci-lint).
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
