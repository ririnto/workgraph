// Package comments registers a syntax-only golangci-lint module plugin.
package comments

import (
	"go/ast"
	"regexp"

	"github.com/golangci/plugin-module-register/register"
	"golang.org/x/tools/go/analysis"
)

func init() {
	register.Plugin("comments", newPlugin)
}

type plugin struct{}

func newPlugin(any) (register.LinterPlugin, error) {
	return plugin{}, nil
}

func (plugin) BuildAnalyzers() ([]*analysis.Analyzer, error) {
	return []*analysis.Analyzer{{
		Name: "comments",
		Doc:  "reports loose comments in function bodies",
		Run:  run,
	}}, nil
}

func (plugin) GetLoadMode() string {
	return register.LoadModeSyntax
}

// These forms are consumed by Go, existing lint tools, or legal tooling.
var reserved = regexp.MustCompile(`^(?://(?:go:generate[ \t]|line[ \t]|nolint(?:[: \t]|$)|lint:(?:ignore|file-ignore)[ \t])|/\*line[ \t]|(?://|/\*)[ \t\r\n*!]*(?i:SPDX-(?:License-Identifier|FileCopyrightText):|copyright\b[ \t]*:?[ \t]*(?:[0-9]{4}\b|©|\(c\))|©))`)

type commentBoundaries struct {
	docs   map[*ast.CommentGroup]bool
	bodies []*ast.BlockStmt
}

func collectCommentBoundaries(file *ast.File) commentBoundaries {
	var bodies []*ast.BlockStmt
	docs := make(map[*ast.CommentGroup]bool)
	ast.Inspect(file, func(node ast.Node) bool {
		var body *ast.BlockStmt
		switch node := node.(type) {
		case *ast.FuncDecl:
			body = node.Body
		case *ast.FuncLit:
			body = node.Body
		case *ast.GenDecl:
			docs[node.Doc] = true
		case *ast.TypeSpec:
			docs[node.Doc] = true
		case *ast.ValueSpec:
			docs[node.Doc] = true
		case *ast.Field:
			docs[node.Doc] = true
		}
		if body != nil && (len(bodies) == 0 || bodies[len(bodies)-1].End() < body.Pos()) {
			bodies = append(bodies, body)
		}
		return true
	})
	return commentBoundaries{bodies: bodies, docs: docs}
}

func run(pass *analysis.Pass) (any, error) {
	for _, file := range pass.Files {
		boundaries := collectCommentBoundaries(file)
		bodies := boundaries.bodies
		for _, group := range file.Comments {
			if boundaries.docs[group] {
				continue
			}
			for _, comment := range group.List {
				for len(bodies) > 0 && bodies[0].End() < comment.Pos() {
					bodies = bodies[1:]
				}
				if len(bodies) > 0 && bodies[0].Lbrace < comment.Pos() &&
					comment.End() <= bodies[0].Rbrace && !reserved.MatchString(comment.Text) {
					pass.Report(analysis.Diagnostic{
						Pos:     comment.Pos(),
						End:     comment.End(),
						Message: "Remove dead code and workaround notes. Fix the underlying code or document the contract at its declaration.",
					})
				}
			}
		}
	}
	return nil, nil
}
