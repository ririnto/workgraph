# JavaScript And TypeScript

## Control Flow And Async Calls

Remove unnecessary terminal `return undefined` statements when fallthrough preserves the return contract.
Keep required early exits and inferred or declared return types.
Preserve required exits, labels, `finally` behavior, loop effects, and async contracts.

Prefer appropriate `await` and error handling over using `void` solely to discard a call's return value.
Preserve callback contracts, async signatures, execution order, and intentional background work.
For intentional background work, preserve its existing error-handling policy without forcing callers to wait.

## Automation

For authorized Node.js lint automation, prefer supported built-in Oxlint rules and Oxfmt formatting through Ultracite when the project uses it.
Keep a functioning direct Oxlint and Oxfmt stack when changing only the wrapper name would add no capability.
Check installed versions before adding custom rules or assuming a formatter can enforce a requirement.
Do not add dependencies with known vulnerabilities.
