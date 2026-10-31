import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const versionPattern =
  /^(?<year>[1-9]\d{3})\.(?<month>\d{2})\.(?<day>\d{2})\.(?<sequence>0[1-9]|[1-9]\d+)$/u;
const namePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/u;
const metadataFields = [
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords"
];
const nativeFields = new Set(["$schema", ...metadataFields, "skills", "hooks"]);

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Validate matching yyyy.MM.dd.seq releases with real dates and padded sequences.
 */
export const validatePluginVersions = (
  codexVersion,
  claudeVersion,
  cursorVersion,
  copilotVersion
) => {
  const versions = [
    ["Codex", codexVersion],
    ["Claude", claudeVersion],
    ["Cursor", cursorVersion],
    ["Copilot", copilotVersion]
  ];
  for (const [host, version] of versions) {
    const match =
      typeof version === "string" ? versionPattern.exec(version) : null;
    if (!match) {
      throw new Error(
        `${host} plugin version must use yyyy.MM.dd.seq with two-digit month/day and sequence padding below 10.`
      );
    }
    const year = Number(match.groups.year);
    const month = Number(match.groups.month);
    const day = Number(match.groups.day);
    const sequence = Number(match.groups.sequence);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      !Number.isSafeInteger(sequence) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new Error(
        `${host} plugin version must contain a valid date and safe positive sequence.`
      );
    }
  }
  if (new Set(versions.map(([, version]) => version)).size !== 1) {
    throw new Error("Native plugin versions must match across all hosts.");
  }
};

/**
 * Reject duplicate release metadata in catalogs and the private package.
 */
export const validateOmittedManifestVersions = (
  marketplaces,
  packageManifest
) => {
  for (const [name, manifest] of [
    ...marketplaces,
    ["Private package", packageManifest]
  ]) {
    if (
      Object.hasOwn(manifest, "version") ||
      (isObject(manifest.metadata) &&
        Object.hasOwn(manifest.metadata, "version")) ||
      (Array.isArray(manifest.plugins) &&
        manifest.plugins.some(
          (plugin) => isObject(plugin) && Object.hasOwn(plugin, "version")
        ))
    ) {
      throw new Error(`${name} manifest must omit the version field.`);
    }
  }
};

const bundledPath = (root, value, label, kind) => {
  if (
    typeof value !== "string" ||
    !value.startsWith("./") ||
    value.includes("\\") ||
    value.split("/").includes("..")
  ) {
    throw new Error(
      `${label} must use a ./-prefixed package path without traversal.`
    );
  }
  const resolved = realpathSync(path.resolve(root, value));
  const relative = path.relative(root, resolved);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`${label} must resolve inside the plugin root.`);
  }
  const stat = statSync(resolved);
  if (
    (kind === "file" && !stat.isFile()) ||
    (kind === "directory" && !stat.isDirectory())
  ) {
    throw new Error(`${label} must resolve to a ${kind}.`);
  }
  return resolved;
};

const readManifest = (root, filename) => {
  const manifest = JSON.parse(
    readFileSync(bundledPath(root, `./${filename}`, filename, "file"), "utf-8")
  );
  if (!isObject(manifest)) {
    throw new Error(`${filename} must contain a JSON object.`);
  }
  return manifest;
};

const validateNativeManifest = (manifest, host) => {
  if (host !== "Claude" && Object.hasOwn(manifest, "$schema")) {
    throw new Error(`${host} native manifest must omit the schema field.`);
  }
  if (Object.keys(manifest).some((key) => !nativeFields.has(key))) {
    throw new Error(
      `${host} manifest must contain only supported native fields.`
    );
  }
  if (
    typeof manifest.name !== "string" ||
    !namePattern.test(manifest.name) ||
    manifest.name.length > 64 ||
    manifest.name.includes("--") ||
    manifest.name.includes("..")
  ) {
    throw new Error(`${host} manifest must contain a valid plugin name.`);
  }
  for (const field of ["description", "homepage", "repository", "license"]) {
    if (typeof manifest[field] !== "string" || !manifest[field].trim()) {
      throw new Error(`${host} ${field} must be a nonempty string.`);
    }
  }
  if (
    !isObject(manifest.author) ||
    typeof manifest.author.name !== "string" ||
    !manifest.author.name.trim() ||
    Object.entries(manifest.author).some(
      ([key, value]) =>
        !["name", "email", "url"].includes(key) || typeof value !== "string"
    )
  ) {
    throw new Error(`${host} author must contain valid author metadata.`);
  }
  if (
    !Array.isArray(manifest.keywords) ||
    manifest.keywords.some((keyword) => typeof keyword !== "string")
  ) {
    throw new Error(`${host} keywords must be an array of strings.`);
  }
};

const validateMarketplace = (root, name, marketplace, codex) => {
  if (
    marketplace.name !== codex.name ||
    !Array.isArray(marketplace.plugins) ||
    marketplace.plugins.length !== 1 ||
    marketplace.plugins[0]?.name !== codex.name
  ) {
    throw new Error(
      `${name} must list Workgraph once under the matching marketplace name.`
    );
  }
  const [plugin] = marketplace.plugins;
  const isOpenAI = name === "OpenAI marketplace";
  if (
    isOpenAI &&
    (!isObject(plugin.source) || plugin.source.source !== "local")
  ) {
    throw new Error("OpenAI marketplace must use a local plugin source.");
  }
  const source = isOpenAI ? plugin.source.path : plugin.source;
  if (bundledPath(root, source, `${name} source`, "directory") !== root) {
    throw new Error(`${name} source must select the canonical plugin root.`);
  }
  if (!isOpenAI && marketplace.owner?.name !== codex.author.name) {
    throw new Error(`${name} owner must match the plugin author.`);
  }
  if (
    isOpenAI &&
    (plugin.policy?.installation !== "AVAILABLE" ||
      plugin.policy?.authentication !== "ON_INSTALL")
  ) {
    throw new Error(
      "OpenAI marketplace must preserve user-controlled installation policy."
    );
  }
};

const run = () => {
  const root = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
  for (const filename of ["plugin.json", "hooks.json", "hooks/hooks.json"]) {
    if (lstatSync(path.join(root, filename), { throwIfNoEntry: false })) {
      throw new Error(
        `Remove ${filename}; native manifests must select the host-specific hooks.`
      );
    }
  }
  const codex = readManifest(root, ".codex-plugin/plugin.json");
  const claude = readManifest(root, ".claude-plugin/plugin.json");
  const cursor = readManifest(root, ".cursor-plugin/plugin.json");
  const copilot = readManifest(root, ".plugin/plugin.json");
  const manifests = [
    ["Codex", codex, "codex-hooks.json"],
    ["Claude", claude, "claude-hooks.json"],
    ["Cursor", cursor, "skills-only.json"],
    ["Copilot", copilot, "skills-only.json"]
  ];
  const packageManifest = readManifest(root, "package.json");
  const marketplaces = [
    [
      "Claude marketplace",
      readManifest(root, ".claude-plugin/marketplace.json")
    ],
    [
      "OpenAI marketplace",
      readManifest(root, ".agents/plugins/marketplace.json")
    ],
    [
      "Cursor marketplace",
      readManifest(root, ".cursor-plugin/marketplace.json")
    ]
  ];
  validatePluginVersions(
    codex.version,
    claude.version,
    cursor.version,
    copilot.version
  );
  for (const [host, manifest, hookFile] of manifests) {
    validateNativeManifest(manifest, host);
    for (const field of metadataFields) {
      if (!isDeepStrictEqual(codex[field], manifest[field])) {
        throw new Error(`Codex and ${host} ${field} metadata must match.`);
      }
    }
    if (
      bundledPath(root, manifest.hooks, `${host} hooks`, "file") !==
      path.join(root, "hooks", hookFile)
    ) {
      throw new Error(`${host} hooks must select ./hooks/${hookFile}.`);
    }
    if (
      bundledPath(
        root,
        host === "Claude" ? (manifest.skills ?? "./skills/") : manifest.skills,
        `${host} skills`,
        "directory"
      ) !== path.join(root, "skills")
    ) {
      throw new Error(
        `${host} skills must select the shared skills directory.`
      );
    }
  }
  if (packageManifest.name !== codex.name) {
    throw new Error("Private package name must match the native plugin.");
  }
  if (
    !isDeepStrictEqual(readManifest(root, "hooks/skills-only.json"), {
      hooks: {},
      version: 1
    })
  ) {
    throw new Error("Skills-only hook configuration must contain no handlers.");
  }
  const skillsRoot = bundledPath(
    root,
    "./skills",
    "Shared skills",
    "directory"
  );
  const skills = readdirSync(skillsRoot).filter((name) =>
    existsSync(path.join(skillsRoot, name, "SKILL.md"))
  );
  if (skills.length === 0) {
    throw new Error(
      "Shared skills must contain an immediate child with SKILL.md."
    );
  }
  for (const skill of skills) {
    bundledPath(root, `./skills/${skill}/SKILL.md`, "Shared skill", "file");
  }
  validateOmittedManifestVersions(marketplaces, packageManifest);
  for (const [name, marketplace] of marketplaces) {
    validateMarketplace(root, name, marketplace, codex);
  }
  process.stdout.write(
    "Validated four native manifests, release versions, bundled paths, and three marketplace catalogs.\n"
  );
};

if (
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  realpathSync(import.meta.filename) === realpathSync(process.argv[1])
) {
  try {
    run();
  } catch (error) {
    process.stderr.write(
      `Plugin version validation failed: ${error.message}\n`
    );
    process.exitCode = 1;
  }
}
