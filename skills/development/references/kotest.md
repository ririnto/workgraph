# Kotest

## Kotest specs

Move reusable immutable declarations and functions from Spec superclass-constructor lambdas into a companion object when sharing preserves behavior.
Keep per-test state local and preserve initialization order, parallel isolation, and captured values.
A `val` binding alone does not make its referenced object immutable or safe to share.
Treat `RuleProvider` factories as potentially eager, and do not hoist them based only on syntax.
Expose injected dependencies through explicit parameters or appropriate extension functions.
Keep stateful rule instances scoped to their required lifecycle instead of sharing them unconditionally.

## Kotest assertions

Use `assertSoftly(subject)` for consecutive assertions that share a subject, including service objects.
Use `assertSoftly { ... }` for consecutive independent assertions without a common receiver.
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
Inline a single-use test value only when construction timing, side effects, readability, resource lifetime, and fixture isolation remain unchanged.
Inline a service used only as the `assertSoftly` subject when its construction or expression can move safely.
Preserve setup timing, evaluation order, resource lifetime, mock verification order, and fixture isolation.
