import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const port = Number(readArg("--port", "9235"));
const width = Number(readArg("--width", "390"));
const height = Number(readArg("--height", "844"));
const baseUrl = readArg("--base-url", "http://127.0.0.1:5182");
const outputDirectory = path.resolve(readArg("--output", `output/playwright/active-routes-${width}`));

const reviewDataSource = await readFile(path.resolve("src/features/credit-reviews/reviewData.ts"), "utf8");
const standardSlugBlock = reviewDataSource.match(/export const standardReviewSlugs = \[([\s\S]*?)\] as const;/)?.[1];
if (!standardSlugBlock) throw new Error("Could not resolve standardReviewSlugs from reviewData.ts.");
const standardReviewSlugs = [...standardSlugBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

const routes = [
  ["overview", "/"],
  ["reimbursements", "/reimbursements"],
  ["credit-reviews", "/credit-reviews"],
  ["intelligence", "/intelligence"],
  ["design-system", "/design-system"],
  ["meridian-overview", "/credit-reviews/meridian-foods"],
  ["meridian-findings", "/credit-reviews/meridian-foods/findings"],
  ["meridian-financials", "/credit-reviews/meridian-foods/financials"],
  ["meridian-sources", "/credit-reviews/meridian-foods/sources"],
  ["meridian-activity", "/credit-reviews/meridian-foods/activity"],
  ["meridian-recommendation", "/credit-reviews/meridian-foods/recommendation"],
  ["finding-customer-concentration", "/credit-reviews/meridian-foods/findings/customer-concentration"],
  ["finding-declining-margins", "/credit-reviews/meridian-foods/findings/declining-margins"],
  ["finding-increasing-leverage", "/credit-reviews/meridian-foods/findings/increasing-leverage"],
  ["northstar-overview", "/credit-reviews/northstar-health"],
  ["northstar-findings", "/credit-reviews/northstar-health/findings"],
  ["northstar-financials", "/credit-reviews/northstar-health/financials"],
  ["northstar-sources", "/credit-reviews/northstar-health/sources"],
  ["northstar-activity", "/credit-reviews/northstar-health/activity"],
  ...standardReviewSlugs.flatMap((slug) => [
    [`${slug}-overview`, `/credit-reviews/${slug}`],
    [`${slug}-findings`, `/credit-reviews/${slug}/findings`],
    [`${slug}-sources`, `/credit-reviews/${slug}/sources`],
    [`${slug}-activity`, `/credit-reviews/${slug}/activity`],
    [`${slug}-recommendation`, `/credit-reviews/${slug}/recommendation`],
  ]),
];

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((candidate) => candidate.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error(`No page target is available on port ${port}.`);

const socket = new WebSocket(target.webSocketDebuggerUrl);
let messageId = 0;
const pending = new Map();
let runtimeIssues = [];

socket.addEventListener("message", (event) => {
  const payload = JSON.parse(String(event.data));
  if (payload.id) {
    const request = pending.get(payload.id);
    if (!request) return;
    pending.delete(payload.id);
    if (payload.error) request.reject(new Error(payload.error.message));
    else request.resolve(payload.result);
    return;
  }

  if (payload.method === "Runtime.exceptionThrown") {
    runtimeIssues.push(payload.params.exceptionDetails?.text || "Runtime exception");
  }
  if (payload.method === "Runtime.consoleAPICalled" && payload.params.type === "error") {
    runtimeIssues.push(payload.params.args?.map((item) => item.value || item.description).filter(Boolean).join(" ") || "Console error");
  }
  if (payload.method === "Log.entryAdded" && ["error", "warning"].includes(payload.params.entry?.level)) {
    runtimeIssues.push(payload.params.entry.text);
  }
});

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error("Timed out connecting to Chrome.")), 10_000);
  socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
  socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("Chrome DevTools connection failed.")); }, { once: true });
});

function send(method, params = {}) {
  const id = ++messageId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

await Promise.all([send("Page.enable"), send("Runtime.enable"), send("Log.enable")]);
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width <= 500,
  screenWidth: width,
  screenHeight: height,
});

await mkdir(outputDirectory, { recursive: true });
const results = [];

for (const [name, route] of routes) {
  runtimeIssues = [];
  await send("Page.navigate", { url: `${baseUrl}${route}` });

  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const state = await send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
    if (state.result?.value === "complete") {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error(`Timed out loading ${route}.`);

  let routeReady = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const state = await send("Runtime.evaluate", {
      expression: "Boolean(document.querySelector('main h1'))",
      returnByValue: true,
    });
    if (state.result?.value) {
      routeReady = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!routeReady) throw new Error(`Timed out loading routed content for ${route}.`);

  await send("Runtime.evaluate", {
    expression: "document.fonts?.ready ? document.fonts.ready.then(() => true) : true",
    awaitPromise: true,
    returnByValue: true,
  });

  const evaluation = await send("Runtime.evaluate", {
    expression: `(() => {
      const doc = document.documentElement;
      const visible = (element) => {
        const bounds = element.getBoundingClientRect();
        const styles = getComputedStyle(element);
        return bounds.width > 0 && bounds.height > 0 && styles.display !== "none" && styles.visibility !== "hidden";
      };
      const typography = (selector) => {
        const values = Array.from(document.querySelectorAll(selector)).filter(visible).map((element) => {
          const style = getComputedStyle(element);
          return [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight, style.letterSpacing].join(" | ");
        });
        return [...new Set(values)].slice(0, 12);
      };
      const iconSizes = [...new Set(Array.from(document.querySelectorAll("main svg")).filter(visible).map((element) => {
        const bounds = element.getBoundingClientRect();
        return Math.round(bounds.width) + "x" + Math.round(bounds.height);
      }))].slice(0, 16);
      return {
        url: location.href,
        innerWidth: window.innerWidth,
        clientWidth: doc.clientWidth,
        scrollWidth: doc.scrollWidth,
        scrollHeight: doc.scrollHeight,
        horizontalOverflow: doc.scrollWidth > doc.clientWidth,
        h1: Array.from(document.querySelectorAll("main h1")).filter(visible).map((element) => element.textContent?.trim() || "").slice(0, 4),
        selectedTabs: Array.from(document.querySelectorAll('[role="tab"][aria-selected="true"]')).filter(visible).map((element) => element.textContent?.trim() || ""),
        visibleDialogs: Array.from(document.querySelectorAll('[role="dialog"], [aria-modal="true"]')).filter(visible).length,
        fonts: {
          arcadiaText: document.fonts.check('16px "Arcadia Text"'),
          arcadiaDisplay: document.fonts.check('28px "Arcadia Display"'),
        },
        typography: {
          pageTitle: typography("main h1"),
          sectionTitle: typography("main h2"),
          tabs: typography('main [role="tab"]'),
          tableHeaders: typography("main th"),
          tableCells: typography("main td"),
          controls: typography("main button, main input, main textarea"),
        },
        iconSizes,
        failedImages: Array.from(document.images).filter((image) => (
          visible(image)
          && Number(getComputedStyle(image).opacity) > 0
          && (!image.complete || image.naturalWidth === 0)
        )).map((image) => image.alt || image.src).slice(0, 8),
      };
    })()`,
    returnByValue: true,
  });

  const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(path.join(outputDirectory, `${name}.png`), Buffer.from(screenshot.data, "base64"));
  results.push({ name, route, ...evaluation.result.value, runtimeIssues: [...new Set(runtimeIssues)] });
}

await writeFile(path.join(outputDirectory, "metrics.json"), `${JSON.stringify({ viewport: { width, height }, routes: results }, null, 2)}\n`);
socket.close();

const failures = results.filter((result) => (
  result.horizontalOverflow
  || result.runtimeIssues.length
  || !result.fonts?.arcadiaText
  || !result.fonts?.arcadiaDisplay
  || result.failedImages?.length
));
console.log(JSON.stringify({ viewport: { width, height }, routeCount: results.length, failures }, null, 2));
