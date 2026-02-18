const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require('groq-sdk');
const OpenAI = require('openai');
const { getCachedResponse, cacheResponse } = require('./semanticCache');

// Initialize AI Clients
// Support both GOOGLE_API_KEY and GEMINI_API_KEY

// Lazy initialization for NVIDIA NIM (via OpenAI SDK)
let nvidia = null;
function getNvidiaClient() {
  if (!nvidia) {
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    if (!nvidiaKey) {
      console.warn("⚠️ NVIDIA_API_KEY is missing. NVIDIA NIM will be skipped.");
      return null;
    }
    console.log("✅ NVIDIA_API_KEY detected. Initializing NVIDIA NIM...");
    nvidia = new OpenAI({
      apiKey: nvidiaKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return nvidia;
}

// Lazy initialization for Google AI
let genAI = null;
let googleModel = null;

function getGoogleClient() {
  if (!genAI) {
    const googleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!googleKey) {
      console.warn("❌ GOOGLE_API_KEY is missing. Gemini will fail.");
      return null;
    }
    console.log("✅ GOOGLE_API_KEY / GEMINI_API_KEY detected. Gemini is ready.");
    genAI = new GoogleGenerativeAI(googleKey);
    // Use 'gemini-2.0-flash' which is confirmed to be available
    googleModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return googleModel;
}

// Lazy initialization for Groq to prevent crash if key is missing
let groq = null;
function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      console.warn("⚠️ GROQ_API_KEY is missing. Fallback will not work.");
      return null;
    }
    console.log("✅ GROQ_API_KEY detected. Initializing Groq fallback...");
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

/**
 * Centralized AI API wrapper (NVIDIA NIM -> Google Gemini -> Groq Fallback)
 * @param {string} systemPrompt - System instruction for the AI
 * @param {string} userMessage - User's message/query
 * @param {number} temperature - Creativity level (0.0-1.0)
 * @param {number} maxTokens - Maximum response length
 * @param {boolean} jsonMode - Whether to enforce JSON output
 * @returns {Promise<string>} - AI response content
 */
async function callAI(systemPrompt, userMessage, temperature = 0.7, maxTokens = 500, jsonMode = false) {

  // 0. Check Semantic Cache
  // We combine system prompt and user message for the cache key to ensure context matches
  const uniqueQuery = `${systemPrompt} ::: ${userMessage}`;

  if (!jsonMode) {
    const cached = await getCachedResponse(uniqueQuery);
    if (cached) {
      return cached;
    }
  }

  let responseText = "";

  // 1. Try NVIDIA NIM (Llama 3)
  try {
    const nvidiaClient = getNvidiaClient();
    if (nvidiaClient) {
      console.log("🤖 Attempting to generate response with NVIDIA NIM (Llama 3)...");

      const completion = await nvidiaClient.chat.completions.create({
        model: "meta/llama-3.3-70b-instruct",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: jsonMode ? { type: "json_object" } : undefined
      });

      console.log("✅ NVIDIA NIM success");
      responseText = completion.choices[0]?.message?.content || '';
      responseText = cleanAIResponse(responseText);

      // Cache the successful response
      if (!jsonMode && responseText) {
        cacheResponse(uniqueQuery, responseText);
      }

      return responseText;
    }
  } catch (nvidiaError) {
    console.warn('⚠️ NVIDIA NIM failed, switching to backup providers:', nvidiaError.message);
  }

  // 2. Try Google Gemini
  try {
    console.log("🤖 Attempting to generate response with Google Gemini...");
    const model = getGoogleClient();

    if (model) {
      const generationConfig = {
        temperature,
        maxOutputTokens: maxTokens,
      };

      if (jsonMode) {
        generationConfig.responseMimeType = "application/json";
      }

      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userMessage }] }
        ],
        generationConfig,
      });

      console.log("✅ Google Gemini success");
      responseText = result.response.text();
      responseText = cleanAIResponse(responseText);

      // Cache the successful response
      if (!jsonMode && responseText) {
        cacheResponse(uniqueQuery, responseText);
      }

      return responseText;
    }
  } catch (googleError) {
    console.warn('⚠️ Google AI failed, switching to Groq fallback:', googleError.message);
  }

  // 3. Fallback to Groq
  try {
    console.log("🤖 Attempting fallback with Groq...");
    const groqClient = getGroqClient();
    if (!groqClient) throw new Error("Groq client not available");

    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: "json_object" } : undefined
    });

    console.log("✅ Groq fallback success");
    responseText = completion.choices[0]?.message?.content || '';
    responseText = cleanAIResponse(responseText);

    // Cache the successful response
    if (!jsonMode && responseText) {
      cacheResponse(uniqueQuery, responseText);
    }

    return responseText;
  } catch (groqError) {
    console.error('❌ Groq AI Fallback Error:', groqError.message);
    throw new Error('AI service temporarily unavailable (All providers failed)');
  }
}

/**
 * Helper to clean AI response (remove markdown code blocks)
 * @param {string} text 
 * @returns {string}
 */
function cleanAIResponse(text) {
  if (!text) return "";
  // Remove ```json ... ``` or just ``` ... ```
  return text.replace(/```json\n?|\n?```/g, "").replace(/```\n?/g, "").trim();
}

// Backward compatibility alias
const callGroqAI = callAI;

/**
 * Extract fragrance notes from abstract description
 * @param {string} description - User's abstract scent description
 * @returns {Promise<string[]>} - Array of fragrance notes
 */
async function extractFragranceNotes(description) {
  const systemPrompt = `You are a master perfumer with expertise in fragrance composition. 
  Extract concrete fragrance notes from abstract descriptions.
  Return ONLY a comma-separated list of fragrance notes (e.g., "Vetiver, Leather, Oakmoss, Amber").
  Be specific and use industry-standard fragrance terminology.`;

  const userMessage = `Extract the fragrance notes that would best represent: "${description}"`;

  const response = await callAI(systemPrompt, userMessage, 0.3, 100);

  // Parse the response into an array
  return response.split(',').map(note => note.trim()).filter(note => note.length > 0);
}

/**
 * Generate personalized message for user communications
 * @param {Object} user - User object with orderHistory, tier, etc.
 * @param {Object} context - Additional context (products, recommendations, etc.)
 * @param {string} messageType - Type of message (TIER_UPGRADE, ANNIVERSARY, etc.)
 * @returns {Promise<string>} - Personalized message content
 */
async function generatePersonalizedMessage(user, context, messageType) {
  let systemPrompt = `You are an elegant personal fragrance concierge for Parfum D'Elite, 
  a luxury perfume house. Write sophisticated, personalized messages that feel exclusive and attentive.
  Use the customer's purchase history to make specific, relevant recommendations.
  Keep messages concise (2-3 paragraphs maximum).`;

  let userMessage = '';

  switch (messageType) {
    case 'TIER_UPGRADE':
      userMessage = `Customer ${user.username} has just been upgraded to ${user.tier} tier.
      Their purchase history: ${context.purchaseHistory}.
      Total spending: $${user.spending}.
      Write a warm welcome message acknowledging their new tier and suggesting ${context.recommendedProduct || 'a complementary fragrance'} based on their preferences.`;
      break;

    case 'PURCHASE_ANNIVERSARY':
      userMessage = `Customer ${user.username} purchased "${context.originalPurchase}" exactly ${context.yearsAgo} year(s) ago.
      They have also purchased: ${context.otherPurchases}.
      Write a thoughtful anniversary message and suggest "${context.recommendedProduct}" as a complementary fragrance.`;
      break;

    case 'PERSONALIZED_RECOMMENDATION':
      userMessage = `Customer ${user.username} (${user.tier} tier) has purchased: ${context.purchaseHistory}.
      They are viewing "${context.currentProduct}".
      Suggest why they might enjoy this fragrance based on their history, or recommend an alternative.`;
      break;

    default:
      userMessage = `Customer ${user.username} - ${context.message}`;
  }

  return await callAI(systemPrompt, userMessage, 0.7, 300);
}

/**
 * Analyze review sentiment and extract feedback
 * @param {string} reviewText - The review text to analyze
 * @returns {Promise<Object>} - { sentiment: 'Positive|Negative|Neutral', flagged: boolean, extractedFeedback: string }
 */
async function analyzeReviewSentiment(reviewText) {
  const systemPrompt = `You are a content moderator and sentiment analyst for a luxury perfume brand.
  Analyze the review sentiment and extract key feedback points.
  
  Respond in this EXACT JSON format:
  {
    "sentiment": "Positive" or "Negative" or "Neutral",
    "flagged": true or false,
    "extractedFeedback": "Brief summary of key points"
  }
  
  Flag reviews that contain profanity, spam, or inappropriate content.`;

  const response = await callAI(systemPrompt, reviewText, 0.3, 200, true);

  try {
    // Try to parse JSON response
    const parsed = JSON.parse(response);
    return {
      sentiment: parsed.sentiment || 'Neutral',
      flagged: parsed.flagged || false,
      extractedFeedback: parsed.extractedFeedback || ''
    };
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      sentiment: 'Neutral',
      flagged: false,
      extractedFeedback: reviewText.substring(0, 100)
    };
  }
}

/**
 * Analyze an image to identify perfumes
 * @param {string} imageBase64 - Base64 encoded image string (without prefix)
 * @returns {Promise<Object>} 
 */
async function analyzeImage(imageBase64) {
  const nvidiaClient = getNvidiaClient();
  if (!nvidiaClient) return null;

  try {
    console.log("👁️ Analyzing image with NVIDIA VILA / Phi-3 Vision...");

    // Construct the payload for Vision model
    const response = await nvidiaClient.chat.completions.create({
      model: "microsoft/phi-3-vision-128k-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the perfume in this image. Return a JSON object with keys: brand, name, and a short visual description." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      stream: false
    });

    const content = response.choices[0].message.content;

    const cleaned = cleanAIResponse(content);
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      return { description: cleaned };
    }

  } catch (error) {
    console.error("Visual Search Error:", error.message);
    throw error;
  }
}

module.exports = {
  callAI,
  callGroqAI,
  extractFragranceNotes,
  generatePersonalizedMessage,
  analyzeReviewSentiment,
  analyzeImage
};
