# Plugin update guidance

Use the update route for the user's requested destination once the version reaches its authorized source.
Follow Delivery's merge-authority rule if distribution requires a source merge.

## ChatGPT account plugin

Identify the existing plugin and its current release through the account's supported plugin tools.
Check whether its source is Git-managed or manually editable.
For a Git-managed plugin, follow its configured release process and read back the resulting revision.
For a manually editable plugin, compare its published files with the authorized source, preserving account-specific metadata, settings, and audience.
Update the existing plugin against the release you inspected, including explicit removal of superseded files when the update overlays the old package.
If the release changed, reconcile the new contents before retrying.
Read back the saved release, affected files, and removed paths.
Claim activation in a running client only when observed there.

## Marketplace installations

Update the requested marketplace and installed plugin with its supported controls.
Refresh all configured marketplaces only when requested.
Use the host's reload mechanism or a fresh session to verify activation when available.
For other hosts, use their supported update mechanism and report any missing capability that affects the requested result.

### Claude Code

Run `claude plugin marketplace update <marketplace>`.

Then run `claude plugin update <plugin>@<marketplace>`.

### Codex

Identify whether the configured marketplace uses a Git source or a local checkout, and record the installed plugin's version and enabled state.
For a Git marketplace, run `codex plugin marketplace upgrade <marketplace>`.
When the marketplace revision advances, this also refreshes its configured installed plugins while preserving their enabled state.

For a local marketplace, update the authorized checkout and refresh the installed copy through a supported client control.
Local installations use cached copies rather than live source files.
For an already-enabled plugin, `codex plugin add <plugin>@<marketplace>` reinstalls that copy.
This command enables the plugin, so use it for a disabled plugin only when the user authorizes enabling it.
If the available client cannot refresh a disabled local installation while preserving its state, report that limitation without changing the state.

Read back the installed version and enabled state after either path.
Check the installed files when an unchanged version cannot distinguish old and new content.
Opening the plugin browser alone does not establish that cached files refreshed.
For plugins with Codex hooks, follow [hook activation verification](../../../docs/harness/codex.md#confirm-hook-activation) after refreshing the installed copy.
Keep installation, current trust, and the observed lifecycle result distinct in the completion report.
