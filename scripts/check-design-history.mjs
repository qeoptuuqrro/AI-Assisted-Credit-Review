import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const projectRoot = process.cwd();
const sourceRoot = join(projectRoot, "src");
const historyRoot = join(sourceRoot, "design-history");
const registryPath = join(sourceRoot, "features", "design-tools", "designVersions.ts");
const allowedImportRoots = [
  "src/design-history/",
  "src/features/design-tools/",
  "src/features/design-system/",
];
const violations = [];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

for (const file of walk(sourceRoot)) {
  if (!/\.(?:ts|tsx|js|jsx|mjs)$/.test(file)) continue;
  const localPath = relative(projectRoot, file).replaceAll("\\", "/");
  const source = readFileSync(file, "utf8");
  const importsHistory = /(?:from\s*|import\s*\()\s*["'][^"']*design-history\//.test(source);
  const importerAllowed = allowedImportRoots.some((root) => localPath.startsWith(root));
  if (importsHistory && !importerAllowed) violations.push(`${localPath}: production code imports design-history`);
}

for (const file of walk(historyRoot)) {
  const localPath = relative(projectRoot, file).replaceAll("\\", "/");
  const source = readFileSync(file, "utf8");
  if (/\.css$/.test(file) && /:root\b/.test(source)) violations.push(`${localPath}: archived CSS must not define :root tokens`);
  if (/\.(?:ts|tsx)$/.test(file) && /shared\/ui\/Drawer/.test(source)) violations.push(`${localPath}: archived drawers must not import the current shared Drawer`);
}

const registrySource = readFileSync(registryPath, "utf8");
const registryRecords = registrySource
  .split(/\n\s*\},\n/)
  .map((record) => ({
    component: record.match(/component:\s*"([^"]+)"/)?.[1],
    status: record.match(/status:\s*"([^"]+)"/)?.[1],
  }))
  .filter((record) => record.component && record.status);
const registeredComponents = new Set(registryRecords.map((record) => record.component));

for (const component of registeredComponents) {
  const currentCount = registryRecords.filter((record) => record.component === component && record.status === "current").length;
  if (currentCount !== 1) violations.push(`designVersions.ts: ${component} must have exactly one current version; found ${currentCount}`);
}

if (violations.length > 0) {
  console.error("Design-history architecture check failed:\n" + violations.map((violation) => `- ${violation}`).join("\n"));
  process.exit(1);
}

console.log(`Design-history architecture check passed for ${registeredComponents.size} component family.`);
