const { chromium } = require('playwright');

const chromePath = 'C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';

(async () => {
  const b = await chromium.launch({ executablePath: chromePath, headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  
  await p.goto('http://localhost:3000/?side=bride&lang=en', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);

  const beforeScroll = await p.evaluate(() => {
    const spacer = document.querySelector('.pin-spacer');
    const header = document.querySelector('header');
    const main = document.querySelector('#main-content');
    return {
      spacerStyle: spacer?.getAttribute('style'),
      spacerHeight: spacer?.getBoundingClientRect().height,
      mainTopBeforeScroll: main?.getBoundingClientRect().top,
    };
  });
  console.log('Before scroll:', beforeScroll);

  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(500);

  const afterScroll = await p.evaluate(() => {
    const spacer = document.querySelector('.pin-spacer');
    const header = document.querySelector('header');
    const main = document.querySelector('#main-content');
    return {
      scrollY: window.scrollY,
      spacerRect: spacer?.getBoundingClientRect(),
      headerRect: header?.getBoundingClientRect(),
      mainRect: main?.getBoundingClientRect(),
    };
  });
  console.log('After scroll (400px):', afterScroll);

  await b.close();
})();
