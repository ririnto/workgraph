# Worktree and cache cleanup

## Archive and restore

Verify installed worktree archive/restore contracts separately from conversation archival.
Use supported owner archiving for physical retirement needing recovery state.
Archive can remove the checkout while retaining a Git snapshot.
Preserve required ignored files separately if excluded.
Restore may create a detached checkout with prior uncommitted changes in a snapshot commit.
Verify restored content and associations without promising original staging.

## Remove worktrees and caches

Use supported owner worktree tools or Git worktree commands, not direct directory deletion.
Do not force removal past unique dirty or untracked content.
Check exact scoped process arguments, working directories, open handles, and active containers.
Remove only isolated, unused, reproducible cache or build leaves.
Preserve active shared caches and dependencies needed by current executions.
Verify quarantined caches' inode, owner, and device before deletion.
Change owned directory permissions only within the selected cache.
Child removal also requires write permission on its parent.
Preserve hard-linked contents and permissions shared with other checkouts.

## Verify physical cleanup

Verify selected paths and quarantine directories are absent after physical cleanup.
