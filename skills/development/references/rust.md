# Rust

Borrow values when functions need access without ownership transfer.
Return owned values from constructors and parsers, and retain ownership where the contract requires it.
Replace avoidable clones with borrows without changing lifetimes or required ownership.
Use `Cow` only when a measured need justifies it.
Use `Result` for recoverable failures and `Option` for absent values.
Reserve panics, `unwrap`, and `expect` for justified initialization or invariant failures.
Propagate recoverable errors with `?` and preserve typed errors at module boundaries.
Do not discard errors through `let _ =` unless the operation permits a documented no-op.
Use `must_use` when ignoring a result would be a defect.
Add `mut` only where mutation occurs.
State the concurrency or shared-state need for interior mutability.
Model distinct domain states with data-carrying enums and exhaustive matches.
Avoid wildcard match arms when exhaustiveness checks can protect the contract.
Use `impl Trait` for internal APIs when it expresses the needed contract.
Use generic trait bounds where public surfaces or implementation requirements need them.
Document public items with `///` prose, including errors and panics where applicable.
Use doc examples for non-trivial APIs and verify them with the existing Rust test setup.
Document the safety invariant of each `unsafe` block after checking for a safe alternative.
Bound recursion on untrusted input or use iteration with an explicit stack.
