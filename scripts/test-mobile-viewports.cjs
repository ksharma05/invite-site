const { chromium } = require("playwright");
const path = require("node:path");

const BASE = "http://localhost:3000";
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const OUT = "C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e";

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  const viewports = [
    {
      name: "mobile-360-bride-en",
      width: 360,
      height: 800,
      isMobile: true,
      url: `${BASE}/?side=bride&lang=en`,
    },
    {
      name: "mobile-360-groom-en",
      width: 360,
      height: 800,
      isMobile: true,
      url: `${BASE}/?side=groom&lang=en`,
    },
    {
      name: "mobile-360-bride-hi",
      width: 360,
      height: 800,
      isMobile: true,
      url: `${BASE}/?side=bride&lang=hi`,
    },
    {
      name: "mobile-375-iphoneSE",
      width: 375,
      height: 667,
      isMobile: true,
      url: `${BASE}/?side=bride&lang=en`,
    },
    {
      name: "mobile-390-iphone14",
      width: 390,
      height: 844,
      isMobile: true,
      url: `${BASE}/?side=bride&lang=en`,
    },
    {
      name: "desktop-1280-bride-en",
      width: 1280,
      height: 950,
      isMobile: false,
      url: `${BASE}/?side=bride&lang=en`,
    },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
    });
    await page.goto(vp.url, { waitUntil: "networkidle" });
    const card = page.locator('section[aria-labelledby="host-heading"]');
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await card.screenshot({ path: path.join(OUT, `optimized-${vp.name}.png`) });
    await page.close();
    console.log(`Captured ${vp.name}`);
  }

  await browser.close();
  console.log("All viewports captured successfully!");
})();
