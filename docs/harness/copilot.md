# Workgraph in GitHub Copilot

## Install through Copilot CLI

Add the marketplace and install Workgraph:

```sh
copilot plugin marketplace add ririnto/workgraph
copilot plugin install workgraph@workgraph
copilot plugin list
```

Start a new session after installation.
If the installed plugin is disabled, run `copilot plugin enable workgraph`.

These commands follow GitHub's [installation guide](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing).
Copilot CLI discovers the repository's `.claude-plugin/marketplace.json` catalog.
The plugin uses the OpenPlugin manifest at `.plugin/plugin.json` and the shared `skills/` directory.
The [CLI plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference) and [VS Code authoring reference](https://code.visualstudio.com/docs/agents/reference/agent-plugin-reference) document that format.

## Use the shared skills

Ask Copilot to apply Workgraph's [Main Agent Contract](../../skills/main-agent-contract/SKILL.md) when starting an engineering task:

```text
Use Workgraph's Main Agent Contract to fix the parser's escaped-quote bug and verify the original trigger.
```

For an assigned worker task, select [Subagent Context](../../skills/subagent-context/SKILL.md).
The role uses the active host's tool descriptions when no matching bundled host reference exists.

Use [Development](../../skills/development/SKILL.md) for implementation and [Writing](../../skills/writing/SKILL.md) for prose or instructions.
The [skill map](../../README.md#skill-invocation) lists the other task procedures.

Workgraph uses manual role activation in Copilot.
Its manifest selects the empty `hooks/skills-only.json` configuration.
The package omits conventionally discovered hook files, so clients do not pick up Claude's separate configuration.

Project or personal skills with the same name can take precedence over plugin skills.
Check the selected skill's source path if instructions differ from the installed Workgraph package.

## Other Copilot surfaces

VS Code and the Copilot app install plugins through Customize.
Copilot cloud uses repository plugin settings.
Follow the [surface-specific plugin documentation](https://docs.github.com/en/copilot/concepts/customizations/plugins) for installation controls.

The shared package supplies skills.
Each surface controls available tools, delegation, and permissions.

## Update

```sh
copilot plugin update workgraph
copilot plugin list
```

Start a new session and confirm the installed version.
See the [verification map](../verification-map.md) for the package checks maintained by this repository.
