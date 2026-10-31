---
name: codex-scoped-cleanup
description: Use in Codex when archiving or deleting native threads, or retiring worktrees, recovery copies, caches, and stale connections.
---

# Codex scoped cleanup

Apply this procedure only in Codex and within the current cleanup authority.
Route cleanup through the authorized resource owner using supported host operations.

## Authority and native lifecycle

Record the selected resources, their owners, permitted operations, preservation requirements, and protected resources before cleanup.
Treat archive authority, permanent-delete authority, attachment retirement, and physical removal as separate scopes.
Require explicit human authority for permanent deletion of the exact affected scope.
Preserve any action-time confirmation required by the selected tool, even when broader cleanup is already authorized.
Do not infer Project, Session, or Chat deletion support from a Thread method.

Use supported owner-controlled operations rather than editing authoritative SQLite, rollout files, or raw host state.
Do not restart shared services or terminate unrelated workers to evade ownership guards.
Keep temporary private identities, paths, payloads, and logs out of published instructions and shared reports.

## Owner-mediated resource lifecycle

### Establish the owner path

Resolve the authorized resource owner through the available host's supported inventory and controls.
If an authorized owner path or supported operation is unavailable, preserve selected resources and report the exact limitation.
Do not infer ownership from a focused pane, resource membership, or an idle agent.

Give the owner the cleanup request and exact permitted scope through supported controls.
Include selected resources, protected resources, preservation requirements, affected descendants, and required readbacks.
Collect the owner's result and wait for existing requests through supported controls.
Prompt submission and settled agent state do not prove cleanup completion.
After a failed or timed-out request, inspect the owner's result and affected state before resubmitting.

Require the owner to verify the installed operation's support, permissions, affected resources, and preservation effects before mutation.
Request and result controls do not establish native archive, deletion, or attachment support.
Reference source from another version does not establish installed behavior.
Do not create a permanent polling service or scheduler for cleanup.

Historical transport research is non-operational and supplies no cleanup interface or fallback authority.

### Inventory the exact scope

Have the owner inventory active and archived resources within the authorized scope through supported operations.
Require complete pagination, unchanged filters, and exact identities rather than titles.
Pass opaque continuation values unchanged and continue after an empty page that still has a continuation.
Treat repeated continuations, failed pages, and unavailable coverage as incomplete inventory.
Check provider, source, project, and section defaults before claiming complete scope coverage.
Remove unrelated search or working-directory filters that would narrow the authorized inventory.

Require the owner to establish every affected descendant, including persisted descendants without user messages and live children.
Check whether supported listings omit ephemeral children or failed spawn relationships.
Include the parent separately when descendant listings exclude it.
Do not claim complete subtree coverage from an interactive listing or incomplete descendant filter.
Preserve the parent when a descendant is protected or the complete affected subtree cannot be established.

Use the owner's supported history and metadata reads to establish completion and continuation requirements.
An empty summary does not prove an empty or completed history.
An idle, unloaded, archived, or old Thread can still contain unfinished work.
Loaded status describes runtime presence rather than task completion or exclusive writer ownership.
Have the owner check current turns, running descendants, pending operations, ownership guards, and external process consumers.
Refresh exact affected identities and ownership immediately before mutation.
Serialize lifecycle writes for each selected resource and stop on unexplained concurrent changes.

### Choose the operation

Require a supported owner-controlled operation for each selected resource type.
Keep conversation archival, permanent deletion, attachment removal, and physical worktree retirement separate.
Verify recoverable conversation state before choosing archive.
Do not promise native recovery after permanent deletion.
Do not claim that conversation deletion removes checkout files, GitHub objects, or Cloud filesystem data.
Preserve required source, completion evidence, contracts, associations, and recovery assets before removing their container.
Check fork-history references and other consumers rather than treating attachments as the only retained dependencies.

Treat archive and delete as disruptive even before persistent state changes.
Preparation can stop earlier runtimes before a later protected descendant rejects removal.
Require the resource owner's supported release path for live workers and writer conflicts.
Respect owner and active-writer errors without switching control paths or killing workers.

For worktrees, have the owner verify the installed archive and restore contracts separately from conversation archival.
Have the authorized owner use supported archiving for physical retirement that requires retained recovery state.
Worktree archival can retain a Git snapshot while removing the physical checkout.
Preserve required ignored files separately when the supported archive operation excludes them.
Restore can recreate a detached checkout with formerly uncommitted changes included in a snapshot commit.
Verify restored content and associations rather than promising the original staging state.

### Reconcile and recover

Have the owner record a private temporary receipt before mutation.
Include exact identities, selected operations, before-state, preservation references, and protected resources.
After interruption, timeout, or error, require fresh affected-state readback before retrying.
Check every descendant because subtree preparation and file removal can leave partial effects.
Separate runtime teardown, archive moves, persistent deletion, attachment changes, and physical checkout state in the receipt.
Do not assume that an error or absent notification means nothing changed.
Do not replay confirmed successful operations.
Retry only remaining authorized work after changed evidence, with a bounded exit condition.

For archive, verify that every affected identity leaves active inventory and appears in archived inventory.
Compare complete fresh listings with the preserved preflight identities.
A root acknowledgement does not establish subtree completion.
Reconcile missing descendant outcomes even when the owner's operation reports success.
Use only a supported owner-controlled restore operation for authorized recovery.
For deletion, require exact identity reads and fresh active and archived inventories for every affected identity.
Distinguish verified absence from permission, connection, or storage failures.
Confirm that protected resources and preserved associations remain accessible after each batch.
Report permanent deletion as irreversible unless the owner verified a specific supported recovery path before deletion.
Remove temporary receipts only after verification and required recovery complete.

## Git preservation

Default to removing completed, unused resources when retained Git history preserves every required source change.
Verify reachability from a retained branch, tag, or snapshot ref.
A merged PR establishes preservation of its merged source changes.
Do not rely solely on dangling objects, expiring reflogs, or an unspecified remote copy.
Compare staged, unstaged, untracked, and required ignored content before removing a physical checkout.
Preserve unique source, configuration, runtime storage, and database data outside Git.
Preserve resources required for current work or continuation, even when their source is committed.
Remove redundant recovery copies without creating another complete backup.

## Scoped activity

Evaluate each session or worktree independently.
The parent project's recent activity does not prove that a particular worktree remains in use.
Do not use the owning Thread's activity as a substitute for worktree-specific evidence.
Use the requested inactivity window when inactivity defines the cleanup scope.
Retire verified completed, unnecessary resources within explicit authority without adding an age delay after completed handback.
Do not treat recent timestamps alone as proof that a resource remains needed or is eligible for retirement.
Include session events, compressed rollouts, running descendants, and exact worktree consumers when checking activity.
Exclude the current session and running work.
Read the latest request and result before treating an idle session as completed.
Preserve unfinished, blocked, recurring, and explicitly retained work, including its continuation and recovery assets.
Inspect affected descendants and every resource owner before changing a parent container.
Stop when scope, descendant coverage, ownership, or preservation remains uncertain.
Preserve primary, shared, and pinned checkouts during generic task cleanup.

## Worktrees and caches

Have the authorized owner use supported worktree lifecycle tools or Git's worktree commands rather than direct directory deletion.
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

## Acceptance

Obtain the owner's fresh lifecycle, attachment, and filesystem readbacks as separate evidence.
Check that selected paths and temporary quarantine directories are absent after physical cleanup.
Have the owner remove temporary payload copies, scripts, logs, and task-owned processes after verification.
Report attachment counts separately from physical disk-space changes.
Use measured volume availability rather than summing directory allocation as reclaimed space.
Report source checks, owner-mediated readbacks, actual mutations, and model adherence as distinct evidence.
Do not require production deletion to validate cleanup instructions.
