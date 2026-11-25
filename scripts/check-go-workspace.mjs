import { execFileSync } from "node:child_process";
import path from "node:path";

const modules = new Set(
  execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--",
      "go.mod",
      ":(glob)**/go.mod",
      ":(exclude,glob)test/fixtures/**"
    ],
    { encoding: "utf-8" }
  )
    .split("\0")
    .filter(Boolean)
);
/** @type {unknown} */
const workspace = JSON.parse(
  execFileSync("go", ["work", "edit", "-json", "go.work"], {
    encoding: "utf-8",
    env: { ...process.env, GOWORK: "off" }
  })
);
if (
  workspace === null ||
  typeof workspace !== "object" ||
  !("Use" in workspace) ||
  (workspace.Use !== null && !Array.isArray(workspace.Use))
) {
  throw new Error("go.work [R40] Go did not return workspace membership.");
}
/** @type {unknown[]} */
const uses = workspace.Use ?? [];
const members = new Set(
  uses.map((entry) => {
    if (
      entry === null ||
      typeof entry !== "object" ||
      !("DiskPath" in entry) ||
      typeof entry.DiskPath !== "string"
    ) {
      throw new Error(
        "go.work [R40] Go returned a workspace member without a path."
      );
    }
    return path.posix.join(entry.DiskPath, "go.mod");
  })
);
for (const module of modules.difference(members)) {
  process.stderr.write(
    `${module} [R40] Missing workspace member in go.work.\n`
  );
  process.exitCode = 1;
}
for (const member of [...members.difference(modules)].toSorted()) {
  process.stderr.write(
    `${member} [R40] Workspace member has no tracked project go.mod.\n`
  );
  process.exitCode = 1;
}
