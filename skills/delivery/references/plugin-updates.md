# Plugin update guidance

Use this reference when the task authorizes an installed plugin update.

Once the requested version is available from the authorized distribution source, update the marketplace and installed plugin for the requested hosts.
Any needed source merge follows Delivery's merge-authority rule before distribution.
Refresh all configured marketplaces when the user requests that broader update.

Run only the requested hosts' supported update commands.
For other hosts, use their supported plugin update mechanism and report a limitation when unavailable.

After the update, start a new session or use the host's plugin reload so later sessions load the updated files.

## Claude Code

Run `claude plugin marketplace update <marketplace>`.

Then run `claude plugin update <plugin>@<marketplace>`.

## Codex

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
