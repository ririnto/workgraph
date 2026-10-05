---
name: codex-scoped-cleanup
description: Use in Codex when retiring sessions, worktrees, recovery copies, caches, or stale Worktree Artifact connections.
---

# Codex Scoped Cleanup

Apply this procedure only in Codex and within the current cleanup authority.

## Git Preservation

Default to removing completed, unused resources when retained Git history preserves every required source change.
Verify reachability from a retained branch, tag, or snapshot ref without pinning file or branch hashes.
A merged PR establishes preservation of its merged source changes.
Do not rely solely on dangling objects, expiring reflogs, or an unspecified remote copy.
Compare staged, unstaged, untracked, and required ignored content before removing a physical checkout.
Preserve unique source, configuration, runtime storage, and database data outside Git.
Preserve resources required for current work or continuation, even when their source is committed.
Remove redundant recovery copies without creating another complete backup.

## Scoped Activity

Evaluate each session or worktree independently.
The parent project's recent activity does not prove that a particular worktree remains in use.
Use three days of inactivity for requested session cleanup unless the user supplies another window.
Include session events, compressed rollouts, running descendants, and exact worktree consumers when checking activity.
Exclude the current session and running work.
Completed, unused Git-backed worktrees and recovery copies need no additional age delay.
Preserve primary, shared, and pinned checkouts during generic task cleanup.

## Worktrees And Caches

Prefer native worktree lifecycle tools or Git's worktree commands over deleting checkout directories directly.
Refresh ownership and working-tree state before removal.
Do not force removal to bypass unique dirty or untracked content.
Check exact process arguments, working directories, open handles, and active containers for the selected scope.
Remove only isolated, unused, reproducible cache or build leaves.
Preserve active shared caches and dependencies needed by current executions.
Before deleting a quarantined cache, verify its inode, owner, and device.
Adjust owned directory permissions only within the selected cache.
Removing a child also requires write permission on its parent.
Preserve hard-linked file contents and permissions shared with other checkouts.

## Thread Worktree Artifacts

Before changing Worktree Artifact connections, read [Native Attachment Cleanup](references/native-attachments.md) unless already loaded completely.
Treat physical checkout deletion and Thread attachment removal as separate operations.
Use native archiving for physical retirement that requires retained recovery state.
Use attachment removal for verified stale connections.
Remove dangling active connections after verifying their paths are absent and their payloads contain no recovery state.
Remove archived connections only after verifying preserved required content and no continued-use requirement.
An archived checkout's absence alone does not establish that its connection is obsolete.
Do not use the owning Thread's activity as a substitute for worktree-specific evidence.

## Acceptance

Verify removed connections through a fresh native listing and confirm protected connections remain.
Check that selected paths and temporary quarantine directories are absent after physical cleanup.
Remove temporary schemas, payload copies, scripts, logs, and task-owned server processes after verification.
Report attachment counts separately from physical disk-space changes.
Use measured volume availability rather than summing directory allocation as reclaimed space.
