: << 'CMDBLOCK'
@echo off
REM Cross-platform polyglot wrapper for hook scripts.
REM On Windows, cmd.exe finds and calls Bash.
REM On Unix, the shell interprets this block as a no-op.

if "%~1"=="" (
    echo run-hook.cmd: missing script name >&2
    exit /b 2
)

set "HOOK_DIR=%~dp0"

if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)
if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    "C:\Program Files (x86)\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

where bash >nul 2>nul
if %ERRORLEVEL% equ 0 (
    bash "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

echo run-hook.cmd: Bash was not found >&2
exit /b 1
CMDBLOCK

# Unix: run the named script directly.
if [ "$#" -lt 1 ] || [ -z "$1" ]; then
  printf '%s\n' 'run-hook.cmd: missing script name' >&2
  exit 2
fi
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
script_name=$1
shift
exec sh "$script_dir/$script_name" "$@"
