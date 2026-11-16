# Loop control flow

Review guards that use `continue` in the middle of a loop.
Prefer inverting the condition or expressing it in the loop condition when this preserves semantics and improves readability.
Preserve evaluation order and count, side effects, iteration progress and termination, cleanup and `finally` behavior, and asynchronous flow.
Keep `continue` when an alternative would change behavior or make the code less clear.
