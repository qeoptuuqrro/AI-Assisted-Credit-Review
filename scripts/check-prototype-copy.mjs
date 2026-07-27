import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const publicRoot = path.join(root, "public");
const excludedLegacyTokens = path.join(sourceRoot, "styles", "tokens.css");
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if ((await stat(absolute)).isFile()) files.push(absolute);
  }
  return files;
}

function lineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

const sourceFiles = (await walk(sourceRoot)).filter((file) => (
  /\.(?:css|ts|tsx)$/.test(file)
  && !/\.test\.[^.]+$/.test(file)
  && file !== excludedLegacyTokens
));
const publicFiles = await walk(publicRoot);
const files = [...sourceFiles, ...publicFiles, path.join(root, "index.html")];
const forbidden = [
  { pattern: /mercury/gi, message: "contains a prohibited external product reference" },
  { pattern: /demo\.mercury\.com/gi, message: "contains a prohibited external destination" },
  { pattern: /\/legacy-routes\//gi, message: "exposes a legacy reference route" },
];

for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const rule of forbidden) {
    for (const match of source.matchAll(rule.pattern)) {
      failures.push(`${path.relative(root, file)}:${lineNumber(source, match.index)} ${rule.message}.`);
    }
  }
}

if (failures.length) {
  console.error("Prototype copy check failed:\n");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Prototype copy check passed (${files.length} shipped files checked).`);
