# Workgraph In Claude Code

## Install And Load

Use Node.js 18 or later for hook execution.
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

Use `/hooks` to confirm that the SessionStart and SubagentStart handlers are active.
Marketplace installations and development checkouts can contain different versions.
Check the loaded plugin version and actual source paths before evaluating changed instructions.

Workgraph changes no model or effort settings through installation.
For a new session using Workgraph's Claude model split, the operator can choose the following startup command.

```sh
claude --model opus --effort ultracode
```

That flag selects `xhigh` effort, while active host and user overrides retain precedence.
The [Claude Main reference](../../skills/main-agent-contract/references/claude.md#model-selection) owns the operational model defaults.

## Automatic Loading

SessionStart loads [Main Agent mode](../../skills/main-agent-contract/SKILL.md) with its [Claude reference](../../skills/main-agent-contract/references/claude.md).
SubagentStart loads the [Worker contract](../../skills/subagent-context/SKILL.md) with its [Claude reference](../../skills/subagent-context/references/claude.md).
Those references own execution timing and, for Main only, orchestration and model policy.
This user adapter does not replace them.

The hook's skill fragment uses the native base-directory line and the skill body without YAML frontmatter.
Its reference fragment uses native Read line numbering.
Source labels identify complete content already loaded, so agents need no startup retrieval for those files.
The [delivery design](../design.md#deliver-context) describes whitespace handling, envelope differences, inline limits, and failure behavior.

## Manual Invocation

Use slash-prefixed, plugin-qualified skill names.
The public mode entry remains `/workgraph:main-agent-contract`.

```text
/workgraph:main-agent-contract Fix the parser's escaped-quote bug and verify the original trigger within the authorized scope.
```

| Invocation | Purpose |
| --- | --- |
| `/workgraph:main-agent-contract` | Load Main Agent mode in the main session. |
| `/workgraph:subagent-context` | Load the Worker role for an existing bounded dispatch. |
| `/workgraph:delivery` | Load Main's repository delivery procedure. |
| `/workgraph:workflow` | Request native Claude Code Workflow. |
| `/workgraph:development` | Select the matching development playbook and language references. |
| `/workgraph:principle-preserve-behavior` | Load guidance for behavior-preserving transformations. |
| `/workgraph:principle-production-interfaces` | Load guidance for production interfaces, abstractions, and test design. |
| `/workgraph:writing` | Load prose and Markdown guidance. |
| `/workgraph:instruction-authoring` | Load agent-facing instruction design guidance. |
| `/workgraph:verification` | Load runtime reproduction and evidence guidance. |
| `/workgraph:memory-maintenance` | Load authorized durable memory maintenance guidance. |

Manual role invocation reads its Claude reference unless that complete content is already present.
Invoking a skill does not create a dispatch, change the session's role, or grant permissions.
The [skill map](../../README.md#skill-invocation) identifies each procedure's owner and trigger.
[Workflow](../../skills/workflow/SKILL.md) owns its selection, authoring, execution, and result-mapping procedure.
Codex Scoped Cleanup does not authorize Codex resource operations when invoked in Claude Code.

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

## Evidence Limits

The [verification map](../verification-map.md) distinguishes source delivery, installed activation, interactive invocation, and model behavior.
Passing hook tests or plugin validation does not establish all four.
Forked Workers can inherit Main context despite receiving Worker-only hook output.
Installation does not configure models, change permissions, or activate an external review product.

Return to the [Workgraph guide](../../README.md) for task routing, development setup, and release instructions.
