#!/bin/sh
set -eu
go tool -modfile=tools/go.mod golangci-lint run ./...
go tool -modfile=tools/go.mod shfmt -i 2 -d check.sh
