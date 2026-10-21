# Workgraph Contributor Reviews

This policy applies only to contributors reviewing Workgraph pull requests.

Workgraph PR owners run complete posted-candidate reviews with Claude-hosted `pstack:comment-sicko`, `pstack:poteto-agent`, and a native Codex reviewer.
Run these reviews concurrently after publication.
Require Poteto to read its complete mode skill before review.
Give every reviewer the complete current PR, acceptance criteria, affected consumers, and validation evidence.

Keep Claude reviewers on correctness, instruction ownership, portability, and safety.
Assign Codex only built-in instruction and tool conflicts and compatibility with native Codex behavior.
Require one consolidated read-only Codex report without duplicating Claude review.
Do not substitute a Claude-hosted model alias for the native Codex session.

Independently verify each candidate before acting or reporting it as confirmed.
Record findings, dispositions, coverage limits, and actual review timing in a formal COMMENT review.
Preserve completed valid reviews without claiming retroactive coverage or concurrency.
