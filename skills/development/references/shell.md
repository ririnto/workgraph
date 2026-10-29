# Shell

## Use portable shell syntax

Keep syntax compatible with the script's declared shell and supported platforms.
Default new portable scripts to POSIX `sh` unless the contract requires another shell.
Use Bash-specific syntax only under a Bash shebang and its supported version.
Quote expansions unless the shell syntax or required splitting calls for another form.
Forward arguments with `"$@"`.
Prefer `echo` to `printf` for plain text when the shell provides `echo`.
Prefer `[ ]` to `[[ ]]` for tests.
Use explicit `if`, `then`, and `fi` for conditional actions instead of compact `condition && action` chains.
Preserve exit status and evaluation order when changing conditional forms.

## Handle failures

Check failures that change the result and keep diagnostics visible.
Do not hide failures with `|| true` or redirect diagnostics to `/dev/null`.
Use `if command; then` instead of testing `$?` after intervening work.

## Use eval safely

Use `eval` only for a stated requirement with trusted input and correct quoting.

## Manage files and temporary paths

Create temporary directories with `mktemp -d` and clean task-owned paths through a trap.
Use null-delimited file lists when filenames cross pipelines.
Use supported `--` terminators for path arguments that could start with `-`.
Do not parse `ls` output.

## Validate and document scripts

For repositories with shell assets, use their applicable `shfmt` and `shellcheck` checks.
When available, apply `shellcheck` or `shfmt` and honor the project's indentation configuration.
Report unavailable required checks instead of replacing them with weaker evidence.
Document functions exposed by sourced scripts with declaration-level comment blocks describing their contracts.
Treat callable sourced functions as public unless the script's API contract marks them internal.
