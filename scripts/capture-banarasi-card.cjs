const { chromium } = require("playwright");
const path = require("node:path");

const BASE = "http://localhost:3000";
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const OUT = "C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e";

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  const captures = [
    {
      name: "banarasi-card-desktop-bride-en",
      url: `${BASE}/?side=bride&lang=en`,
      viewport: { width: 1280, height: 950 },
    },
    {
      name: "banarasi-card-desktop-groom-en",
      url: `${BASE}/?side=groom&lang=en`,
      viewport: { width: 1280, height: 950 },
    },
    {
      name: "banarasi-card-desktop-bride-hi",
      url: `${BASE}/?side=bride&lang=hi`,
      viewport: { width: 1280, height: 950 },
    },
    {
      name: "banarasi-card-mobile-bride-en",
      url: `${BASE}/?side=bride&lang=en`,
      viewport: { width: 390, height: 844 },
      isMobile: true,
    },
    {
      name: "banarasi-card-mobile-groom-en",
      url: `${BASE}/?side=groom&lang=en`,
      viewport: { width: 390, height: 844 },
      isMobile: true,
    },
  ];

  for (const c of captures) {
    const page = await browser.newPage({ viewport: c.viewport, isMobile: !!c.isMobile });
    await page.goto(c.url, { waitUntil: "networkidle" });

    // Scroll to the host card
    const hostCard = page.locator('section[aria-labelledby="host-heading"]');
    await hostCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Capture element screenshot
    await hostCard.screenshot({ path: path.join(OUT, `${c.name}-element.png`) });

    // Also capture context screenshot (in viewport)
    await page.screenshot({ path: path.join(OUT, `${c.name}-viewport.png`) });

    await page.close();
    console.log(`Captured ${c.name}`);
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
})();
