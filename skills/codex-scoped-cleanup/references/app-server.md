# App-Server Lifecycle

## Verify The Server And Transport

Inspect available native tools and prefer an existing client connected to the owning server.
Check `codex --version`, `codex app-server --help`, and supported daemon version reporting before selecting commands.
When available, use `codex app-server daemon version` to distinguish the CLI from the running daemon.
Generate schemas with the running server's matching executable, rather than assuming the CLI version matches.
Use `app-server generate-json-schema --experimental --out <temporary-directory>` through that verified executable.
Check method registration, parameters, backend support, and effects before mutation.
Schema presence establishes request shape, not preservation, ownership, or deletion effects.
Reference source from another version does not establish the installed server's exact behavior.
Preserve resources when the installed effects cannot be verified.

Prefer a supported control proxy when the owning daemon exposes one.
In the inspected implementation, `codex app-server proxy` forwards raw bytes to the running daemon's control socket.
Its control socket requires a WebSocket upgrade and framed messages, rather than newline-delimited stdio JSON.
Use a maintained WebSocket client or existing host client for that transport.
Follow the installed initialization schema, await `initialize`, and send `initialized` before requests.
Enable `capabilities.experimentalApi` only when required by the selected methods.
Do not enable unrelated connection-wide capabilities during cleanup.

A standalone `codex app-server --listen stdio://` owns separate in-memory thread and worker state.
Do not use its empty loaded-thread inventory as evidence that the shared daemon has no active writers.
Use standalone servers only for isolated synthetic checks or a separately verified, exclusively owned store.
Close owned clients and proxy processes without stopping the shared daemon.
Do not create a permanent polling service or scheduler for cleanup.

## Inventory The Exact Scope

Paginate native `thread/list` separately with `archived:false` and `archived:true` for the authorized scope.
Pass each opaque `nextCursor` unchanged until a successful response returns no continuation.
Continue after an empty page when it still has a cursor.
Keep filters and sort settings unchanged across pages, and reject repeated cursors or failed pages as incomplete inventory.
Record coverage and deduplicate by exact Thread ID without treating titles as identities.

Check the installed provider and source defaults before claiming complete coverage.
In the inspected schema, `modelProviders:[]` includes all providers, while empty `sourceKinds` defaults to interactive sources.
Select every relevant supported source kind explicitly when internal or spawned threads are in scope.
Omit optional project and section filters for all-project coverage because explicit `null` selects unassigned resources.
Remove unrelated search and working-directory filters from an exhaustive scoped inventory.
Use `useStateDbOnly:true` for non-repairing inventory when supported, and treat database errors as incomplete coverage.
Do not bypass missing native coverage with raw-state mutation.

For descendant inventory, use a supported `ancestorThreadId` query separately for active and archived descendants.
Do not combine `parentThreadId` and `ancestorThreadId` when the schema makes them mutually exclusive.
In the inspected relation query, omit `sourceKinds` and `modelProviders` to retain unrestricted relation defaults.
Remove other narrowing filters and include the ancestor separately because that query excludes it.
The inspected relation query includes persisted descendants without user messages, unlike the global listing.
Verify that behavior against the installed version before relying on it.
Its persisted graph can omit ephemeral children or failed spawn-edge writes.
Resolve live-child ownership separately because parent removal can also discover in-memory descendants.

Use metadata reads and supported paginated turn and item history to establish completion and continuation requirements.
An idle, unloaded, archived, or old Thread can still contain unfinished work.
Inventory affected spawned descendants before archive or delete because parent operations can affect their subtree.
Verify whether the installed descendant listing includes threads without their own user messages.
Do not claim exhaustive subtree coverage from an interactive listing or incomplete descendant filter.
Preserve the parent when any descendant is protected or the complete affected subtree cannot be established.

Refresh `thread/loaded/list` on the owning daemon when supported, following its pagination.
Loaded status describes runtime presence rather than task completion or exclusive writer ownership.
Attachment owner lookup identifies resource membership rather than runtime writer ownership.
Check native owner guards, current turns, running descendants, pending operations, and external process consumers.
Refresh the exact affected identities and ownership immediately before mutation.
Serialize lifecycle writes for each selected resource and stop on unexplained concurrent changes.

## Choose The Operation

The following methods appear in the inspected daemon schema, but each operation still requires installed-effect verification.

| Method | Boundary |
| --- | --- |
| `thread/archive` | Archive persisted conversation state and verify the affected subtree before invocation. |
| `thread/unarchive` | Restore archived conversation availability when the installed backend supports it. |
| `thread/delete` | Permanently remove persisted conversation data within explicit authority for every affected descendant. |
| `thread/attachment/remove` | Remove one connection without assuming its referenced resource was physically deleted. |

Archive retains recoverable conversation state in the inspected Local implementation.
Permanent deletion removes persisted history and thread records, including attachment membership, in that implementation.
Deletion is not unarchive and provides no native recovery guarantee after success.
Do not claim that conversation deletion removes attached worktree files, GitHub objects, or Cloud filesystem data.
Preserve required source, completion evidence, contracts, associations, and recovery assets before deleting their native container.
Check fork-history references and other consumers instead of assuming attachments are the only retained dependencies.

Treat archive and delete as potentially disruptive even before persistent state changes.
The inspected implementation can shut down ordinary loaded runtimes while preparing the root and descendants.
A later protected worker can reject after earlier runtimes were already torn down.
Live internal worker removal requires its owner's lifecycle path in that implementation.
Respect owner and active-writer errors instead of retrying through another server or killing the worker.
Do not treat `thread/unsubscribe` as a general writer-release method because it detaches the calling connection's subscription.
Require a verified owner-controlled release path before retrying a writer conflict.
If the supported method or authorized owner path is unavailable, report archived-only, unsupported, or blocked status as applicable.

## Reconcile And Recover

Record a private temporary receipt containing exact identities, selected operation, before-state, preservation references, and protected resources.
On interruption, timeout, or error, read the affected state before retrying.
Check every descendant because subtree preparation and file deletion can leave partial effects.
Separate runtime teardown, archive moves, persistent deletion, attachment changes, and physical checkout state in the receipt.
Do not assume an error or absent notification means nothing changed.
Do not replay confirmed successful operations.
Retry only remaining authorized work after changed evidence, with a bounded exit condition.

For archive, confirm selected identities leave the active inventory and appear in the archived inventory.
Use `thread/unarchive` only for authorized recovery supported by the installed backend.
For delete, check exact metadata reads and fresh active and archived inventories for every affected identity.
Distinguish a verified not-found response from transport, permission, or database failure.
Confirm protected resources and preserved associations remain accessible after each batch.
Report permanent deletion as irreversible unless a specific supported recovery path was verified before deletion.

For worktrees, use the installed archive and restore tool contracts rather than conversation archive methods.
Native worktree archival can retain a Git snapshot while removing the physical checkout.
Preserve required ignored files separately when the archive tool excludes them.
Restore can recreate a detached checkout with formerly uncommitted changes included in a snapshot commit.
Verify the restored content and association instead of promising the original staging state.
Remove temporary receipts and clients only after verification and any required recovery complete.
