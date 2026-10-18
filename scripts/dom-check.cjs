const { chromium } = require("playwright");
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:3150";

function contrastRatio(rgb1, rgb2) {
  const lum = ([r, g, b]) => {
    const ch = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const l1 = lum(rgb1);
  const l2 = lum(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function parseRgb(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  return [parts[0], parts[1], parts[2]];
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const targets = [
    "?side=bride&lang=en",
    "?side=bride&lang=hi",
    "?side=groom&lang=en",
    "?side=groom&lang=hi",
    "",
  ];
  const problems = [];
  for (const q of targets) {
    await page.goto(`${BASE}/${q}`, { waitUntil: "networkidle" });
    const r = await page.evaluate(() => {
      const cs = getComputedStyle;
      const root = document.documentElement;
      const body = document.body;
      const h1 = document.querySelector("h1");
      const h1cs = h1 && cs(h1);
      const headingText = h1 ? h1.textContent.trim().replace(/\s+/g, " ").slice(0, 50) : "";
      const links = [...document.querySelectorAll("main a")].map((a) => ({
        t: a.textContent.trim().slice(0, 24),
        h: a.getAttribute("href"),
      }));
      return {
        lang: root.lang,
        theme: root.getAttribute("data-theme"),
        headingFont: (h1cs && h1cs.fontFamily) || "",
        bodyFont: cs(body).fontFamily,
        inkColor: cs(body).color,
        surfaceColor: cs(body).backgroundColor,
        h1Color: (h1cs && h1cs.color) || "",
        headingText,
        links,
        title: document.title,
        hasSkipLink: !!document.querySelector('a[href="#main-content"]'),
        mainHeadingLevel: h1 ? h1.tagName : null,
      };
    });
    const ink = parseRgb(r.inkColor);
    const surf = parseRgb(r.surfaceColor);
    const ratio = ink && surf ? contrastRatio(ink, surf) : null;
    const line = `${q || "(chooser)"}: lang=${r.lang} theme=${r.theme} h1="${r.headingText}" bodyFont=${r.bodyFont.slice(0, 40)} ink/surf contrast=${ratio ? ratio.toFixed(2) : "?"} skipLink=${r.hasSkipLink}`;
    console.log(line);
    if (r.lang !== (q.includes("lang=hi") ? "hi" : "en")) problems.push(`${q}: wrong lang`);
    if (r.theme !== "terracotta") problems.push(`${q}: wrong theme`);
    if (ratio !== null && ratio < 4.5)
      problems.push(`${q}: body contrast ${ratio.toFixed(2)} < 4.5`);
    if (!r.hasSkipLink) problems.push(`${q}: no skip link`);
  }
  await b.close();
  if (problems.length) {
    console.error("\nPROBLEMS:");
    problems.forEach((p) => console.error(" - " + p));
    process.exitCode = 1;
  } else {
    console.log("\nAll DOM/contrast checks passed.");
  }
})();
