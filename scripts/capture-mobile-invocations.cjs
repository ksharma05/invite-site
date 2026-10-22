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

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await mobile.waitForTimeout(1500);

  const mobileInvocationsEl = await mobile.$('section[aria-label="Auspicious Invocations and Blessings"]');
  if (mobileInvocationsEl) {
    await mobileInvocationsEl.scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(1000);
    await mobileInvocationsEl.screenshot({ path: path.join(artifactDir, 'mobile-invocations-elevated.png') });
  }

  await mobile.close();
  await browser.close();

  console.log('Mobile Auspicious Invocations screenshot captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
