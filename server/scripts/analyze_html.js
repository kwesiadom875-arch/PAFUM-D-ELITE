const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('debug_page.html', 'utf8');
const $ = cheerio.load(html);

let output = "--- ANALYSIS START ---\n";

// Check for .accord-bar
const accordBars = $('.accord-bar');
output += `Number of .accord-bar elements: ${accordBars.length}\n`;

// Find 'woody'
$('*').each((i, el) => {
    const text = $(el).clone().children().remove().end().text().trim();
    if (text.toLowerCase() === 'woody') {
        output += `\nFound 'woody' in tag: ${el.tagName}\n`;
        output += `Classes: ${$(el).attr('class')}\n`;
        
        let path = el.tagName;
        let parent = $(el).parent();
        while (parent.length && parent.get(0).tagName !== 'body') {
            let name = parent.get(0).tagName;
            if (parent.attr('class')) name += `.${parent.attr('class').split(' ').join('.')}`;
            if (parent.attr('id')) name += `#${parent.attr('id')}`;
            path = `${name} > ${path}`;
            parent = parent.parent();
        }
        output += `Path: ${path}\n`;
    }
});

output += "--- ANALYSIS END ---\n";
fs.writeFileSync('analysis_result.txt', output);
console.log("Analysis written to analysis_result.txt");
