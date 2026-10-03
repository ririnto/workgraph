# Codex Execution Guidance

When only delegated results remain, prefer `wait_agent` with `timeout_ms: 240000`.
When waiting for a yielded `functions.exec` cell, prefer `yield_time_ms: 240000` in `functions.wait` calls.
