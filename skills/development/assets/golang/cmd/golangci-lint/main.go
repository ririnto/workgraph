// Package main builds golangci-lint with the bundled comments analyzer.
package main

import (
	"log"
	"os"
	"runtime"

	"github.com/golangci/golangci-lint/v2/pkg/commands"
	"github.com/golangci/golangci-lint/v2/pkg/exitcodes"
)

func main() {
	err := commands.Execute(commands.BuildInfo{GoVersion: runtime.Version()})
	if err != nil {
		log.New(os.Stderr, "", 0).Print(err)
		os.Exit(exitcodes.Failure)
	}
}
