# Engineering Delivery Nodes

| Node | Required inputs | Result |
| --- | --- | --- |
| Implementation | Bounded scope, owned files, agreed behavior | Changes and implementation evidence |
| Verification | Changed behavior, relevant existing checks | Check commands, observed results, and evidence limits |
| Publication in main | Accepted changes, required check evidence, working branch, target branch | Published branch and PR/MR |
| Independent review | Published PR/MR, current changes, acceptance criteria | Findings with source evidence |
| Blocker fix | Confirmed finding, affected files, same branch and PR/MR | Fix and scoped review evidence |
| Deferral registration | Accepted nonblocking finding, authorized tracker | Follow-up record |
| Integration in main | Passing checks, resolved blockers, registered follow-ups | Target branch update and verification |

A follow-up record contains evidence, scope, acceptance criteria, a named owner, and a next action.
A scoped review identifies the affected changes and the earlier finding it reassesses.
