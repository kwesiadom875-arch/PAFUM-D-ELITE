const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Groq = require("groq-sdk");

// Initialize Groq SDK (Re-using the same initialization pattern)
const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: apiKey });

exports.scrapeFragrantica = async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('fragrantica.com')) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // Launch Puppeteer with args for Render/Production compatibility
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
    
    // Set a realistic User Agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Optimize: Block images/fonts to speed up
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
    
    // Enhanced perfumer extraction - try multiple selectors
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

    // AI Description Shortening
    if (description && description.length > 200) {
      try {
        const aiResponse = await groq.chat.completions.create({
          messages: [{
            role: "system",
            content: "You are a luxury perfume copywriter. Shorten perfume descriptions to 2-3 elegant sentences (max 150 words). Remove unnecessary details, keep only the essence, mood, and key notes. Be poetic but concise."
          }, {
            role: "user",
            content: `Shorten this perfume description:\n\n${description}`
          }],
          model: "llama-3.3-70b-versatile",
          max_tokens: 200
        });
        description = aiResponse.choices[0]?.message?.content || description;
      } catch (aiError) {
        console.error("AI description shortening failed:", aiError);
        // Fallback: just truncate
        description = description.substring(0, 200) + '...';
      }
    }

    const data = { name, image, description, notes, perfumer, rating, gender };

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error("Scraping Error:", error);
    res.status(500).json({ error: "Failed to scrape data" });
  }
};
