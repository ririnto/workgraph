# Native attachment cleanup

## Confirm supported removal

Use the owner path established by [Codex Scoped Cleanup](../SKILL.md#establish-the-owner-path).
Require the authorized resource owner to establish supported removal for the selected connection type.
A tool that removes only PR connections does not establish Worktree connection removal support.
Have the owner verify effects on connections, checkout files, Git refs, and archive contents before mutation.
Preserve required recovery state when those effects remain uncertain.

## List and remove

Have the owner list every relevant Thread's connections through supported operations and read every page.
Select exact active or archived worktree connection types and identities from that inventory.
Do not treat a current-Thread listing as coverage of other Threads.
Require complete owner coverage for the selected connection, including Threads without their own user messages.
Verify listing coverage for the configured store without assuming other hosts or Cloud filesystems are included.
Preserve the connection when supported inventory cannot establish every owner.

Have the owner remove only the selected connection through a supported operation for its exact type and identity.
Leave independently attached PR connections intact.
Do not infer physical checkout deletion or conversation-history changes from connection removal.

## Guards and recovery

Have the owner capture the selected identity tuple, attachment ID, and complete payload before mutation.
Refresh the supported connection listing and filesystem paths immediately before removal.
Use `lexists` or `lstat` so a dangling symlink does not count as an absent checkout.
Skip recreated checkouts, changed payloads, or pending create and restore operations.
Inspect every owner when multiple Threads reference the same worktree.
An absent active path with a path-only payload is a dangling connection, independent of its creation age.
Remove it only after verifying that the payload contains no recovery state.
An absent archived path can still represent valuable recovery state.
Confirm Git preservation, other required retained content, and no continued-use requirement before removing an archived connection.
Keep any necessary reattach payload temporary until removal verification succeeds.
Have the owner use a verified supported attach or restore operation for authorized recovery.

After removal, obtain a fresh supported owner listing.
Verify that selected tuples are absent and protected tuples remain unchanged.
Check partial effects after an error and retry only with changed evidence and a bounded stopping condition.
If removal is unsupported, report the exact remaining connections and limitation.
