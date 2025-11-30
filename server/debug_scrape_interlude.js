const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.fragrantica.com/perfume/Amouage/Interlude-Man-15294.html';
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
                "--disable-gpu"
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const content = await page.content();
        const $ = cheerio.load(content);

        // Debugging Selectors
        const name = $('h1[itemprop="name"]').text().trim();
        const image = $('img[itemprop="image"]').attr('src');
        const description = $('div[itemprop="description"]').text().trim();
        const rating = $('span[itemprop="ratingValue"]').text().trim();
        
        console.log('--- Raw Extraction ---');
        console.log('Name Selector (h1[itemprop="name"]):', name);
        console.log('Image Selector (img[itemprop="image"]):', image);
        console.log('Description Length:', description.length);
        console.log('Rating:', rating);

        // Accords
        const notesList = [];
        $('.accord-bar').each((i, el) => {
            notesList.push($(el).text().trim());
        });
        console.log('Accords Found:', notesList.length);
        console.log('Accords:', notesList.join(', '));

        // Perfumer
        let perfumer = "Master Perfumer";
        const perfumerSelectors = [
            'div[itemprop="brand"] a',
            '.perfumer-avatar + a',
            'a[href*="/noses/"]',
            'div:contains("Perfumer:") + a',
            'p:contains("Nose:") a'
        ];
        
        // Brand Extraction - Try 2
        let brand = $('span[itemprop="brand"] span[itemprop="name"]').text().trim(); // Microdata
        if (!brand) {
            // Fallback: Parse from Title "Name Brand for..."
            const title = $('h1[itemprop="name"]').text().trim();
            // Heuristic: Usually "Name Brand for gender"
            // We can try to extract if we know the name
            // Or look for the link to the brand page
            const brandLink = $('p > a[href^="/designers/"]').first();
            if (brandLink.length) brand = brandLink.text().trim();
        }
        console.log('Brand (Refined):', brand);

        // Pyramid Notes Extraction - Header Debug
        console.log('--- Pyramid Header Debug ---');
        
        const knownNote = $('*:contains("Oregano")').last();
        if (knownNote.length) {
            const noteContainer = knownNote.parent().parent(); // The flex container of notes
            console.log('Note Container Tag:', noteContainer.get(0).tagName);
            
            // Check previous siblings for headers
            const prev1 = noteContainer.prev();
            console.log('Prev Sibling 1:', prev1.get(0)?.tagName, prev1.text());
            
            const prev2 = prev1.prev();
            console.log('Prev Sibling 2:', prev2.get(0)?.tagName, prev2.text());
            
            // Check Parent 3 text again
            console.log('Parent 3 Text:', noteContainer.parent().text().substring(0, 300));
        }

        await browser.close();

    } catch (error) {
        console.error('Puppeteer failed:', error);
    }
}

testScrape();
