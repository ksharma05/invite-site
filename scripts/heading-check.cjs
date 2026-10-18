const { chromium } = require("playwright");
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3151/?side=bride&lang=en", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const h2 = document.querySelector("h2");
    const cal = [...document.querySelectorAll('a[href*="calendar.google.com"]')].length;
    const map = [...document.querySelectorAll('a[target="_blank"]')].length;
    const ornament = document.body.textContent.includes("❧");
    return {
      h1Font: getComputedStyle(h1).fontFamily.slice(0, 50),
      h2Font: getComputedStyle(h2).fontFamily.slice(0, 50),
      calLinks: cal,
      externalLinks: map,
      ornament,
      nameOrder: h1.textContent.trim(),
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
