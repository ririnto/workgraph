# React and Electron boundaries

## React effects

Keep `useEffect` out of product modules when the project adopts an integration boundary for external synchronization.
Derive data during render, handle user actions in their event handlers, and use `useSyncExternalStore` with a real unsubscribe function for external stores.
Put remaining synchronization behind the integration API that owns setup, cleanup, and retries.
Verify resubscription, stale results, unmount cleanup, and duplicate execution as applicable.

For ESM product code with the automatic JSX runtime, merge the override from the local [Oxlint template](../assets/nodejs/react/oxlint.config.ts) into the consumer's config.
The override uses `eslint/no-restricted-imports` to reject named `useEffect` imports and default and namespace React imports that expose it.
Use named imports for other React APIs and types.
Use the project's React Hooks lint, such as `eslint-plugin-react-hooks`, in integration modules that own effects.
Use resolver checks or the project's import policy for wrappers, CommonJS loading, computed loads, and other indirect access.
Verify that product imports cannot reach a raw effect through the integration API.

In `src/product/panel.tsx`, `import { useEffect as sync } from "react"` and `import * as React from "react"` fail the import check.
`import { useState } from "react"` passes in that file.
A direct effect import passes this override in an approved `src/integrations/store.ts` entry.

## Scheduled work

Move work out of timers used to coordinate state across React renders.
Use the event or completion signal that owns the transition, or expose a scheduler through the integration that owns the deadline or frame.
Keep real delays, polling, frame work, or idle work behind that API.
For server state already managed by TanStack Query, use `refetchInterval` when periodic refetching is required.
Use `AbortSignal.timeout` for supported request deadlines and combine it with the owning cancellation signal when the request must stop on teardown.
Record the trigger and verify ordering, cancellation, teardown, and behavior under repeated starts.

The same Oxlint override uses `eslint/no-restricted-globals` for `setTimeout`, `setInterval`, `requestAnimationFrame`, and `requestIdleCallback`, including static access through `window`, `globalThis`, and `self`.
Apply it to the owned product source paths, including eligible JS and TS extensions.
Check destructuring, object aliases, computed names, and alternative schedulers in review or through project-specific checks.
Keep an exact list of permitted integration and scheduler entry files in the consumer's config or architecture record.
Cover all other product files with the check and verify one blocked product use and one allowed integration use.
Give each exception a named owner, a required external effect, and a teardown check.

In `src/product/panel.tsx`, `window.requestAnimationFrame(draw)` and `setTimeout(refresh, 250)` fail.
An event handler such as `onClick={refresh}` passes.
A direct browser timer passes this override in an approved `src/integrations/scheduler.ts` entry.

## Electron process imports

Place main and renderer code in separate directories and put shared contracts in a neutral directory.
Expose process capabilities via a narrow preload bridge and IPC.
Validate messages where they cross the boundary.
Keep blocking main-process work out of the renderer and verify the affected user interaction through its normal entry point.

Copy the [dependency-cruiser template](../assets/nodejs/electron/.dependency-cruiser.json) into the consumer and merge its entries with existing rules.
Set the actual main and renderer roots, include both roots and shared modules in the scan, and configure the TypeScript or bundler resolver used by the project.
Install dependency-cruiser's supported TypeScript parser for TS sources and check the scan counts.
The rules reject resolved direct and transitive imports between `electron-renderer/` and `electron-main/`, including via shared barrels and type-only edges.
Use separate bridge and shared modules for permitted edges.
If preload must access a process-specific helper, record the exact allowed bridge entry and edge in the consumer's graph rules and test both that edge and a forbidden renderer edge.
Exercise a resolved alias and an allowed shared contract before relying on the graph.
Validate unresolved or computed loads and runtime IPC separately for the consumer's actual build.

From `electron-renderer/view.ts`, importing `../electron-main/store` fails, including when a shared barrel re-exports it.
Importing a process-neutral contract from `../shared/messages` passes.
