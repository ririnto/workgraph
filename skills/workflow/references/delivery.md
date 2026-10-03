# Authorized Engineering Delivery Nodes

Use each row only when the goal's scope and authority include that operation.

| Node | Required inputs | Result |
| --- | --- | --- |
| Implementation | Bounded scope, owned files, agreed behavior | Changes and implementation evidence |
| Verification | Changed behavior, relevant existing checks | Check commands, observed results, and evidence limits |
| Publication in main | Accepted changes, required check evidence, working branch, target branch | Published branch and PR/MR |
| Independent review | PR/MR, current changes, acceptance criteria | Findings with source evidence |
| Blocker fix | Confirmed finding, affected files, same branch and PR/MR | Fix and verification evidence |
| Scoped review | Earlier finding, affected changes, same PR/MR | Reassessment with source evidence |
| Deferral registration | Accepted nonblocking finding, authorized tracker | Follow-up record |
| Integration in main | Passing checks, resolved blockers, registered follow-ups | Target branch update and verification |
