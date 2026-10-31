# Workgraph in Claude Code

## Install and load

Use Node.js 26.13.0 or later within major version 26 for hook execution.
Claude Code must support plugin command hooks and `additionalContext` for SessionStart and SubagentStart.
Add the marketplace and install the plugin.

```sh
claude plugin marketplace add ririnto/workgraph
claude plugin install workgraph@workgraph
```

For development, load the checkout in a new session.

```sh
claude --plugin-dir ./
```

Use `/hooks` to confirm that the SessionStart, SubagentStart, and Bash PreToolUse handlers are active.
Marketplace installations and development checkouts can contain different versions.
Check the loaded plugin version and actual source paths before evaluating changed instructions.

Workgraph changes no model or effort settings through installation.

## Inspect the loaded plugin

Inspect an installed copy from the shell.

```sh
claude plugin details workgraph
```

Inspect a development checkout from its root.

```sh
claude --plugin-dir ./ plugin details workgraph
```

Check the discovered components and reported source before comparing instruction changes.
The report estimates description tokens loaded each turn and skill-body tokens loaded on invocation.
Those estimates exclude context emitted by Workgraph's startup hooks.
Use `/context` in a fresh session to inspect actual context usage.
Check actual triggering after shortening descriptions.
The [cost and usage guide](https://code.claude.com/docs/en/plugins/measure) explains these estimates and their limits.

## Automatic loading

SessionStart loads [Main Agent mode](../../skills/main-agent-contract/SKILL.md) with its [Claude reference](../../skills/main-agent-contract/references/claude-code.md).
SubagentStart loads the [Worker contract](../../skills/subagent-context/SKILL.md) with its [Claude reference](../../skills/subagent-context/references/claude-code.md).
Both references own execution timing.
The Main reference also provides host-specific orchestration and model selection guidance.
This user adapter does not replace them.

The hook context starts with the native base-directory line and the skill body without YAML frontmatter.
Its reference fragment uses native Read line numbering.
Source labels follow the skill fragment and identify complete content already loaded, so agents need no startup retrieval for those files.
This matches loaded instruction text while the host retains its hook message envelope, invocation records, and permissions.
The [delivery design](../design.md#deliver-context) describes whitespace handling, envelope differences, inline limits, and failure behavior.

The [Bash polling guard](../../README.md#bash-polling-guard) denies repeated literal `tail` and `sleep` calls through PreToolUse.

## Manual invocation

Use slash-prefixed, plugin-qualified skill names.
The public mode entry remains `/workgraph:main-agent-contract`.

```text
/workgraph:main-agent-contract Fix the parser's escaped-quote bug and verify the original trigger within the authorized scope.
/workgraph:workflow Design a bounded in-memory LRU cache with deterministic eviction.
```

| Invocation | Purpose |
| --- | --- |
| `/workgraph:main-agent-contract` | Load Main Agent mode in the main session. |
| `/workgraph:subagent-context` | Load the Worker role for an existing bounded dispatch. |
| `/workgraph:delivery` | Load Main's repository delivery procedure. |
| `/workgraph:workflow` | Request native Claude Code Workflow or load its design guidance. |
| `/workgraph:development` | Select the matching development playbook and language references. |
| `/workgraph:writing` | Load prose, Markdown, and instruction design guidance. |
| `/workgraph:memory-maintenance` | Load authorized durable memory maintenance guidance. |

Manual role invocation reads its Claude reference unless that complete content is already present.
Invoking a skill does not create a dispatch, change the session's role, or grant permissions.
The [skill map](../../README.md#skill-invocation) identifies each procedure's owner and trigger.
[Workflow](../../skills/workflow/SKILL.md) owns its selection, authoring, execution, and result-mapping procedure.
Codex Scoped Cleanup does not authorize Codex resource operations when invoked in Claude Code.

## Evaluate discovery and outcomes

Use Claude Code 2.1.269 or later for native plugin evaluations.
Use 2.1.305 or later for checks that require completed-call replay.
The `triggering` cases exercise natural requests without naming the expected skill in the prompt.

| Case | Expected behavior |
| --- | --- |
| [Writing request](../../evals/writing-natural-trigger/case.yaml) | Load Writing and preserve the supplied facts while revising prose. |
| [Source correction](../../evals/development-natural-trigger/case.yaml) | Load Development and correct the supplied function without claiming execution. |
| [Workflow near miss](../../evals/workflow-keyword-near-miss/case.yaml) | Explain GitHub Actions without invoking Workgraph's native Workflow procedure. |

Activation graders accept successful Skill results or complete reads of the corresponding bundled skill.
They reject mentions, attempted loads, and descriptions alone as evidence of loading.
Outcome graders check the answer separately.
Tool graders check that these read-only requests cause no file writes or shell commands.

Run a focused regression check from a trusted checkout.
These evaluations call real models and keep their reports outside the repository.

```sh
claude plugin eval ./ --tag triggering --runs 2 --ablation none --no-publish --output-dir ../workgraph-trigger-results
```

For a paired no-plugin comparison, omit `--ablation none`.
Pin `--model` and `--judge-model` to supported identifiers when comparing versions.
Use matching prompts, tool grants, inputs, and run counts.
Inspect individual outcomes, failed requests, timing, and usage before claiming an improvement.
The [native evaluation guide](https://code.claude.com/docs/en/plugin-evals) describes baseline comparisons, graders, and result files.

## Updates

After an authorized release reaches the installation's distribution branch, update the marketplace copy.

```sh
claude plugin update workgraph@workgraph
```

Run `/reload-plugins` to make downloaded files available to new plugin loads, or start a new session.
Reloading does not prove that previously injected instructions were replaced in the current context.
Use a fresh session and confirm its plugin version and source paths when evaluating changed instructions.
Development directories load current files on reload or session startup without requiring a version change.
The [Claude loading reference](https://code.claude.com/docs/en/plugins/loading#versions-and-updates) describes cache and update behavior.

## Evidence limits

The [verification map](../verification-map.md) distinguishes source delivery, installed activation, interactive invocation, and model behavior.
Passing hook tests or plugin validation does not establish all four.
Forked Workers can inherit Main context despite receiving Worker-only hook output.
Installation does not configure models, change permissions, or activate an external review product.

Return to the [Workgraph guide](../../README.md) for task routing, development setup, and release instructions.
