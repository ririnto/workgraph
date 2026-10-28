---
name: principle-preserve-behavior
description: Use when inlining values, restructuring control flow, or changing an expression's form where observable behavior must survive.
---

# Preserve Behavior

Preserve behavior, evaluation order, side effects, resource lifetime, exceptions, lazy execution, and required production interfaces.
Also preserve cost, inferred types, overload selection, and captured snapshots.

Preserve evaluation order, side effects, cost, cancellation, cleanup, and security or admission conditions when restructuring control flow.
Keep required failure propagation.

Choose a supported parser or literal operation only when behavior remains equivalent.
Preserve match selection, optional groups, flags, Unicode, iteration, offsets, replacement semantics, failure behavior, and resource cleanup.
