---
name: verification
description: Use when running an application, reproducing reported behavior, or gathering acceptance evidence.
---

# Verification

## Select Evidence

Confirm the target, trigger, input, and observable expected outcome before checking behavior.
Use existing run, test, and diagnostic commands before creating temporary helpers.
Preserve the project's execution and import boundaries when selecting how to run checks.
Give each shared-state write an owner, and serialize checks that could conflict.
Choose behavior-specific tests that exercise the changed path and expected result.
Run the application or command when integration, state, or external behavior matters.
Collect actual traces, screenshots, results, or timings when tests do not show the outcome.
Capture the command, relevant setup, exit status, and raw result separately from interpretation.
Linter success alone cannot establish product behavior or performance.
For performance claims, record timings or profiler output with the execution conditions.
Treat formal proof, native activation, and model adherence as unverified without direct evidence.

## Reproduce Reports

Recreate the reported trigger with the narrowest safe existing command.
Compare observed behavior with the stated expectation, not a presumed fix.
Keep useful negative outcomes such as failures, timeouts, and unexpected output.
Use supported entry points when normal execution is the behavior under verification.
Create or update a focused feature map when repeated vague reports or navigation needs warrant one.
Keep the map beside the project's verification instructions.
Record each affected feature's purpose, access path or command, expected outcome, execution owner, source, and relevant validation.
Update only affected entries and avoid a redundant repository inventory.
