# Claude Code Execution Guidance

Run native-session waits with Bash `run_in_background: true`, never foreground timeout renewals.
Use `timeout: 270000` unless another duration is needed.
Consider available `Monitor` for command output or external events that require action.
