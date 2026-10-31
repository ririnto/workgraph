# Rust

## Inspect the project

Read the owning `Cargo.toml`, workspace configuration, `rust-toolchain.toml` or `rust-toolchain`, and existing Rust checks before changing source or tooling.
Check the declared edition, minimum supported Rust version, selected targets, and supported feature combinations.
Use the project's native build integration when it does not use Cargo.
Apply Chromium and Fuchsia build, concurrency, and library rules only within those codebases.

## Organize modules and imports

Name leaf modules after their primary type or responsibility.
Keep parent modules focused on declarations, re-exports, and small amounts of connecting code.
Use explicit imports by default, retaining scoped test, enum, and established prelude imports where they clarify the code.
Group imported items by their defining module.
Qualify external free functions with their module and import type names directly unless names conflict.
Keep trait imports local when only one function needs their methods.

## Manage ownership

Borrow values when functions need access without ownership transfer.
Return owned values from constructors and parsers, and retain ownership where the contract requires it.
Replace avoidable clones with borrows without changing lifetimes or required ownership.
Prefer unique ownership to `Rc` or `Arc` unless shared ownership makes the actual contract simpler.
Accept `&str`, `&[T]`, and `&T` when a borrowed string, sequence, or value suffices.
Use `Cow` only when a measured need justifies it.

## Handle errors

Use `Result` for recoverable failures and `Option` for absent values.
Reserve panics, `unwrap`, and `expect` for justified initialization or invariant failures.
Prefer `expect` with an invariant explanation when a panic is justified.
Propagate recoverable errors with `?` and preserve typed errors at module boundaries.
Do not discard errors through `let _ =` unless the operation permits a documented no-op.
Use `must_use` when ignoring a result would be a defect.

## Model state and interfaces

Add `mut` only where mutation occurs.
State the concurrency or shared-state need for interior mutability.
Model distinct domain states with data-carrying enums and exhaustive matches.
Avoid wildcard match arms when exhaustiveness checks can protect the contract.
Use named fields and domain enums when tuples or boolean parameters obscure meaning.
Use newtypes when distinct values need different semantics or type safety.
Use `impl Trait` for internal APIs when it expresses the needed contract.
Use generic trait bounds where public surfaces or implementation requirements need them.
Define traits for required polymorphism or extension methods rather than grouping unrelated methods.
Implement established standard traits and derive their implementations when appropriate.
Return iterators when callers benefit from deferred traversal, retaining owned collections when the implementation or consumers need them.

## Document public and unsafe contracts

Document effective public items and re-exports with `///` prose, including errors and panics where applicable.
Account for enclosing module visibility when identifying public items.
Use doc examples for non-trivial APIs and verify them with the existing Rust test setup.
Document the safety invariant of each `unsafe` block after checking for a safe alternative.
Keep unsafe operations narrowly scoped and document the caller's obligations on unsafe APIs.

## Configure formatting and linting

For authorized setup, use the repository's Rust toolchain with its `rustfmt` and Clippy components.
Keep formatter settings in the existing `rustfmt.toml` or `.rustfmt.toml`.
For an unconfigured project, start with stable defaults and a 100-column width:

```toml
max_width = 100
```

Run `cargo fmt` to select editions from Cargo manifests.
Check optional formatting settings against the selected rustfmt version before adding them.
Use module-level import grouping, lowercase hexadecimal digits, and readable macro patterns in review where the formatter cannot enforce them.
Do not switch toolchains solely to enable an unavailable formatting option.

Use the existing Clippy lint set, adding individual rules for a demonstrated requirement.
Do not enable the entire `clippy::restriction` group because its rules can conflict.
Keep human review for ownership, API semantics, and unsafe invariants that lints cannot establish.

## Verify Cargo projects

Run existing repository checks first.
When establishing checks for an ordinary Cargo workspace, start with:

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

Keep warning enforcement compatible with the selected Cargo version and existing CI.
Select packages, targets, and feature combinations from the supported build matrix.
Use `--all-features` only when all features are designed to work together.
Keep documentation tests in the test scope.
If the test command selects `--all-targets`, run `cargo test --workspace --doc` separately for library documentation examples.
Preserve the repository's lockfile policy and use `--locked` where checks require its recorded resolution.

## Bound recursion

Bound recursion on untrusted input or use iteration with an explicit stack.
