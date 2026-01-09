const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.fragrantica.com/perfume/Dior/Sauvage-31861.html';
    console.log(`Testing Puppeteer scrape for: ${url}`);

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--no-zygote",
                "--disable-gpu"
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const content = await page.content();
        const $ = cheerio.load(content);

        const name = $('h1[itemprop="name"]').text().replace(/for women and men/i, '').trim();
        console.log('Scraped Name:', name);

        await browser.close();
        console.log('Success!');

    } catch (error) {
        console.error('Puppeteer failed:', error);
    }
}

testScrape();
