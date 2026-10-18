/**
 * Section 1 — Hero verification probe.
 * Screenshots the hero (bride+en, mobile+desktop) and asserts the ornament
 * ID-namespacing holds in the live DOM: no duplicate SVG def ids on the page,
 * and every url(#...) reference resolves to an id present in ITS OWN svg.
 */
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;
const OUT = path.join(__dirname, "..", "visual-check");
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  const problems = [];

  for (const vp of [
    { name: "mobile", width: 390, height: 2400 },
    { name: "desktop", width: 1280, height: 1600 },
  ]) {
    await page_goto(browser, vp);
  }

  async function page_goto(browser, vp) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/?side=bride&lang=en`, { waitUntil: "networkidle" });

    // --- screenshot the top (hero) region ---
    const hero = page.locator("#hero-heading");
    await hero.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT, `section1-hero-${vp.name}.png`) });

    // --- ornament presence ---
    const owns = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("svg")];
      const globalIds = svgs.flatMap((s) => [...s.querySelectorAll("[id]")].map((e) => e.id));
      const duplicateIds = globalIds.filter((id, i) => globalIds.indexOf(id) !== i);
      // per-svg: every url(#x) must reference an id inside the same svg
      const orphans = [];
      for (const s of svgs) {
        const local = new Set([...s.querySelectorAll("[id]")].map((e) => e.id));
        const body = s.outerHTML;
        const refs = [...body.matchAll(/url\(#([a-zA-Z0-9_-]+)\)/g)].map((m) => m[1]);
        for (const r of new Set(refs)) if (!local.has(r)) orphans.push(r);
      }
      return { duplicateIds, orphans, svgCount: svgs.length };
    });
    if (owns.duplicateIds.length)
      problems.push(`${vp.name}: duplicate svg ids: ${owns.duplicateIds.join(",")}`);
    if (owns.orphans.length)
      problems.push(`${vp.name}: unresolved url(#) refs: ${[...new Set(owns.orphans)].join(",")}`);

    // --- overflow ---
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (overflow > 1) problems.push(`${vp.name}: horizontal overflow ${overflow}px`);

    // --- single h1 + correct name order (bride first) ---
    const h1s = await page.locator("h1").allTextContents();
    const fh1 = h1s.join("|");
    if (h1s.length !== 1) problems.push(`${vp.name}: expected 1 h1, got ${h1s.length}`);
    if (!/Sanjukta/i.test(fh1)) problems.push(`${vp.name}: bride's name not first in h1`);

    console.log(
      `[${vp.name}] svgs=${owns.svgCount} dupIds=${owns.duplicateIds.length} orphans=${owns.orphans.length} overflow=${overflow}px h1="${fh1}"  screenshot=section1-hero-${vp.name}.png`
    );
    await context.close();
  }

  await browser.close();
  console.log(problems.length ? `\nPROBLEMS:\n- ${problems.join("\n- ")}` : "\nHERO OK");
  process.exit(problems.length ? 1 : 0);
})();
