# Plugin Update Guidance

Use this reference when the delivery project manages a host plugin.
After the plugin's merge and base update, update the local marketplace and installed plugin.
Run `claude plugin marketplace update`, `codex plugin marketplace upgrade`, `claude plugin update <plugin>@<marketplace>`, and `codex plugin add <plugin>@<marketplace>`.
Start a new session or run the host's plugin reload so later sessions load the updated files.
