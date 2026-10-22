import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const versionPattern =
  /^(?<year>\d{4})\.(?<month>\d{2})\.(?<day>\d{2})\.(?<sequence>\d{2})$/u;

/**
 * Validate matching host plugin versions in yyyy.mm.dd.seq format.
 * @param {string} claudeVersion Claude manifest version.
 * @param {string} codexVersion Codex manifest version.
 */
export const validatePluginVersions = (claudeVersion, codexVersion) => {
  for (const [host, version] of [
    ["Claude", claudeVersion],
    ["Codex", codexVersion]
  ]) {
    const match =
      typeof version === "string" ? versionPattern.exec(version) : null;
    if (!match) {
      throw new Error(`${host} plugin version must use yyyy.mm.dd.seq format.`);
    }
    const {
      year: yearText,
      month: monthText,
      day: dayText,
      sequence: sequenceText
    } = match.groups;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const sequence = Number(sequenceText);
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month - 1, day);
    if (
      year === 0 ||
      sequence === 0 ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new Error(
        `${host} plugin version must contain a valid date and non-zero sequence.`
      );
    }
  }
  if (claudeVersion !== codexVersion) {
    throw new Error("Claude and Codex plugin versions must match.");
  }
};

/**
 * Reject version fields on manifests that obtain their version elsewhere.
 * @param {object} marketplaceManifest Claude marketplace manifest.
 * @param {object} packageManifest Private package manifest.
 */
export const validateOmittedManifestVersions = (
  marketplaceManifest,
  packageManifest
) => {
  for (const [name, manifest] of [
    ["Claude marketplace", marketplaceManifest],
    ["Private package", packageManifest]
  ]) {
    const hasMarketplaceEntryVersion =
      name === "Claude marketplace" &&
      Array.isArray(manifest.plugins) &&
      manifest.plugins.some((plugin) => Object.hasOwn(plugin, "version"));
    if (Object.hasOwn(manifest, "version") || hasMarketplaceEntryVersion) {
      throw new Error(`${name} manifest must omit the version field.`);
    }
  }
};

const run = () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const claude = JSON.parse(
    readFileSync(path.join(root, ".claude-plugin/plugin.json"), "utf-8")
  );
  const codex = JSON.parse(
    readFileSync(path.join(root, ".codex-plugin/plugin.json"), "utf-8")
  );
  const marketplace = JSON.parse(
    readFileSync(path.join(root, ".claude-plugin/marketplace.json"), "utf-8")
  );
  const packageManifest = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf-8")
  );
  validatePluginVersions(claude.version, codex.version);
  validateOmittedManifestVersions(marketplace, packageManifest);
  process.stdout.write(
    "Host plugin versions match, and marketplace and package manifests omit version fields.\n"
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
