---
name: principle-preserve-behavior
description: Use when inlining values, restructuring control flow, or changing an expression's form where observable behavior must survive.
---

# Preserve Behavior

Inline variables used only once and keep single-use logic inline, subject to configured lint.
Preserve behavior, evaluation order, side effects, resource lifetime, exceptions, lazy execution, and required production interfaces.
Also preserve cost, inferred types, overload selection, and captured snapshots.
Do not suppress, weaken, or reconfigure lint to enable inlining.

Prefer condition inversion to reduce mid-function `return`, `continue`, or `break` statements when equivalent behavior stays intact without deeper nesting.
Treat this preference as guidance only, without a lint rule or autofix.
Lint rules and formatter output take precedence.
Preserve evaluation order, side effects, cost, cancellation, cleanup, and security or admission conditions.
Keep natural final returns and required failure propagation.

Choose a supported parser or literal operation only when behavior remains equivalent.
Preserve match selection, optional groups, flags, Unicode, iteration, offsets, replacement semantics, failure behavior, and resource cleanup.
