const Groq = require("groq-sdk");
const Product = require('../models/Product');

// Initialize Groq SDK
// Ensure API Key is present. If not, log a warning but don't crash immediately.
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GROQ_API_KEY is missing in environment variables. AI features will fail.");
}

const groq = new Groq({
  apiKey: apiKey
});

exports.chatJosie = async (req, res) => {
  const { userMessage, history } = req.body;
  
  try {
    // 1. Prepare the Inventory String
    const products = await Product.find();
    const inventory = products.map(p => 
      `[ID: ${p.id}] Name: ${p.name} | Category: ${p.category} | Price: GH₵${p.price} | Notes: ${p.notes} | Desc: ${p.description}`
    ).join('\n');

    const systemPrompt = `
      You are **Josie**, the Senior Scent Sommelier and Concierge for **Parfum D'Elite**, a luxury fragrance house in Accra, Ghana.
      
      **YOUR GOAL:** To guide users to the perfect scent using your deep knowledge of olfactory notes, the local climate (Accra heat), and their personal "vibe." You do not just chat; you **curate experiences**.

      **YOUR PERSONALITY:**
      - **Tone:** Sophisticated, witty, knowledgeable, and slightly exclusive (think "Vogue Editor" meets "Best Friend").
      - **Vocabulary:** Use sensory words (e.g., "opulent," "effervescent," "gourmand," "dry-down").
      - **Honesty:** If a user suggests a heavy Oud for a beach day in 35°C heat, politely warn them.
      - **Style:** Do NOT use emojis. Use elegant language only.

      **YOUR INVENTORY:**
      You have access to the following "Parfum D'Elite" collection:
      ${inventory}

      **CRITICAL OUTPUT RULES (GENERATIVE UI):**
      You must **NEVER** return plain text. You must **ALWAYS** return a valid JSON object. 
      Your response must follow one of these 3 structures based on the user's intent:

      ---
      
      **SCENARIO 1: General Chat / Clarification**
      (Use this when asking follow-up questions or greeting)
      {
        "type": "text",
        "data": {
          "message": "Your sophisticated, witty response goes here."
        }
      }

      **SCENARIO 2: Recommendation (The "Product Card")**
      (Use this when you have found a specific perfume that matches their request)
      {
        "type": "recommendation",
        "data": {
          "message": "A brief, persuasive intro about why this is the one.",
          "product": {
            "id": 123, // Must match the ID in the Inventory list
            "name": "Dior Sauvage Elixir",
            "reason": "The spicy nutmeg top notes will cut through the Accra humidity perfectly."
          }
        }
      }

      **SCENARIO 3: Comparison (The "Bento Grid")**
      (Use this when the user is torn between two options or asks for "something like X but lighter")
      {
        "type": "comparison",
        "data": {
          "message": "An excellent dilemma. Let us weigh the notes.",
          "products": [
            { "id": 1, "name": "Good Girl", "trait": "Sweet & Floral" },
            { "id": 6, "name": "Black Orchid", "trait": "Dark & Earthy" }
          ]
        }
      }

      ---

      **IMPORTANT CONSTRAINTS:**
      1. Only recommend products from the provided Inventory list.
      2. Ensure the JSON is valid and minified (no markdown formatting like \`\`\`json).
      3. If the user asks for something we don't have, suggest the closest alternative from our collection with a persuasive "pivot."
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      // CRITICAL: This forces the AI to actually obey the JSON format
      response_format: { type: "json_object" } 
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content);
    res.json(aiResponse);

  } catch (error) {
    console.error("AI Error:", error);
    // Fallback JSON response in case of error
    res.json({ 
      type: "text", 
      data: { 
        message: "I am currently meditating on the complexities of Oud. Please ask again." 
      } 
    });
  }
};

exports.scentDiscovery = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const systemPrompt = `
      You are an AI scent expert. Your task is to analyze a user's query and extract key fragrance characteristics.
      Return a JSON object with a single key "keywords" which is an array of strings.
      The keywords should be single words or short phrases that can be used to search a perfume database.
      For example, if the user says "I want something that smells like a walk in a pine forest after the rain",
      you should return {"keywords": ["pine", "earthy", "fresh", "petrichor"]}.
    `;

    console.log("Scent Discovery Query:", query);
    
    // Use the same model as Josie for consistency
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    console.log("AI Response:", completion.choices[0]?.message?.content);
    const aiResponse = JSON.parse(completion.choices[0]?.message?.content);
    const keywords = aiResponse.keywords || [];

    if (keywords.length === 0) {
      return res.json([]);
    }

    const searchRegex = new RegExp(keywords.join('|'), 'i');

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { notes: searchRegex },
        { category: searchRegex }
      ]
    }).limit(10);

    res.json(products);

  } catch (error) {
    console.error("AI Scent Discovery Error:", error);
    // Return a more descriptive error if possible, but keep 500 for server issues
    res.status(500).json({ error: "Failed to discover scents. " + error.message });
  }
};

exports.enrichAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const results = [];

    // Process sequentially to avoid rate limits (or use Promise.all with concurrency limit for larger datasets)
    for (const product of products) {
      // Skip if already enriched (optional, but good for performance)
      // For now, we'll re-enrich to ensure data quality or if fields are missing
      
      const systemPrompt = `
        You are a perfume database expert. Analyze the perfume details and return a JSON object with the following fields:
        - brand: The brand name (e.g. "Dior", "Tom Ford"). Infer from name if possible.
        - concentration: "Eau de Parfum", "Eau de Toilette", "Parfum", or "Unknown".
        - gender: "Male", "Female", or "Unisex".
        - origin: Country of origin (e.g. "France", "Italy", "USA"). Best guess.
        - season: Best season to wear (e.g. "Winter", "Summer", "All Year").
        
        Input Product: ${product.name} - ${product.description}
      `;

      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "system", content: systemPrompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });

        const enrichedData = JSON.parse(completion.choices[0]?.message?.content);
        
        // Update product
        product.brand = enrichedData.brand || product.brand || "Unknown";
        product.concentration = enrichedData.concentration || product.concentration || "Eau de Parfum";
        product.gender = enrichedData.gender || product.gender || "Unisex";
        product.origin = enrichedData.origin || product.origin || "France";
        product.season = enrichedData.season || product.season || "All Year";
        
        await product.save();
        results.push({ id: product._id, name: product.name, ...enrichedData });
        
      } catch (aiError) {
        console.error(`Failed to enrich product ${product.name}:`, aiError);
        // Continue to next product
      }
    }

    res.json({ results });

  } catch (error) {
    console.error("Batch Enrichment Error:", error);
    res.status(500).json({ error: "Failed to enrich products." });
  }
};
