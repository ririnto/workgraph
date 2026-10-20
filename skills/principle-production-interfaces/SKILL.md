---
name: principle-production-interfaces
description: Use when adding helpers or abstractions, changing production code for tests, or deciding what tests may observe.
---

# Production Interfaces

Avoid unnecessary helpers, abstractions, and custom configuration layers.
Do not extract or retain helpers for hypothetical future reuse or test convenience.
Test references do not establish production reuse.
Never change production code to accommodate tests, expose internals, add test hooks, or manufacture test seams.
Adapt tests to production interfaces and behavior.
Production changes must serve a real product requirement or fix an actual defect.
