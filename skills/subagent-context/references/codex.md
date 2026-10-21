# Codex Execution Guidance

For required native result collection, use blocking `wait_agent` with `timeout_ms: 270000`, not progress polling.
For required yielded `functions.exec` results, use blocking `functions.wait` with `yield_time_ms: 270000`, not progress polling.

Before retiring sessions, worktrees, recovery copies, caches, or Worktree Artifact connections, read Codex Scoped Cleanup.
Skip this read when its complete content is already loaded.
