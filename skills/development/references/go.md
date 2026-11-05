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
Retain key or index iteration when the loop needs those values or must preserve its behavior.

Use `strings.Builder` for repeated concatenation in loops.
Pre-size maps and slices when required hot-path performance justifies it.
Sort map keys when iteration order is observable.

Use Go documentation comments for exported declarations, starting with the identifier's name.
State each package's responsibility in its package comment.

Use table-driven subtests for pure logic when they fit the behavior under test.
Use `t.Parallel()` for independent cases whose setup and shared resources permit it.

## Tooling

When configuring or assessing Go workspaces, tool dependencies, or lint tooling, read [Go tooling guidance](go-tooling.md) unless fully loaded.
