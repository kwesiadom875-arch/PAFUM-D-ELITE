require('dotenv').config({ path: '../.env' });
const { callAI } = require('../services/aiHelpers');

async function testShortener() {
  const description = `
    Baccarat Rouge 540 is a unisex chypre fragrance released in 2015. 
    Francis Kurkdjian created this perfume. 
    Top notes are Saffron and Jasmine; middle notes are Amberwood and Ambergris; base notes are Fir Resin and Cedar.
    Jomashop Cyberweek Sale Up To 80% OffSponsoredRead about this perfume in other languages: Deutsch, Español, Français, Čeština, Italiano, Русский, Polski, Português, Ελληνικά, 汉语, Nederlands, Srpski, Română, العربية, Українська, Монгол, עברית.
  `;

  console.log("Original Description Length:", description.length);

  try {
    const systemPrompt = "You are a luxury perfume copywriter. Shorten perfume descriptions to 2-3 elegant sentences (max 150 words). Remove unnecessary details, keep only the essence, mood, and key notes. Be poetic but concise.";
    const userMessage = `Shorten this perfume description:\n\n${description}`;
    
    console.log("Calling AI...");
    const aiResponse = await callAI(systemPrompt, userMessage, 0.7, 200);
    console.log("\nAI Response:");
    console.log(aiResponse);
  } catch (error) {
    console.error("AI Error:", error);
  }
}

testShortener();
