# Shell

Keep syntax compatible with the script's declared shell and supported platforms.
Default new portable scripts to POSIX `sh` unless the contract requires another shell.
Use Bash-specific syntax only under a Bash shebang and its supported version.
Quote expansions unless the shell syntax or required splitting calls for another form.
Forward arguments with `"$@"`.
Use explicit `if`, `then`, and `fi` for conditional actions instead of compact `condition && action` chains.
Check failures that change the result and keep diagnostics visible.
Do not hide failures with `|| true` or redirect diagnostics to `/dev/null`.
Use `if command; then` instead of testing `$?` after intervening work.
Use `eval` only for a stated requirement with trusted input and correct quoting.
Create temporary directories with `mktemp -d` and clean task-owned paths through a trap.
Use null-delimited file lists when filenames cross pipelines.
Use supported `--` terminators for path arguments that could start with `-`.
Do not parse `ls` output.
For repositories with shell assets, use their applicable `shfmt` and `shellcheck` checks.
Report unavailable required checks instead of replacing them with weaker evidence.
