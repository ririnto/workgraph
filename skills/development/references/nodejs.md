# JavaScript And TypeScript

## Control Flow And Async Calls

Remove unnecessary terminal `return undefined` statements when fallthrough preserves the return contract.
Keep required early exits and inferred or declared return types.
Preserve required exits, labels, `finally` behavior, loop effects, and async contracts.

Prefer appropriate `await` and error handling over using `void` solely to discard a call's return value.
This is guidance only, not a lint requirement or automatic rewrite.
Preserve callback contracts, async signatures, execution order, and intentional background work.
For intentional background work, preserve its existing error-handling policy without forcing callers to wait.
