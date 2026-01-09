require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Support both GOOGLE_API_KEY and GEMINI_API_KEY
const googleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!googleKey) {
  console.error("❌ No API Key found in environment variables.");
  process.exit(1);
}

console.log(`Using API Key: ${googleKey.substring(0, 5)}...`);

async function listModels() {
  try {
    // Direct REST API call to be sure, as SDK might hide things or I might not know the exact method name offhand
    // Node 18+ has global fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.models) {
        console.log("\n✅ Available Models:");
        data.models.forEach(model => {
            if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                 console.log(`- ${model.name.replace('models/', '')} (${model.displayName})`);
            }
        });
    } else {
        console.log("No models found in response:", data);
    }

  } catch (error) {
    console.error("❌ Error listing models:", error.message);
    if (error.cause) console.error(error.cause);
  }
}

listModels();
