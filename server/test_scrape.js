const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.fragrantica.com/perfume/Dior/Sauvage-31861.html'; // Example URL
    console.log(`Testing scrape for: ${url}`);

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.google.com/',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            }
        });

        const $ = cheerio.load(response.data);

        const name = $('h1[itemprop="name"]').text().replace(/for women and men/i, '').trim();
        const image = $('img[itemprop="image"]').attr('src');
        let description = $('div[itemprop="description"]').text().trim();
        const rating = $('span[itemprop="ratingValue"]').text().trim();

        let gender = "Unisex";
        const titleText = $('h1[itemprop="name"]').text();
        if (titleText.includes("for women")) gender = "Female";
        if (titleText.includes("for men") && !titleText.includes("for women")) gender = "Male";

        const notesList = [];
        $('.accord-bar').each((i, el) => {
            notesList.push($(el).text().trim());
        });
        const notes = notesList.join(', ');

        let perfumer = "Master Perfumer";
        const perfumerSelectors = [
            'div[itemprop="brand"] a',
            '.perfumer-avatar + a',
            'a[href*="/noses/"]',
            'div:contains("Perfumer:") + a',
            'p:contains("Nose:") a'
        ];

        for (const selector of perfumerSelectors) {
            const found = $(selector).first().text().trim();
            if (found && found.length > 0 && found !== "Master Perfumer") {
                perfumer = found;
                break;
            }
        }

        console.log('--- Scraped Data ---');
        console.log('Name:', name);
        console.log('Image:', image);
        console.log('Rating:', rating);
        console.log('Gender:', gender);
        console.log('Notes:', notes);
        console.log('Perfumer:', perfumer);
        console.log('Description Length:', description.length);

    } catch (error) {
        console.error('Scraping failed:', error.message);
    }
}

testScrape();
