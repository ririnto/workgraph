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
Use an explicit `if ...; then` statement for shell validation and error-handling branches.
Do not express these branches as short-circuit command chains such as `[ "$fail" -eq 0 ] || exit 1`, `[ ... ] || { ...; }`, or `command && action`.
Conditional expressions inside an `if` condition remain valid.
Do not hide failures with `|| true`.
Do not use shell redirection to send stdout, stderr, or both to `/dev/null`, including `> /dev/null`, `2> /dev/null`, `&> /dev/null`, or `>/dev/null 2>&1`.
Preserve command errors and diagnostic output.
An explicit command option such as `curl -o /dev/null` is allowed when discarding the response body to retrieve only the HTTP status.
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
