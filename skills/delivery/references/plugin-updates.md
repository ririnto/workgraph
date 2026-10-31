# Plugin update guidance

Use this reference when the task authorizes an installed plugin update.

After merge and base update, update the authorized marketplace and installed plugin for the requested hosts.
Refresh all configured marketplaces when the user requests that broader update.

Run only the requested hosts' supported update commands.
For other hosts, use their supported plugin update mechanism and report a limitation when unavailable.

After the update, start a new session or use the host's plugin reload so later sessions load the updated files.

## Claude Code

Run `claude plugin marketplace update <marketplace>`.

Then run `claude plugin update <plugin>@<marketplace>`.

## Codex

Run `codex plugin marketplace upgrade <marketplace>`.

Then run `codex plugin add <plugin>@<marketplace>`.
