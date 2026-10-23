const { chromium } = require('playwright');
const path = require('path');

const chromePath = 'C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';
const artifactDir = 'C:/Users/singh/.gemini/antigravity/brain/abf9615d-9139-4bd9-8d84-362bce09b28e';
const targetUrl = 'http://localhost:3001/?side=bride&lang=en';

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop Lightbox
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  const galleryEl = await page.$('section[aria-label="Sacred Memories in Kashi"]');
  if (galleryEl) {
    await galleryEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    // Click the 2nd photo card
    const cards = await page.$$('section[aria-label="Sacred Memories in Kashi"] .cursor-pointer');
    if (cards[1]) {
      await cards[1].click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(artifactDir, 'gallery-desktop-lightbox.png') });
    }
  }
  await page.close();

  // 2. Mobile Viewport (iPhone 14)
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(targetUrl, { waitUntil: 'networkidle' });

  const mobileGallery = await mobile.$('section[aria-label="Sacred Memories in Kashi"]');
  if (mobileGallery) {
    await mobileGallery.scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(800);
    await mobile.screenshot({ path: path.join(artifactDir, 'gallery-mobile.png') });
  }

  await mobile.close();
  await browser.close();
  console.log('Gallery Lightbox & Mobile screenshots captured!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
