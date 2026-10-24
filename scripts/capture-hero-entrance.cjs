const { chromium } = require("playwright");
const path = require("path");

const chromePath =
  "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const artifactDir = "C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e";
const targetUrl = "http://localhost:3000/?side=bride&lang=en";

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop - 1280x800
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktop.goto(targetUrl, { waitUntil: "networkidle" });
  await desktop.waitForTimeout(1000);

  // Initial frame (unobstructed video)
  await desktop.screenshot({ path: path.join(artifactDir, "hero-desktop-initial.png") });

  // Scroll to pin track midpoint (~400px down) to bring card to center
  await desktop.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await desktop.waitForTimeout(1000);
  await desktop.screenshot({ path: path.join(artifactDir, "hero-desktop-card-locked.png") });

  // Scroll further down to Events section to verify controls remain fixed on viewport
  await desktop.evaluate(() => window.scrollTo({ top: 2000, behavior: "instant" }));
  await desktop.waitForTimeout(1000);
  await desktop.screenshot({ path: path.join(artifactDir, "section-desktop-controls-fixed.png") });

  await desktop.close();

  // 2. Mobile - 390x844 (iPhone 14)
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(targetUrl, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(1000);

  // Initial mobile frame (unobstructed video)
  await mobile.screenshot({ path: path.join(artifactDir, "hero-mobile-initial.png") });

  // Scroll mobile to pin track midpoint to bring card to center
  await mobile.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await mobile.waitForTimeout(1000);
  await mobile.screenshot({ path: path.join(artifactDir, "hero-mobile-card-locked.png") });

  await mobile.close();
  await browser.close();

  console.log("Fixed controls & hero entrance screenshots captured successfully!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
