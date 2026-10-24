const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const BASE = "http://localhost:3000";
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const OUT = "C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e";

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  // 1. Desktop full content capture
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/?side=bride&lang=en`, { waitUntil: "networkidle" });

    // Scroll past hero into main content
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, "elevated-desktop-invocations.png") });

    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, "elevated-desktop-events.png") });

    await page.evaluate(() => window.scrollTo(0, 3600));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, "elevated-desktop-events-full.png") });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, "elevated-desktop-footer-bottom.png") });
    await page.close();
  }

  // 2. Mobile capture
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await page.goto(`${BASE}/?side=bride&lang=en`, { waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, "elevated-mobile-footer-bottom.png") });

    await page.close();
  }

  await browser.close();
  console.log("Captured elevated section screenshots successfully!");
})();
