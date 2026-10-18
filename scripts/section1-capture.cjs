/**
 * Section 1 — element screenshot capture (feeds a PIL pixel check).
 * Captures each gold ornament as its own PNG so the pixel stage can prove the
 * foil actually PAINTS (gold pixels present), not blank-on-cream.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("node:path");

const BASE = "http://localhost:3000";
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const OUT = path.join(__dirname, "..", "visual-check");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 800, height: 1400 } });
  await p.goto(`${BASE}/?side=bride&lang=en`, { waitUntil: "networkidle" });

  const svg = p.locator("svg").filter({ has: p.locator('[id*="goldFoil"], [id*="goldSheen"]') });
  const n = await svg.count();
  for (let i = 0; i < n; i++) {
    const buf = await svg.nth(i).screenshot();
    fs.writeFileSync(path.join(OUT, `orn-gold-${i}.png`), buf);
  }
  await b.close();
  console.log(`captured ${n} gold ornaments`);
})();
