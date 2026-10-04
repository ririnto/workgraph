# Go

Wrap errors with `%w` when callers must inspect the chain.
Return errors and log them at the boundary where handling ends.
Name error variables `err`, check them after calls, and do not discard them with `_`.
Keep sentinel errors at package scope with `ErrXxx` names and error types with `XxxError` names.
Pass `context.Context` first in request-scoped functions instead of storing it in structs.
Let finite goroutines finish by returning from their functions.
Give long-running or coordinated goroutines a shutdown path through cancellation, channel closure, or a joined `WaitGroup`.
Synchronize shared memory between goroutines.
Define interfaces at consumption sites, accept interfaces, and return concrete types.
Use pointer receivers for mutation or shared identity and value receivers for small independent structs.
Use `any`, `slices`, and `maps` only when the declared Go version supports them.
Use `strings.Builder` for repeated concatenation in loops.
Pre-size maps and slices when required hot-path performance justifies it.
Sort map keys when iteration order is observable.
Start exported declaration comments with the identifier's name.
State each package's responsibility in its package comment.
Use table-driven subtests for pure logic when they fit the behavior under test.
Use `t.Parallel()` for independent cases whose setup and shared resources permit it.
