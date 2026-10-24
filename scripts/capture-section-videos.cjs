const { chromium } = require("playwright");
const path = require("path");

const chromePath =
  "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const artifactDir = "C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e";
const targetUrl = "http://localhost:3000/?side=groom&lang=en";

async function capture() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop View (1280x800)
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto(targetUrl, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(2000);

  // Desktop Hero
  await desktopPage.screenshot({ path: path.join(artifactDir, "section-desktop-hero.png") });

  // Scroll down to Invocations
  await desktopPage.evaluate(() => window.scrollTo(0, 850));
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(artifactDir, "section-desktop-invocations.png") });

  // Scroll down to Events & Kashi Dawn
  await desktopPage.evaluate(() => window.scrollTo(0, 1800));
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(artifactDir, "section-desktop-events.png") });

  await desktopPage.close();

  // 2. Mobile View (390x844 - iPhone 14)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(targetUrl, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(2000);

  // Mobile Hero
  await mobilePage.screenshot({ path: path.join(artifactDir, "section-mobile-hero.png") });

  // Mobile Invocations
  await mobilePage.evaluate(() => window.scrollTo(0, 850));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(artifactDir, "section-mobile-invocations.png") });

  // Mobile Events & Kashi Dawn
  await mobilePage.evaluate(() => window.scrollTo(0, 2050));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(artifactDir, "section-mobile-events.png") });

  await mobilePage.close();
  await browser.close();
  console.log("Screenshots captured with side=groom&lang=en successfully!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
