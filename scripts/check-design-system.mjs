import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const tokenPath = path.join(srcRoot, "design-system", "tokens.css");
const legacyTokenPath = path.join(srcRoot, "styles", "tokens.css");
const galleryPath = path.join(srcRoot, "features", "design-system", "DesignSystemPage.tsx");
const contractsPath = path.join(root, "docs", "SALT_COMPONENT_CONTRACTS.md");
const sharedUiPath = path.join(srcRoot, "shared", "ui");
const companyLogoRegistryPath = path.join(srcRoot, "features", "credit-reviews", "companyLogos.ts");

const failures = [];

async function walk(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry);
    const metadata = await stat(absolute);
    if (metadata.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function relative(file) {
  return path.relative(root, file);
}

function lineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function fail(file, source, index, message) {
  failures.push(`${relative(file)}:${lineNumber(source, index)} ${message}`);
}

const allSourceFiles = await walk(srcRoot);
const activeCssFiles = allSourceFiles.filter((file) => (
  file.endsWith(".css")
  && !file.includes(`${path.sep}design-history${path.sep}`)
  && file !== legacyTokenPath
));
const tokenSource = await readFile(tokenPath, "utf8");

// The active React product owns one canonical token file. Duplicate definitions
// make cascade order, documentation, and Inspect-mode output ambiguous.
const tokenDefinitions = new Map();
for (const match of tokenSource.matchAll(/--([\w-]+)\s*:/g)) {
  const name = match[1];
  const prior = tokenDefinitions.get(name);
  if (prior !== undefined) {
    fail(tokenPath, tokenSource, match.index, `duplicates --${name} (first declared on line ${prior}).`);
  } else {
    tokenDefinitions.set(name, lineNumber(tokenSource, match.index));
  }
}

// Module-local variables are valid definitions too. A short allowlist covers
// values deliberately supplied at runtime through style.setProperty or React style.
const definitions = new Set(tokenDefinitions.keys());
const cssSources = new Map();
for (const file of activeCssFiles) {
  const source = await readFile(file, "utf8");
  cssSources.set(file, source);
  for (const match of source.matchAll(/--([\w-]+)\s*:/g)) definitions.add(match[1]);
}
const runtimeVariables = new Set([
  "current-position",
  "threshold-position",
  "source-document-zoom",
  "salt-drawer-responsive-available-height",
]);

for (const [file, source] of cssSources) {
  for (const match of source.matchAll(/var\(--([\w-]+)/g)) {
    const name = match[1];
    if (!definitions.has(name) && !runtimeVariables.has(name)) {
      fail(file, source, match.index, `uses undefined custom property --${name}.`);
    }
  }

  if (file === tokenPath) continue;

  for (const match of source.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) {
    const lineStart = source.lastIndexOf("\n", match.index) + 1;
    const lineEnd = source.indexOf("\n", match.index);
    const line = source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd);
    if (!line.includes("design-system-ignore:")) {
      fail(file, source, match.index, "contains a raw color; promote it to a Salt token or document a narrow design-system-ignore reason.");
    }
  }

  for (const match of source.matchAll(/([\w-]+)\s*:\s*([^;{}]+);/g)) {
    const property = match[1];
    const value = match[2].trim();
    const usesToken = /\b(?:var|calc|clamp|min|max)\(/.test(value);
    if (["font-size", "font-weight", "line-height", "letter-spacing"].includes(property)) {
      const fontFaceRange = file.endsWith("design-system/base.css") && property === "font-weight" && /^\d+\s+\d+$/.test(value);
      if (!usesToken && !fontFaceRange && !["inherit", "normal", "initial", "unset"].includes(value)) {
        fail(file, source, match.index, `contains raw ${property}: ${value}.`);
      }
    }
    if (["border-radius", "box-shadow"].includes(property)) {
      if (!usesToken && !["0", "none", "inherit", "initial", "unset"].includes(value)) {
        fail(file, source, match.index, `contains raw ${property}: ${value}.`);
      }
    }
    if (file.includes(`${path.sep}shared${path.sep}ui${path.sep}`) && /(^|[^-\w])\d*\.?\d+px\b/.test(value) && !usesToken) {
      fail(file, source, match.index, `contains raw shared-component geometry (${property}: ${value}).`);
    }
  }
}

// The preserved legacy token file is a proving-route compatibility lane. It
// must never become an implicit second source of truth for React product code.
for (const file of allSourceFiles.filter((candidate) => candidate !== legacyTokenPath && /\.(?:css|ts|tsx)$/.test(candidate))) {
  const source = await readFile(file, "utf8");
  if (source.includes("styles/tokens.css")) {
    failures.push(`${relative(file)} imports or references the legacy compatibility token file.`);
  }
}

// Known companies have one API-backed identity source. Product marks and human
// avatars remain separate, but a named company must never regress to a page-owned
// single-letter mark or bypass the registry with a guessed domain.
const companyLogoRegistrySource = await readFile(companyLogoRegistryPath, "utf8");
const knownCompanyNames = [...companyLogoRegistrySource.matchAll(/^\s*"([^"]+)"\s*:/gm)].map((match) => match[1]);
const activeTsxFiles = allSourceFiles.filter((file) => (
  file.endsWith(".tsx")
  && !file.includes(`${path.sep}design-history${path.sep}`)
));

for (const file of activeTsxFiles) {
  const source = await readFile(file, "utf8");
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    for (const companyName of knownCompanyNames) {
      if (!line.includes(companyName)) continue;
      const initial = companyName[0];
      const letterMark = new RegExp(`<(?:span|i)\\b[^>]*>\\s*${initial}\\s*</(?:span|i)>`);
      if (letterMark.test(line)) {
        failures.push(`${relative(file)}:${index + 1} renders ${companyName} as a page-owned letter mark; use CompanyLogo with companyLogoDomains.`);
      }
    }
  });

  for (const match of source.matchAll(/<CompanyLogo[\s\S]*?\/>/g)) {
    for (const companyName of knownCompanyNames) {
      if (!match[0].includes(`name="${companyName}"`)) continue;
      if (!match[0].includes(`companyLogoDomains["${companyName}"]`)) {
        fail(file, source, match.index, `${companyName} CompanyLogo bypasses companyLogoDomains.`);
      }
    }
  }
}

// Every production shared component must have a live design-system specimen
// and a written contract. Compatibility and internal/dead-code lanes are explicit.
const componentEntries = await readdir(sharedUiPath, { withFileTypes: true });
const componentExceptions = new Set(["Badge", "DesignVariantNotice", "TaskRow"]);
const productionComponents = componentEntries
  .filter((entry) => entry.isDirectory() && !componentExceptions.has(entry.name))
  .map((entry) => entry.name)
  .sort();
const gallerySource = await readFile(galleryPath, "utf8");
const contractsSource = await readFile(contractsPath, "utf8");

for (const component of productionComponents) {
  if (!gallerySource.includes(`/shared/ui/${component}/${component}`)) {
    failures.push(`${relative(galleryPath)} is missing a live ${component} specimen/import.`);
  }
  if (!contractsSource.includes(`\n## ${component}\n`)) {
    failures.push(`${relative(contractsPath)} is missing the ## ${component} contract.`);
  }
}

const galleryCount = gallerySource.match(/id: "components", label: "Components", count: (\d+)/)?.[1];
if (Number(galleryCount) !== productionComponents.length) {
  failures.push(`${relative(galleryPath)} reports ${galleryCount ?? "no"} components; ${productionComponents.length} production shared components are governed.`);
}

if (failures.length) {
  console.error("Design-system drift check failed:\n");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Design-system drift check passed (${productionComponents.length} shared components, ${tokenDefinitions.size} canonical tokens).`);
