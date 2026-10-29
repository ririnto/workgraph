---
name: fix-queue-delivery
description: "Use for an authorized bounded issue queue in one repository, excluding cross-project scheduling."
---

# Fix-queue delivery

## Outcome and authority

Deliver the assigned repository queue without weakening acceptance for a deadline.
This skill grants no source, Git, host-control, tracker, or integration authority.
Use the assignment's queue bounds, acceptance, concurrency, resource ownership, and publication limits.
Do not create a scheduler or infer new work from available capacity.

## Accountable roles

| Role | Responsibility |
| --- | --- |
| Queue Main | Selects issues, assigns bounded units, and receives results. |
| Issue owner | Writes the assigned source, runs checks, pushes its branch, and opens its own PR. |
| Integration owner | Serializes shared merges, refreshes affected evidence after collisions, and confirms acceptance before issue closure. |

One agent may hold compatible roles.
Queue Main follows [Main Agent Contract](../main-agent-contract/SKILL.md) for generic coordination, evidence freshness, and ownership return.

Use [Delivery](../delivery/SKILL.md) for repository eligibility, publication, independent review, integration, and cleanup unless fully loaded.
Use [Verification](../verification/SKILL.md) for acceptance evidence unless fully loaded.
These bundled procedures govern each issue owner and the integration owner within their assigned authority.

## Triage and assign

Read the authorized queue through the assigned tracker client.
Prioritize correctness and safety impact within the assignment's scope.
Check existing issues and PRs before assigning work, and avoid duplicate fixes.
Map children to umbrellas when the umbrella defines a coherent actionable unit.
Retain each issue's original acceptance and exclusions in its assignment.
Record an umbrella's own acceptance separately from its children's delivery state.

Skip ownership-blocked items, name the conflicting resource and next owner, and continue independent ready work.
Use only the concurrency granted by the assignment and existing coordination.
Give each issue owner an isolated workspace and branch for one issue or a small coherent batch.
Use an isolation method supported by the assignment and host.
Keep branches separate.
Name the source, Git, integration, evidence, and cleanup owners in each assignment.
Include the required bundled procedures by their resolved installed absolute paths.

Each issue owner completes the assigned checks and publication through Delivery, then returns its PR and evidence to Queue Main.
Use nonclosing issue references until acceptance confirmation so merging cannot close an issue before verification.
Return blockers, uncovered acceptance, and resource ownership with the result.

## Integrate serially

The integration owner accepts each complete posted PR's independent review and relevant passing checks before merging.
Merge one PR at a time through the normal protected integration path.
Let the issue owner update its branch unless ownership has explicitly transferred.

After a collision, compare the affected changes with the current authorized base branch.
Have the responsible owner resolve conflicts without force-pushing or rewriting shared history.
Refresh affected checks, acceptance evidence, and review coverage before the next dependent merge.

## Confirm acceptance before closure

For each issue, the integration owner confirms both the merged PR and its acceptance on the authorized base branch.
Inspect the relevant base-branch source or run the narrowest required behavioral check against the original acceptance.
A ref readback alone establishes no fix behavior or acceptance.
Record the inspected source or behavioral result, its target, and any unmet criteria.
Keep the issue open when acceptance is unmet or unverified, even when its PR merged.
Close it only after confirming the original acceptance, then read back the tracker state.

Check an umbrella against its own original acceptance before closing it.
Child merges and child closures alone do not prove umbrella completion.
Keep remaining criteria and their next owners visible without blocking unrelated accepted fixes.

## Preserve delivery boundaries

Do not push protected branches, force-push, delete writer locks, or bypass hooks and guards.
Keep lint, security checks, assertions, and protection conditions intact.
Add comments only for a non-obvious reason the code cannot show.
Keep unmerged PRs open at a deadline and report their next action without weakening acceptance.

## Hand back

Return merged issues and PRs, original-acceptance checks, base-branch readbacks, and confirmed closure states.
Report umbrella acceptance separately, along with blocked items, their owners, and the remaining queue count.
Report any incomplete delivery.
