# Codex Execution Guidance

When only delegated results remain, call `wait_agent` with `timeout_ms: 240000`.
When waiting for a yielded `functions.exec` cell, call `functions.wait` with `yield_time_ms: 240000`.
