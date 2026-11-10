# Rust tooling

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
