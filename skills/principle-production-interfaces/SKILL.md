---
name: principle-production-interfaces
description: Use when adding helpers or abstractions, changing production code for tests, or deciding what tests may observe.
---

# Production interfaces

Avoid unnecessary helpers, abstractions, and custom configuration layers.
Base production abstractions on real production requirements rather than hypothetical reuse.
Adapt tests to production interfaces and behavior.
Avoid exposing internals or adding public test hooks without a product need.
