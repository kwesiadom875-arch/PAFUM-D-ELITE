const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Centralized Groq AI API wrapper
 * @param {string} systemPrompt - System instruction for the AI
 * @param {string} userMessage - User's message/query
 * @param {number} temperature - Creativity level (0.0-1.0)
 * @param {number} maxTokens - Maximum response length
 * @returns {Promise<string>} - AI response content
 */
async function callGroqAI(systemPrompt, userMessage, temperature = 0.7, maxTokens = 500) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq AI Error:', error);
    throw new Error('AI service temporarily unavailable');
  }
}

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

  const response = await callGroqAI(systemPrompt, userMessage, 0.3, 100);
  
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

  return await callGroqAI(systemPrompt, userMessage, 0.7, 300);
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

  const response = await callGroqAI(systemPrompt, reviewText, 0.3, 200);
  
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

module.exports = {
  callGroqAI,
  extractFragranceNotes,
  generatePersonalizedMessage,
  analyzeReviewSentiment
};
