---
name: astra-dual-review
description: "Use for an explicit cross-host review and adjudication request, ending with verified issue handoffs before implementation."
---

# Astra Dual Review

## Outcome And Role

Manage one bounded dual-review assignment.
Obtain one native Codex pass and one native Claude pass over the same target.
Verify each candidate against source, requirements, or an authorized scoped check before issue registration.
Read back each issue write and return the verified result.
End this assignment before implementation.

This skill grants no source, Git, host-control, publication, or issue-write authority.
Use only the authority and resources named in the assignment.
Keep native host and model mechanics in this plugin's matching bundled host reference.

## Required Inputs

Confirm these inputs from the assignment before dispatch:

- The repository, named target, and comparison base when reviewing a diff.
- The intended behavior, acceptance, exclusions, and affected consumers.
- The permitted source reads and exact additional checks, or a no-additional-checks boundary.
- The reviewer host assignments and model, effort, and native-mode settings, including explicit use of configured settings.
- The manager's issue-registration authority, tracker, and permitted issue fields.
- The source, host-control, evidence, and cleanup owners.

Resolve missing observable facts through authorized reads.
Report missing authority or target boundaries without inventing them.
Continue independent permitted work while an affected action remains blocked.

## Load The Required Methods

Use [Development](../development/SKILL.md) for source-review criteria unless fully loaded.
Use [Verification](../verification/SKILL.md) for additional behavioral checks unless fully loaded.
In Claude Code, use the [Claude host reference](../main-agent-contract/references/claude.md) unless fully loaded.
In Codex, use the [Codex host reference](../main-agent-contract/references/codex.md) unless fully loaded.
Resolve required bundled skill paths at invocation and include them in each reviewer brief.
Keep all required instruction links inside this plugin.
Do not start another review workflow or expand the assignment to another capability.

## Establish One Review Target

Read the named target and relevant existing validation evidence.
Give both reviewers the same target, comparison, intent, acceptance, and exclusions.
Give both reviewers access to surrounding code and real affected consumers.
Keep stable target access under the current resource owner's contract.

Record the observed named references and reviewed scope.
Treat commit identifiers as evidence, without making them approval conditions.
If the target changes, compare the task-relevant change before accepting coverage.
Mark invalidated coverage as unverified.
Do not restart either completed pass to chase a moving target.
A new target requires a separate authorized unit.

## Dispatch Two Independent Passes

Start one fresh Codex reviewer through herdr agents and one fresh Claude reviewer.
Run them concurrently when both hosts and their required resources are available.
Keep one host-control owner per reviewer and verification session.
Do not expose one reviewer's candidates to the other before its pass ends.
Do not cancel a valid running review to replace it with a preferred configuration.

Preserve configured native models unless the administrator assigns an explicit override for this work.
Use an assigned override only through the supported host mechanism.
Record requested and host-exposed resolved settings without inventing reviewer identity.
Do not substitute one host for the other and claim cross-host coverage.
Do not invoke native review mode when the active program excludes it.

Each reviewer performs one read-only pass over the complete assigned target.
Review authority excludes source edits, Git writes, issue registration, and fix implementation.
Run only assigned checks for changed behavior, failures, or unresolved concerns.
Reuse existing passing evidence under unchanged relevant conditions.
Do not run broad suites, install dependencies, or mutate live services to expand review coverage.
Place permitted disposable check output in task-owned temporary locations.

Require each candidate to identify:

- The source location and concrete failure condition.
- The affected behavior or violated explicit requirement.
- The supporting source, consumer, or scoped-check evidence.
- The consequence and whether the target introduces or worsens the defect.
- The assumptions and remaining verification limits.

Require an explicit no-candidate result when the reviewer finds none.
Require separate reporting of source inspection, executed checks, reused evidence, failures, and unexecuted checks.
Each reviewer ends after returning its single-pass result and resource disposition.

## Verify Every Candidate Before Registration

Collect both complete reviewer results.
Keep missing or failed passes visible as incomplete coverage.
Do not treat model agreement as proof.

Assign separate verification agents to check candidates independently of their finders and source fixers.
As manager, inspect each candidate against the actual source and owning requirement.
Use the narrowest permitted existing check when source inspection cannot settle the claim.
Do not rely on the finding author's summary as verification.
Do not fix the code to prove the finding.

Keep the manager separate from the candidate finder and source fixer.
If the manager cannot supply independent verification, mark the candidate unverified.
Do not register it as a confirmed defect.

Merge duplicate candidates while retaining their evidence and origins in the private handback.
Assign each candidate one disposition:

- CONFIRMED requires a concrete defect and supporting independent evidence.
- REJECTED requires a source or requirement-based reason.
- DUPLICATE identifies the confirmed candidate or existing issue that covers it.
- UNVERIFIED names the missing evidence and next owner.

Separate introduced defects, worsened defects, and unrelated existing issues.
Preserve explicit accepted product decisions and required security boundaries.
Register an existing defect only when the assignment authorizes that scope.

## Register Confirmed Issues And Read Them Back

Register only manager-confirmed findings within the assigned issue-write authority.
Use the active program's authorized tracker client.
Search for an existing issue before creating one.
Reuse a matching issue instead of adding a duplicate.

Give each issue the concrete failure, source location, evidence, scope, acceptance, owner, and next action.
Use repository-relative locations in public text.
Exclude agent identities, private host details, credentials, raw logs, and local bindings.
Do not include unverified candidates as confirmed issue claims.

After each create or update, read the issue through the authenticated tracker.
Confirm the intended repository, issue identity, state, and task-relevant content.
A successful write acknowledgment alone does not complete registration.
Inspect partial effects before retrying an ambiguous response.
If readback fails, report registration as unverified and avoid a blind duplicate write.

Without issue-write authority, return the confirmed candidates for the authorized owner.
Do not infer filing authority from the review request.

## Hand Fixes To Separate Units

Return confirmed issue identities and their acceptance to the assigned resolution owner.
Do not implement fixes or create a task branch in this review unit.
Do not keep either original reviewer alive for a fix round.
Do not run an external review-until-clean loop.

Each resolution unit owns its source, scoped checks, independent delivery reviews, integration, and named-main readback.
Those delivery reviews do not resume this dual-review assignment.

## Completion And Handback

Return one consolidated final report with:

- The common target and each review pass's actual state and coverage.
- Candidate dispositions and the manager's verification evidence.
- Registered or reused issues and their readback results.
- Separate resolution handoffs, blockers, and missing coverage.
- Owned-resource returns, retained evidence, and cleanup limits.

Separate ACTUAL, REUSED, FAILED, BLOCKED, and NOTRUN evidence.
Claim completed dual coverage only after both single passes and candidate adjudication finish.
Claim completed registration only after every required issue readback succeeds.
Report a partial outcome when required coverage or filing remains unavailable.

Close only assigned finished review hosts after preserving required evidence and returning ownership.
Keep original reviewers stopped after handback.
Do not restart them after resolution.
