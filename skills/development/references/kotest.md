# Kotest

## Kotest specs

Share immutable fixtures only when reuse is required and sharing preserves behavior.
Keep per-test state local and preserve initialization order, parallel isolation, and captured values.
A `val` binding alone does not make its referenced object immutable or safe to share.
Expose injected dependencies through explicit parameters or appropriate extension functions.
Keep stateful fixtures scoped to their required lifecycle.

## Kotest assertions

Use soft assertions when the test requires aggregated failures rather than fail-fast behavior.
For soft assertions with a shared subject, use `assertSoftly(subject)`.
Use `assertSoftly { ... }` when the group has no common receiver.
Allow nested `assertSoftly` blocks when they clarify groups with different subjects.
Do not use `assertSoftly` for a single assertion or add nested single-assertion wrappers.
Use an existing infix assertion when its explicit receiver is natural and the API supports it.
For example, `collection shouldHaveSize 1` keeps an existing collection receiver explicit.
Inside `assertSoftly(subject)`, use implicit-receiver calls such as `shouldHaveSize(1)`.
Do not add helpers or explicit `this` receivers only to create infix syntax.
Soft assertions intentionally aggregate supported failures and do not preserve fail-fast behavior.
Keep prerequisite assertions outside a soft group when later checks depend on their success.
Use only assertions documented as compatible with the project's Kotest version.
Unsupported Kotest assertions and third-party assertions can fail immediately and prevent later checks from running.
Keep mock verification outside a soft group unless a compatible wrapper preserves its intended behavior.
Preserve receiver binding in nested groups and qualify a receiver only when needed to avoid shadowing.
Keep assertions that depend on coroutine work inside the group after that work completes.
Await structured child work in the surrounding coroutine scope.
Verify assertion-context propagation for the project's Kotest version when assertions cross coroutine dispatchers or context boundaries.
Inline single-use values, including an `assertSoftly` subject, only when readability, setup timing, effects, evaluation order, resource lifetime, mock verification order, and fixture isolation remain unchanged.
