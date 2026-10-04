# Authorized Engineering Delivery Nodes

Use each row only when the goal's scope and authority include that operation.

| Node | Required inputs | Result |
| --- | --- | --- |
| Implementation | Bounded scope, owned files, agreed behavior | Changes and implementation evidence |
| Verification | Changed behavior, relevant existing checks | Check commands, observed results, and evidence limits |
| Environment scan | Current diff and changed files | File locations and exposure types, or no findings |
| Publication in Main | Accepted changes, required checks, environment scan result, working branch, base branch | Published branch and PR/MR |
| Independent review | Maintainer PR/MR or contributor working-branch changes, acceptance criteria | Findings with source evidence |
| Blocker fix | Confirmed finding, affected files, same branch, PR/MR if one exists | Fix and verification evidence |
| Scoped review | Earlier finding, affected changes, same branch, PR/MR if one exists | Reassessment with source evidence |
| Deferral registration | Accepted nonblocking finding, authorized tracker | Follow-up record |
| Integration in Main | Passing checks, resolved blockers, registered follow-ups | Base branch update and verification |
