const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  try {
    console.log("Navigating to page...");
    await page.goto('https://www.fragrantica.com/perfume/Maison-Francis-Kurkdjian/Baccarat-Rouge-540-33519.html', { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    fs.writeFileSync('debug_desc_page.html', content);
    console.log("Page content saved to debug_desc_page.html");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await browser.close();
  }
})();
