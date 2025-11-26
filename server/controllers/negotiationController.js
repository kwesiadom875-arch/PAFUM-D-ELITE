const Product = require('../models/Product');

exports.negotiatePrice = async (req, res) => {
  try {
    const { productId, offer, history } = req.body;
    
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const originalPrice = product.price;
    const minPrice = originalPrice * 0.85; // Max 15% discount
    const currentOffer = parseFloat(offer);

    // 1. Immediate Acceptance
    if (currentOffer >= originalPrice * 0.95) {
      return res.json({
        status: "accepted",
        finalPrice: currentOffer,
        message: "I accept your offer. It is a fair price for such quality."
      });
    }

    // 2. Hard Rejection (Lowball)
    if (currentOffer < minPrice) {
      return res.json({
        status: "rejected",
        counterOffer: originalPrice, // Reset to original
        message: "I'm afraid that is far too low. This is a premium fragrance, not a market stall."
      });
    }

    // 3. Negotiation Logic (Counter-offer)
    // Calculate counter-offer based on rounds (history length)
    const rounds = history ? history.length : 0;
    let counterPrice;

    if (rounds === 0) {
      counterPrice = originalPrice * 0.97; // Start high
    } else if (rounds === 1) {
      counterPrice = originalPrice * 0.93;
    } else {
      counterPrice = Math.max(minPrice, originalPrice * 0.90);
    }

    // If user's offer is very close to our counter, just accept or split difference
    if (counterPrice - currentOffer < originalPrice * 0.02) {
       return res.json({
        status: "accepted",
        finalPrice: currentOffer,
        message: "Very well. I shall make an exception for you."
      });
    }

    res.json({
      status: "counter",
      counterOffer: Math.floor(counterPrice),
      message: `That is a bit low. However, I can offer it to you for GH₵${Math.floor(counterPrice)}.`
    });

  } catch (error) {
    console.error("Negotiation Error:", error);
    res.status(500).json({ error: "Negotiation failed" });
  }
};
