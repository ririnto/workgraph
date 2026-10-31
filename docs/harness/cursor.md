# Workgraph in Cursor

## Install locally

Clone Workgraph into Cursor's local plugin directory:

```sh
mkdir -p ~/.cursor/plugins/local
git clone https://github.com/ririnto/workgraph.git ~/.cursor/plugins/local/workgraph
```

Run Developer: Reload Window from Cursor's Command Palette.
Open Customize and confirm that Workgraph's skills appear.

Cursor loads its native `.cursor-plugin/plugin.json` manifest and the shared `skills/` directory.
Its [local plugin guide](https://cursor.com/docs/plugins#test-plugins-locally) explains local import controls and marketplace precedence.
Use the actual checkout inside the local plugin directory because Cursor rejects symlinks to repositories outside it.

## Install through a team marketplace

A team administrator can import this repository through Dashboard, Plugins & MCPs, Add Marketplace, then Import from Repo.
Use `https://github.com/ririnto/workgraph` as the repository URL.
Choose the intended access and installation mode.

Team members can then open Customize, find Workgraph in the team marketplace, and select Install.
Cursor's [marketplace guide](https://cursor.com/docs/plugins#add-a-team-marketplace) describes the required plan and administrator controls.

The repository's `.cursor-plugin/marketplace.json` catalog points to the same plugin root at `./`.
The [plugin reference](https://cursor.com/docs/reference/plugins) defines that catalog and the native Cursor manifest.

## Start a task

Type `/` in chat and select the installed `main-agent-contract` skill.
For example:

```text
/main-agent-contract Fix the parser's escaped-quote bug and verify the original trigger.
```

[Main Agent Contract](../../skills/main-agent-contract/SKILL.md) coordinates the task through Cursor's available tools.
An assigned worker uses [Subagent Context](../../skills/subagent-context/SKILL.md).
The roles follow native tool descriptions when no matching bundled host reference exists.

Workgraph uses manual role activation in Cursor.
Its manifest selects the empty `hooks/skills-only.json` configuration, and the package omits conventionally discovered hook files.
The [skill map](../../README.md#skill-invocation) lists focused development, writing, and delivery procedures.

## Update

For a local checkout:

```sh
git -C ~/.cursor/plugins/local/workgraph pull --ff-only
```

Reload the Cursor window.
For a team marketplace, refresh its repository source in the dashboard and use the installed plugin's update controls.
See the [verification map](../verification-map.md) for the package checks maintained by this repository.
