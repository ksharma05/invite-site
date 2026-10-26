const { chromium } = require("playwright");
const path = require("node:path");

const BASE = "http://localhost:3000";
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const OUT = "C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e";

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  const viewports = [
    {
      name: "wedding-desktop-1280-en",
      width: 1280,
      height: 900,
      isMobile: false,
      url: `${BASE}/?side=bride&lang=en`,
    },
    {
      name: "wedding-desktop-1280-hi",
      width: 1280,
      height: 900,
      isMobile: false,
      url: `${BASE}/?side=bride&lang=hi`,
    },
    {
      name: "wedding-mobile-390-en",
      width: 390,
      height: 844,
      isMobile: true,
      url: `${BASE}/?side=bride&lang=en`,
    },
    {
      name: "wedding-mobile-360-en",
      width: 360,
      height: 800,
      isMobile: true,
      url: `${BASE}/?side=bride&lang=en`,
    },
    {
      name: "wedding-mobile-360-hi",
      width: 360,
      height: 800,
      isMobile: true,
      url: `${BASE}/?side=bride&lang=hi`,
    },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
    });
    await page.goto(vp.url, { waitUntil: "networkidle" });
    const weddingCard = page.locator('li[data-event-id="wedding-ceremony"]');
    await weddingCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await weddingCard.screenshot({ path: path.join(OUT, `${vp.name}.png`) });
    await page.close();
    console.log(`Captured ${vp.name}`);
  }

  await browser.close();
  console.log("Captured Wedding Ceremony cards successfully!");
})();
