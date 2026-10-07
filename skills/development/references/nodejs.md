# JavaScript And TypeScript

## Control Flow And Async Calls

Remove unnecessary terminal `return undefined` statements when fallthrough preserves the return contract.
Keep required early exits and inferred or declared return types.
Invert conditions around `return`, `continue`, or `break` only when the result is simpler and preserves control flow.
Prefer appropriate `await` and error handling over using `void` solely to discard a call's return value.
Preserve callback contracts, async signatures, execution order, and intentional background work.
For intentional background work, preserve its existing error-handling policy without forcing callers to wait.

## Automation

For authorized Node.js lint automation, prefer Ultracite's supported Oxlint and Oxfmt rules and configuration.
Check the installed versions' capabilities before adding custom rules or assuming a formatter can enforce a requirement.
