const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('debug_desc_page.html', 'utf8');
const $ = cheerio.load(html);

console.log("--- ANALYSIS START ---");

// Search for the specific description text
const searchText = "Baccarat Rouge 540 by Maison Francis Kurkdjian is a Oriental Floral fragrance";
console.log(`Searching for text starting with: "${searchText}"...`);

$('*').each((i, el) => {
    const text = $(el).clone().children().remove().end().text().trim();
    if (text.includes(searchText)) {
        console.log(`\nFound text in tag: ${el.tagName}`);
        console.log(`Classes: ${$(el).attr('class')}`);
        console.log(`Itemprop: ${$(el).attr('itemprop')}`);
        
        let path = el.tagName;
        let parent = $(el).parent();
        while (parent.length && parent.get(0).tagName !== 'body') {
            let name = parent.get(0).tagName;
            if (parent.attr('class')) name += `.${parent.attr('class').split(' ').join('.')}`;
            if (parent.attr('id')) name += `#${parent.attr('id')}`;
            path = `${name} > ${path}`;
            parent = parent.parent();
        }
        console.log(`Path: ${path}`);
    }
});

// Also check for itemprop="description"
const descElement = $('[itemprop="description"]');
if (descElement.length) {
    console.log(`\nFound element with itemprop="description":`);
    console.log(`Tag: ${descElement.get(0).tagName}`);
    console.log(`Classes: ${descElement.attr('class')}`);
    console.log(`Text content start: ${descElement.text().trim().substring(0, 50)}...`);
} else {
    console.log(`\nNo element found with itemprop="description"`);
}

console.log("--- ANALYSIS END ---");
