/**
 * Phase 4 visual check: capture screenshots of both sides x both languages at
 * desktop and mobile widths, and report any horizontal overflow.
 *
 * Usage: node scripts/visual-check.mjs   (requires a running server on PORT, default 3115)
 */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3115;
const BASE = `http://localhost:${PORT}`;
const OUT = path.join(__dirname, "..", "visual-check");
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const PAGES = [
  { name: "chooser", query: "" },
  { name: "bride-en", query: "?side=bride&lang=en" },
  { name: "bride-hi", query: "?side=bride&lang=hi" },
  { name: "groom-en", query: "?side=groom&lang=en" },
  { name: "groom-hi", query: "?side=groom&lang=hi" },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  const problems = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const target of PAGES) {
      await page.goto(`${BASE}/${target.query}`, { waitUntil: "networkidle" });

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });
      if (overflow > 1) {
        problems.push(`${viewport.name}/${target.name}: horizontal overflow ${overflow}px`);
      }

      const lang = await page.evaluate(() => document.documentElement.lang);
      await page.screenshot({
        path: path.join(OUT, `${viewport.name}-${target.name}.png`),
        fullPage: true,
      });
      console.log(
        `captured ${viewport.name}-${target.name}.png (html lang=${lang}, overflow=${overflow}px)`
      );
    }
    await context.close();
  }

  await browser.close();
  if (problems.length > 0) {
    console.error("\nPROBLEMS:");
    for (const p of problems) console.error(" - " + p);
    process.exitCode = 1;
  } else {
    console.log("\nNo horizontal overflow detected in any viewport/page.");
  }
})();
