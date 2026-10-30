import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const pluginSchema =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
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
const portableFields = new Set(["$schema", ...metadataFields, "extensions"]);

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Validate matching yyyy.MM.dd.seq releases with real dates and padded sequences.
 */
export const validatePluginVersions = (portableVersion, claudeVersion) => {
  for (const [host, version] of [
    ["Portable", portableVersion],
    ["Claude", claudeVersion]
  ]) {
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
  if (portableVersion !== claudeVersion) {
    throw new Error("Portable and Claude plugin versions must match.");
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

const validatePortableManifest = (manifest) => {
  if (manifest.$schema !== pluginSchema) {
    throw new Error(
      "Portable manifest must declare the Agent Plugins 1.0 schema."
    );
  }
  if (Object.keys(manifest).some((key) => !portableFields.has(key))) {
    throw new Error(
      "Portable manifest must contain only Agent Plugins fields."
    );
  }
  if (
    typeof manifest.name !== "string" ||
    !namePattern.test(manifest.name) ||
    manifest.name.length > 64 ||
    manifest.name.includes("--") ||
    manifest.name.includes("..")
  ) {
    throw new Error(
      "Portable manifest must contain a valid Agent Plugins name."
    );
  }
  for (const field of ["description", "homepage", "repository", "license"]) {
    if (typeof manifest[field] !== "string" || !manifest[field].trim()) {
      throw new Error(`Portable ${field} must be a nonempty string.`);
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
    throw new Error("Portable author must contain valid author metadata.");
  }
  if (
    !Array.isArray(manifest.keywords) ||
    manifest.keywords.some((keyword) => typeof keyword !== "string")
  ) {
    throw new Error("Portable keywords must be an array of strings.");
  }
  if (
    !isObject(manifest.extensions) ||
    Object.entries(manifest.extensions).some(
      ([namespace, extension]) =>
        !namespace.includes(".") || !isObject(extension)
    ) ||
    !isObject(manifest.extensions["com.openai"])
  ) {
    throw new Error(
      "Portable extensions must contain the OpenAI configuration object."
    );
  }
};

const validateMarketplace = (root, name, marketplace, portable) => {
  if (
    marketplace.name !== portable.name ||
    !Array.isArray(marketplace.plugins) ||
    marketplace.plugins.length !== 1 ||
    marketplace.plugins[0]?.name !== portable.name
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
  if (!isOpenAI && marketplace.owner?.name !== portable.author.name) {
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
  const portable = readManifest(root, "plugin.json");
  const claude = readManifest(root, ".claude-plugin/plugin.json");
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
  validatePortableManifest(portable);
  validatePluginVersions(portable.version, claude.version);
  for (const field of metadataFields) {
    if (!isDeepStrictEqual(portable[field], claude[field])) {
      throw new Error(`Portable and Claude ${field} metadata must match.`);
    }
  }
  if (packageManifest.name !== portable.name) {
    throw new Error("Private package name must match the portable plugin.");
  }
  if (existsSync(path.join(root, ".codex-plugin/plugin.json"))) {
    throw new Error("Remove the replaced Codex compatibility manifest.");
  }
  bundledPath(
    root,
    portable.extensions["com.openai"].hooks,
    "OpenAI hooks",
    "file"
  );
  const skillsRoot = bundledPath(
    root,
    "./skills",
    "Portable skills",
    "directory"
  );
  const skills = readdirSync(skillsRoot).filter((name) =>
    existsSync(path.join(skillsRoot, name, "SKILL.md"))
  );
  if (skills.length === 0) {
    throw new Error(
      "Portable skills must contain an immediate child with SKILL.md."
    );
  }
  for (const skill of skills) {
    bundledPath(root, `./skills/${skill}/SKILL.md`, "Portable skill", "file");
  }
  validateOmittedManifestVersions(marketplaces, packageManifest);
  for (const [name, marketplace] of marketplaces) {
    validateMarketplace(root, name, marketplace, portable);
  }
  process.stdout.write(
    "Validated portable and Claude manifests, release versions, bundled paths, and three marketplace catalogs.\n"
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
