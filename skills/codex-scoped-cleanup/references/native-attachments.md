# Native Attachment Cleanup

## Choose The Interface

Inspect the installed Codex tools before choosing the removal interface.
Read [App-Server Lifecycle](app-server.md) before choosing a native connection unless already loaded completely.
Some public `remove_artifact` tools support only `pull_request` connections.
When Worktree removal is unavailable there, use the installed app-server's verified native attachment API.
Verify removal's effects on connections, checkout files, Git refs, and archive contents against the installed implementation before mutation.
Preserve required recovery state when those effects remain uncertain.

## List And Remove

List every relevant Thread's connections with `thread/attachment/list`.
Follow `nextCursor` until all pages are read.
Filter exact `worktree` and `archived_worktree` types.
Do not assume that a public listing for the current Thread covers other Threads.
When supported, paginate `thread/attachmentOwner/list` by exact attachment type and identity key to inspect every owner.
Its archive filter and coverage belong to the configured store, not every host or Cloud filesystem.
The inspected owner lookup includes Threads without their own user messages.
Without that method, prove complete owner coverage through another supported inventory or preserve the connection.

Example listing parameters:

```json
{"threadId":"<thread-id>","limit":100}
```

Remove a selected connection with `thread/attachment/remove`.
Use the listing's exact Thread ID, attachment type, and identity key.

```json
{"threadId":"<thread-id>","attachmentType":"worktree","identityKey":"<exact-identity-key>"}
```

Use `archived_worktree` for a selected archived connection.
Leave independently attached PR connections intact.
Connection removal does not delete the referenced checkout or rewrite conversation history in the inspected Local implementation.

## Guards And Recovery

Capture the selected identity tuple, attachment ID, and complete payload before mutation.
Refresh the native row and filesystem paths immediately before removal.
Use `lexists` or `lstat` so a dangling symlink does not count as an absent checkout.
Skip recreated checkouts, changed payloads, or pending create and restore operations.
Inspect every owner when multiple Threads reference the same worktree.
An absent active path with a path-only payload is a dangling connection, independent of its creation age.
An absent archived path can still represent valuable recovery state.
Confirm Git preservation and continued-use status before removing an archived connection.
Keep any necessary reattach payload temporary until removal verification succeeds.
Use a verified native attach or restore path for authorized recovery rather than writing raw attachment rows.

Use native mutation methods rather than editing authoritative SQLite tables.
Read-only database inspection can corroborate native results when needed.
After removal, list again and verify selected tuples are absent and protected tuples remain unchanged.
Check partial effects after an error and retry only with changed evidence and a bounded stopping condition.
If the installed API cannot remove the selected type, report the exact remaining connections and limitation.
