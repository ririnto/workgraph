# Loop control flow

Review guards that use `continue` in the middle of a loop.
Prefer inverting the condition or expressing it in the loop condition when this meets functional requirements and improves readability.
Check required side effects, iteration progress and termination, cleanup and `finally` behavior, and asynchronous flow.
Change evaluation order when the result still meets functional requirements.
Keep `continue` when an alternative would fail those requirements or make the code less clear.
