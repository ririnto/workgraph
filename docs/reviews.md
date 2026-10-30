# Workgraph contributor reviews

This policy applies only to contributors reviewing Workgraph pull requests.

## Select useful review coverage

Choose review depth, staffing, timing, and tools from the change's risks and the user's explicit requirements.
Prefer independent review for substantial instruction, runtime, or packaging changes.
Add reviewers when their expertise addresses a concrete gap, rather than requiring a fixed reviewer count.
Run independent reviews concurrently when they are ready and their work does not conflict.
Reviews can precede or follow publication if they cover the complete candidate being delivered.
Give reviewers that candidate, acceptance criteria, affected consumers, and validation evidence.
Preserve required checks, repository protections, and explicit review requirements when adapting the process.

## Assign reviewer scope

Cover correctness, instruction ownership, portability, and safety where the change affects them.
Use host-specific review or execution evidence for changes whose behavior depends on that host.
Report native behavior as unverified when the required host evidence is unavailable.
Do not label a model alias in another host as a native Codex session.
Honor requested alternative review methods within these evidence and authority boundaries.

## Verify and record findings

Verify candidate findings against source, requirements, or checks before treating them as confirmed.
Use independent verification when a finding's uncertainty or impact warrants it, or the task explicitly requires it.
Record findings, dispositions, coverage limits, and actual review timing in the PR description, comment, or formal review.
Preserve completed valid reviews without claiming retroactive coverage or concurrency.
