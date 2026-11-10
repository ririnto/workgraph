# Shell

## Use portable shell syntax

Keep syntax compatible with the script's declared shell and supported platforms.
Default new portable scripts to POSIX `sh` unless the contract requires another shell.
Use Bash-specific syntax only under a Bash shebang and its supported version.
Quote expansions unless the shell syntax or required splitting calls for another form.
Forward arguments with `"$@"`.
Preserve exit status and evaluation order when changing conditional forms.

## Handle failures

Check failures that change the result and keep diagnostics visible.
Rely on the caller's existing failure propagation when it already preserves the required exit behavior.
Add shell error modes only where the command sequence needs them, rather than prepending them to every command.
Choose conditionals or command chains that preserve required exit status and evaluation order.
Do not hide required failures with `|| true` or discard diagnostics needed to understand them.
Discard output only when the command's contract does not require it.
Add output only when it supplies information the command's own diagnostics do not provide.
Use `if command; then` instead of testing `$?` after intervening work.

## Use eval safely

Use `eval` only for a stated requirement with trusted input and correct quoting.

## Manage files and temporary paths

Create temporary directories with `mktemp -d` and clean task-owned paths through a trap.
Use null-delimited file lists when filenames cross pipelines.
Use supported `--` terminators for path arguments that could start with `-`.
Do not parse `ls` output.

## Validate and document scripts

For shell assets, run applicable, available `shfmt` and `shellcheck` checks with the project's indentation settings.
Report unavailable required checks instead of replacing them with weaker evidence.
Document functions exposed by sourced scripts with declaration-level comment blocks describing their contracts.
Treat callable sourced functions as public unless the script's API contract marks them internal.
