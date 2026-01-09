const Product = require('../models/Product');
const { callAI } = require('../services/aiHelpers');

// Groq SDK is now handled in aiHelpers.js via callAI

exports.negotiatePrice = async (req, res) => {
  try {
    const { productId, offer, history, userTier } = req.body;
    
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const originalPrice = product.price;
    const currentOffer = parseFloat(offer);

    // Dynamic Floor based on Tier or Admin Limit
    let minPrice;
    if (product.negotiationLimit && product.negotiationLimit > 0) {
      minPrice = product.negotiationLimit;
    } else {
      // Elite Diamond gets less wiggle room because they already have discounts
      let minPriceRatio = 0.85; // Standard: can go down to 85%
      if (userTier === 'Elite Diamond') {
        minPriceRatio = 0.92; // Elite: can only go down to 92%
      }
      minPrice = originalPrice * minPriceRatio;
    }

    // Determine Negotiation State
    let status = "counter";
    let message = "";
    let finalPrice = null;
    let counterOffer = null;

    // 1. Immediate Acceptance (High Offer)
    if (currentOffer >= originalPrice * 0.96) {
      status = "accepted";
      finalPrice = currentOffer;
    } 
    // 2. Negotiation Logic (Always counter unless accepted)
    else {
      // Calculate counter-offer based on rounds
      // "Determined" logic: Start high (1% discount) and move slowly
      const rounds = history ? history.length : 0;
      let calculatedCounter;

      // Decrease by 1% per round, but never below minPrice
      // Round 0: 99%, Round 1: 98%, Round 2: 97%...
      const discountFactor = 0.99 - (rounds * 0.01); 
      calculatedCounter = Math.max(minPrice, originalPrice * discountFactor);

      // If user's offer is very close to our counter (within 1%), accept
      if (calculatedCounter - currentOffer < originalPrice * 0.01) {
        status = "accepted";
        finalPrice = currentOffer;
      } else {
        status = "counter";
        counterOffer = Math.floor(calculatedCounter);
      }
    }

    // AI Message Generation
    console.log(`[Negotiation] Status: ${status}, Offer: ${currentOffer}, Counter: ${counterOffer}, Min: ${minPrice}`);

    const systemPrompt = `You are a sophisticated, slightly haughty but polite luxury perfume concierge. 
    You are negotiating the price of "${product.name}" (Original: GH₵${originalPrice}).
    User Offer: GH₵${currentOffer}.
    Your Status: ${status.toUpperCase()}.
    ${status === 'counter' ? `Your Counter Offer: GH₵${counterOffer}.` : ''}
    ${status === 'accepted' ? `Final Price: GH₵${finalPrice}.` : ''}
    
    Respond in 1-2 short, elegant sentences. 
    If ACCEPTED: Congratulate them on a fine acquisition.
    If REJECTED: Politely dismiss the low offer as insulting to the craftsmanship.
    If COUNTER: Politely propose your counter offer (GH₵${counterOffer}) as a special favor.
    Do NOT mention the math or percentages. Maintain the persona.`;

    try {
      // Format history for callAI
      let conversationHistory = "";
      if (history && history.length > 0) {
        conversationHistory = history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');
      }
      
      // We pass the conversation history as the "userMessage" part, 
      // effectively appending it to the system prompt in callAI.
      // We also append the current offer context if not already in history (it usually isn't fully).
      const contextMessage = `${conversationHistory}\n\n(Current Context: Status=${status}, Offer=${currentOffer}, Counter=${counterOffer})`;

      message = await callAI(systemPrompt, contextMessage, 0.7, 100);
    } catch (aiError) {
      console.error("AI Generation Failed:", aiError);
      // Fallback messages
      if (status === 'accepted') message = "Very well. I accept your offer.";
      else if (status === 'rejected') message = "I'm afraid that is impossible.";
      else message = `I can offer it to you for GH₵${counterOffer}.`;
    }

    console.log(`[Negotiation] Response Message: ${message}`);

    res.json({
      status,
      finalPrice,
      counterOffer,
      message
    });

  } catch (error) {
    console.error("Negotiation Error:", error);
    res.status(500).json({ error: "Negotiation failed" });
  }
};
