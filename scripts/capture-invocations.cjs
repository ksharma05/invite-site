const { chromium } = require('playwright');
const path = require('path');

const chromePath = 'C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';
const artifactDir = 'C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e';
const targetUrl = 'http://localhost:3000/?side=bride&lang=en';

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await desktop.waitForTimeout(2000);

  const invocationsEl = await desktop.$('section[aria-label="Auspicious Invocations and Blessings"]');
  if (invocationsEl) {
    await invocationsEl.scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(1000);
    await invocationsEl.screenshot({ path: path.join(artifactDir, 'desktop-invocations-elevated.png') });
  }

  await desktop.close();

  // 2. Mobile
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await mobile.waitForTimeout(2000);

  const mobileInvocationsEl = await mobile.$('section[aria-label="Auspicious Invocations and Blessings"]');
  if (mobileInvocationsEl) {
    await mobileInvocationsEl.scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(1000);
    await mobileInvocationsEl.screenshot({ path: path.join(artifactDir, 'mobile-invocations-elevated.png') });
  }

  await mobile.close();
  await browser.close();

  console.log('Auspicious Invocations screenshots captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
