# Codex Execution Guidance

When only delegated results remain, prefer `wait_agent` with `timeout_ms: 240000`.
When waiting for a yielded `functions.exec` cell, prefer `yield_time_ms: 240000` in `functions.wait` calls.

Before retiring sessions, worktrees, recovery copies, caches, or Worktree Artifact connections, read [Codex Scoped Cleanup](../../codex-scoped-cleanup/SKILL.md).
Skip this read when its complete content is already loaded.
