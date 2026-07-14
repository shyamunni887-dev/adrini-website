const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Inject CSS to make the invisible button red
  await page.goto('file:///Users/shyam/Documents/adrini.com/index.html');
  await page.addStyleTag({ content: '.hero-btn { background: rgba(255, 0, 0, 0.4) !important; opacity: 1 !important; }' });
  
  await page.screenshot({ path: 'hero_btn_overlay.jpg' });
  await browser.close();
})();
