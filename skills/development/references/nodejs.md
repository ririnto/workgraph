# JavaScript and TypeScript

## Control flow and async calls

Remove unnecessary terminal `return undefined` statements when fallthrough preserves the return contract.
Keep required early exits and inferred or declared return types.
Preserve required exits, labels, `finally` behavior, loop effects, and async contracts.

Prefer appropriate `await` and error handling over using `void` solely to discard a call's return value.
This is guidance only, not a lint requirement or automatic rewrite.
Preserve callback contracts, async signatures, execution order, and intentional background work.
For intentional background work, preserve its existing error-handling policy without forcing callers to wait.

## Tooling

For authorized Node.js lint automation with Ultracite, prefer supported built-in Oxlint rules and Oxfmt formatting.
Invoke Oxlint and Oxfmt through Ultracite.
Preserve Ultracite defaults and existing ignore patterns when creating or explicitly changing configuration.
Preserve mandatory project extensions rather than replacing them with a minimal preset.
Check installed versions before adding custom rules or assuming a formatter can enforce a requirement.

## Dependency security

Assess advisories against the actual dependency path, execution environment, attacker-controlled inputs, and vulnerable APIs or options.
Include development, build, and CI execution rather than treating the development-dependency label as proof of safety.
Prefer a compatible patched version when available.
A development-only transitive advisory need not block delivery when source and configuration evidence establish that its exploit conditions are not reachable in the intended execution paths and required gates pass.
Record the advisory, dependency path, reachability evidence, and remaining uncertainty in the existing task or PR.
Resolve reachable vulnerabilities and material uncertainty before adding the affected dependency.
Preserve audit findings, supported dependency ranges, required checks, and security controls rather than suppressing findings or weakening gates to proceed.
