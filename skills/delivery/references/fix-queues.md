# Deliver an assigned fix queue

Use the assigned queue bounds, concurrency, acceptance, ownership, and publication limits.
Check existing issues and PRs before assigning fixes, and prioritize correctness and safety within scope.
Map children to an umbrella when it defines a coherent actionable unit.
Use isolated workspaces and branches when concurrent assignments could conflict.
Name responsibility for source changes, publication, integration, evidence, and cleanup without requiring a different person for each role.
Use an isolation method supported by the host and assignment.
The issue owner runs checks, publishes its branch, opens its PR, and returns the result and evidence.
The integration owner applies Delivery's merge-authority rule, serializes authorized merges, and confirms acceptance before closure.
Preserve each issue's original acceptance and exclusions, including any umbrella's separate acceptance.
Skip ownership-blocked items and continue independent ready work within the assigned concurrency.
Use nonclosing issue references until acceptance is confirmed.
Serialize authorized merges and let the branch owner resolve collisions unless ownership transfers.
Refresh affected checks, acceptance evidence, and review coverage after collisions, while retaining unaffected valid evidence.
Confirm each issue's original acceptance on the authorized base before closing it, then read back the tracker state.
Inspect relevant base source or run the required behavioral check because a merge and ref readback alone do not establish acceptance.
Confirm an umbrella's own acceptance separately from its children.
Keep issues open when acceptance is unmet or unverified, and report remaining criteria and their next owners.
Report ready requests, merged items, acceptance evidence, closure states, blockers, owners, and remaining work.
