const { chromium } = require("playwright");
const path = require("path");

const chromePath =
  "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const artifactDir = "C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e";
const targetUrl = "http://localhost:3001/?side=bride&lang=en";

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop - 1280x900
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(targetUrl, { waitUntil: "networkidle" });
  await desktop.waitForTimeout(1000);

  // Scroll to events heading
  const heading = await desktop.$("#events-heading");
  if (heading) {
    await heading.scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(800);
    await desktop.screenshot({ path: path.join(artifactDir, "itinerary-desktop-event1.png") });
  }

  // Scroll down by 340px to bring Mehendi into center focus
  await desktop.evaluate(() => window.scrollBy({ top: 340, behavior: "instant" }));
  await desktop.waitForTimeout(800);
  await desktop.screenshot({ path: path.join(artifactDir, "itinerary-desktop-event2.png") });

  // Scroll down another 340px for Sangeet
  await desktop.evaluate(() => window.scrollBy({ top: 340, behavior: "instant" }));
  await desktop.waitForTimeout(800);
  await desktop.screenshot({ path: path.join(artifactDir, "itinerary-desktop-event3.png") });

  await desktop.close();

  // 2. Mobile - 390x844 (iPhone 14)
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(targetUrl, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(1000);

  const mobileHeading = await mobile.$("#events-heading");
  if (mobileHeading) {
    await mobileHeading.scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(800);
    await mobile.screenshot({ path: path.join(artifactDir, "itinerary-mobile-event1.png") });
  }

  // Scroll mobile by 350px
  await mobile.evaluate(() => window.scrollBy({ top: 350, behavior: "instant" }));
  await mobile.waitForTimeout(800);
  await mobile.screenshot({ path: path.join(artifactDir, "itinerary-mobile-event2.png") });

  await mobile.close();
  await browser.close();

  console.log("Itinerary screenshots captured successfully!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
