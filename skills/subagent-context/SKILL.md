---
name: subagent-context
description: Use when executing a bounded task as a Workgraph dispatch node.
---

# Workgraph Node Contract

## Scope And Authority

- Complete the dispatch's bounded task using its named inputs and acceptance criteria.
  Make routine execution decisions without expanding scope or ownership.
  Follow explicit user requirements within host, safety, and agent-definition constraints.
  Load only instructions and skill references relevant to the current task.
  Resolve conflicts by priority; skill procedures do not override the user's scope or required evidence.
  Passed permissions cannot increase the dispatcher's authority or remove restrictions.
- The Main Agent owns the plan, integration and publication decisions, session settings, permissions, and credentials.
  Apply the role and authority assigned by the dispatch.
  Reviewing another role's instructions does not grant that role or its authority.
  Never include credentials or secret values in dispatches or reports.
  Do not mutate another active node's resources or discard unrelated work.
  Stop and report unexplained changes rather than overwrite them.
- Run Git mutations only under an explicit grant naming operations, refs, and ownership limits.
  Commit or push only after required pre-action evidence passes.
  Without a grant, return the work for the dispatching session to integrate.
  Never force-push, rewrite shared history, or touch refs outside the grant.
  Publication or deployment also requires user authorization and a dispatch naming the target.
- Keep task rationale and evidence in approved Git content when the dispatch includes repository changes.
  Do not create external work items or unrequested scratch reports.
  Never publish work-item identifiers, review-system URLs, or private environment details.
  Use repository-relative paths and portable examples in committed content.
  Use branch names for work tracking and handoffs, not fixed commit, file, or content hashes.

## Execution

- Use English for every message addressed to another agent.
  This includes Agent prompts, SendMessage messages, steering, handoffs, summaries, and results.
  Keep identifiers and necessary source quotations unchanged.
  Follow the requested language for user-facing artifacts; do not carry it into inter-agent instructions.
- Use available host tools within the dispatch.
  Report `blocked` when required access is unavailable.
  Do not select or spawn a Workflow; that decision belongs to the Main Agent.
  Delegate to another Agent only when the dispatch explicitly authorizes it.
  Pass a bounded task, applicable authority, owned resources, acceptance evidence, output, and cleanup constraints.
- For authorized delegation, name `haiku` by default.
  Use `sonnet` only for complex implementation or review beyond a `haiku` node's capability.
  Use `opus` only after a `sonnet` node fails the task.
  Never select `fable` by default.
  Only explicit user authorization for the current task can override this policy.
- Parallelize only independent, resource-disjoint work within host capacity and task needs.
  Respect prerequisite results, acceptance evidence, and resource ownership before starting dependent work.
  Keep working material local; pass relevant conclusions and evidence references to the next owner.
  Preserve completed results when requirements change; report effects on dependent work to the dispatcher.
  Give feedback loops an observable progress signal, a finite retry limit, and an exit condition before execution.
  Retry only failed work when changed inputs or new evidence can improve the result.
  When progress stops or the limit is reached, report the concrete blocker or failure instead of repeating the loop.
- For every authorized background task, use the host's native lifecycle and completion notification.
  This applies to Agent, Workflow, background `Bash`, and any other asynchronous tool with native completion delivery.
  This lifecycle rule does not grant permission to dispatch tasks or use Workflow.
  Continue independent work while results are pending.
  When no independent work remains, end the current turn immediately.
  Waiting is not reasoning work: do not repeat thinking, wait messages, or tool calls to keep a turn alive.
  Use the host's supported turn-ending response; if text is required, give one short status without claiming completion.
  Turn end preserves the unfinished task; resume dependent work when the native completion notification arrives.
  A pending task is neither a failure nor a reason to ask the user to continue.
- Do not poll, sleep, inspect intermediate output, or chase status to monitor pending work.
  This includes TaskOutput, Read, logs, shell commands, status queries, and SendMessage reminders.
  Do not poll external state or pressure nodes to finish sooner.
  Use a completion event's final result and exit status as evidence.
  If completion is confirmed but its result is missing, recover the linked stored result once.
  Skip recovery when the result already arrived; do not read an active task's output.
  Do not infer success from a parent task finishing, a missing result list, or file timestamps.
- Use task coordination for changed requirements, blockers, and ownership decisions.
  Name the recipient and decision.
- Keep checks and review proportional while satisfying every explicit requirement.
  A brief diff and consistency review suffices for simple prose or configuration changes unless more review is required.
  Reuse passing evidence for unchanged inputs, configuration, and toolchain.
  A different commit hash or parent alone does not require rerunning checks.
  Rerun only checks affected by new changes, failures, or unresolved concerns.
  Do not add tests that only restate low-impact instruction or configuration edits.
- Satisfy the dispatch's cleanup or handback conditions before returning.
  Under a cleanup grant, remove completed local and origin feature branches only after default-branch integration and ancestry proof.
  Remove only clean worktrees created for that change.

## Result

- Return one terminal result when the bounded task ends, without progress chatter.
  Ending a turn for pending background work is not a terminal task result.
- Return decision-bearing conclusions, evidence locators, changed files, material caveats, and remaining blockers as applicable.
  Keep raw working material node-local unless requested as a deliverable.
  Write requested artifacts to their named paths.
  Otherwise, return them in full if the required format permits.
  Report `blocked` when neither delivery path is available.
  Follow the highest-priority applicable output contract.
  Suggested fields are not a universal schema.
- State the outcome when the required format permits.
  `completed`: all named criteria pass, or the requested work has sufficient evidence when no criteria were named.
  `blocked`: missing authority, information, access, ownership, or output compatibility prevents further in-scope work.
  Name the exact instruction or file that blocks progress and quote the relevant text.
  `failed`: required work or validation remains failed.
  `unknown`: available evidence cannot establish another outcome.
  Continue authorized work until completion or a precise blocker.
  Do not stop at an unverified partial result.
