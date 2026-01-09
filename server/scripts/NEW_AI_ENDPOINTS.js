/**
 * NEW AI ENDPOINTS TO ADD TO index.js
 * 
 * ADD THESE IMPORTS AT THE TOP (after existing model imports):
 * const Review = require('./models/Review');
 * const ProductAnalytics = require('./models/ProductAnalytics');
 * const { extractFragranceNotes, analyzeReviewSentiment, callGroqAI, generatePersonalizedMessage } = require('./services/aiHelpers');
 * const { sendAIPersonalizedEmail } = require('./services/emailService');
 * const Featured = require('./models/Featured');  // If not already imported
 * 
 * ADD THESE ENDPOINTS BEFORE app.listen():
 */

// ==============================================
// PHASE 2: CUSTOMER-FACING AI AGENTS
// ==============================================

// 7. AI: SIGNATURE SCENT FINDER (Advanced Scent Profiling)
app.post('/api/ai/signature-scent', async (req, res) => {
  const { description } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    // Step 1: Extract fragrance notes from abstract description
    const notes = await extractFragranceNotes(description);
    
    // Step 2: Find products matching those notes
    const products = await Product.find();
    const matchedProducts = products.filter(product => {
      if (!product.notes) return false;
      const productNotes = product.notes.toLowerCase();
      return notes.some(note => productNotes.includes(note.toLowerCase()));
    });

    // Step 3: Rank by number of matching notes
    const rankedProducts = matchedProducts.map(product => {
      const productNotes = product.notes.toLowerCase();
      const matchCount = notes.filter(note => productNotes.includes(note.toLowerCase())).length;
      return { product, matchCount };
    }).sort((a, b) => b.matchCount - a.matchCount);

    // Return top 5 matches
    const topMatches = rankedProducts.slice(0, 5).map(item => item.product);

    res.json({
      description,
      extractedNotes: notes,
      recommendations: topMatches,
      message: topMatches.length > 0
        ? `Based on your description, we've identified ${notes.length} key fragrance notes.`
        : "We couldn't find exact matches, but our curators can source this for you."
    });
  } catch (error) {
    console.error('Signature Scent Error:', error);
    res.status(500).json({ error: "Failed to find signature scent" });
  }
});

// 8. AI: NOTE MATCHMAKER (Natural Language Filtering)
app.post('/api/ai/note-matchmaker', async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    // Extract concrete notes from abstract query
    const notes = await extractFragranceNotes(query);
    
    // Find all products matching these notes
    const products = await Product.find();
    const filteredProducts = products.filter(product => {
      if (!product.notes) return false;
      const productNotes = product.notes.toLowerCase();
      return notes.some(note => productNotes.includes(note.toLowerCase()));
    });

    res.json({
      query,
      extractedNotes: notes,
      results: filteredProducts,
      count: filteredProducts.length
    });
  } catch (error) {
    console.error('Note Matchmaker Error:', error);
    res.status(500).json({ error: "Failed to match fragrances" });
  }
});

// 9. AI: LAYERING ADVISOR (Product Combination Suggestions)
app.post('/api/ai/layering-advisor', verifyToken, async (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    // Get user and current product
    const user = await User.findById(req.userId).select('-password');
    const currentProduct = await Product.findOne({ id: productId });
    
    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Build purchase history context
    const purchaseHistory = user.orderHistory
      .slice(-5)  // Last 5 purchases
      .map(order => order.productName)
      .join(', ');

    // Generate AI layering suggestion
    const systemPrompt = `You are a luxury perfume fragrance expert specializing in scent layering.
    Suggest complementary perfumes for layering based on the user's history and the current product.
    Be specific about which notes complement each other and how to layer them.
    Keep response under 150 words.`;

    const userMessage = `Current Product: ${currentProduct.name} (Notes: ${currentProduct.notes})
    User's Recent Purchases: ${purchaseHistory || 'None'}
    
    Suggest 2-3 products from our inventory that would layer beautifully with this fragrance.
    Explain the layering technique.`;

    const suggestion = await callGroqAI(systemPrompt, userMessage, 0.7, 300);

    // Find complementary products based on notes
    const currentNotes = (currentProduct.notes || '').toLowerCase();
    const products = await Product.find();
    const complementaryProducts = products
      .filter(p => p.id !== currentProduct.id && p.notes)
      .slice(0, 3);  // Suggest top 3

    res.json({
      currentProduct: {
        name: currentProduct.name,
        notes: currentProduct.notes
      },
      aiSuggestion: suggestion,
      complementaryProducts,
      userHistory: purchaseHistory
    });
  } catch (error) {
    console.error('Layering Advisor Error:', error);
    res.status(500).json({ error: "Failed to generate layering advice" });
  }
});

// ==============================================
// PHASE 3: LOYALTY & PERSONALIZATION
// ==============================================

// 10. AI: LOYALTY TIER WELCOME (Triggered on tier change)
app.post('/api/ai/loyalty-tier-welcome', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    // Build purchase history for AI context
    const purchaseHistory = user.orderHistory
      .slice(-5)
      .map(order => order.productName)
      .join(', ');

    // Recommend a product based on history
    const products = await Product.find();
    const recommendedProduct = products[Math.floor(Math.random() * Math.min(products.length, 5))].name;

    const context = {
      purchaseHistory,
      recommendedProduct
    };

    // Send AI-generated personalized email
    await sendAIPersonalizedEmail(user, 'TIER_UPGRADE', context);

    res.json({ message: `Tier welcome message sent to ${user.email}` });
  } catch (error) {
    console.error('Tier Welcome Error:', error);
    res.status(500).json({ error: "Failed to send tier welcome" });
  }
});

// 11. AI: PURCHASE MILESTONES (Anniversary Detection)
app.post('/api/ai/purchase-milestones', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (user.orderHistory.length === 0) {
      return res.json({ message: "No purchase history" });
    }

    // Find purchases around 1 year old (within 7 days of anniversary)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const anniversaryPurchases = user.orderHistory.filter(order => {
      const purchaseDate = new Date(order.date);
      const daysDiff = Math.abs((purchaseDate - oneYearAgo) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;  // Within a week of 1-year anniversary
    });

    if (anniversaryPurchases.length === 0) {
      return res.json({ message: "No anniversaries at this time" });
    }

    const originalPurchase = anniversaryPurchases[0].productName;
    const otherPurchases = user.orderHistory
      .filter(o => o.productName !== originalPurchase)
      .slice(0, 3)
      .map(o => o.productName)
      .join(', ');

    // Get a recommendation
    const products = await Product.find();
    const recommendedProduct = products[Math.floor(Math.random() * Math.min(products.length, 5))].name;

    const context = {
      originalPurchase,
      yearsAgo: 1,
      otherPurchases: otherPurchases || 'None',
      recommendedProduct
    };

    await sendAIPersonalizedEmail(user, 'PURCHASE_ANNIVERSARY', context);

    res.json({ 
      message: `Anniversary message sent for ${originalPurchase}`,
      anniversaries: anniversaryPurchases.map(p => p.productName)
    });
  } catch (error) {
    console.error('Purchase Milestone Error:', error);
    res.status(500).json({ error: "Failed to process milestones" });
  }
});

// ==============================================
// PHASE 4: CONTENT INTELLIGENCE
// ==============================================

// 12. REVIEWS: Submit with AI Sentiment Analysis
app.post('/api/reviews', verifyToken, async (req, res) => {
  const { productId, rating, reviewText } = req.body;

  if (!productId || !rating || !reviewText) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    // Analyze sentiment and extract feedback
    const analysis = await analyzeReviewSentiment(reviewText);

    const newReview = new Review({
      userId: req.userId,
      productId,
      rating,
      reviewText,
      sentiment: analysis.sentiment,
      flagged: analysis.flagged,
      extractedFeedback: analysis.extractedFeedback
    });

    await newReview.save();

    res.json({
      message: "Review submitted successfully",
      review: newReview,
      analysis: {
        sentiment: analysis.sentiment,
        flagged: analysis.flagged
      }
    });
  } catch (error) {
    console.error('Review Submission Error:', error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// 13. REVIEWS: Get reviews for a product
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(reviews);
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

//  14. AI: REVIEW SUMMARY (Generate consensus from reviews)
app.get('/api/ai/review-summary/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(20);

    if (reviews.length === 0) {
      return res.json({ summary: "No reviews yet for this product." });
    }

    // Compile review texts
    const reviewTexts = reviews.map((r, i) => `${i + 1}. ${r.reviewText}`).join('\\n');

    const systemPrompt = `You are a luxury perfume review analyst.
    Summarize customer reviews into a concise, balanced summary (max 100 words).
    Highlight consensus points and any notable dissenting opinions.
    Use sophisticated, elegant language befitting a luxury brand.`;

    const userMessage = `Summarize these customer reviews:\\n\\n${reviewTexts}`;

    const summary = await callGroqAI(systemPrompt, userMessage, 0.5, 200);

    // Calculate sentiment distribution
    const sentimentCounts = reviews.reduce((acc, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    }, {});

    res.json({
      summary,
      totalReviews: reviews.length,
      sentimentDistribution: sentimentCounts,
      averageRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    });
  } catch (error) {
    console.error('Review Summary Error:', error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// 15. AI: EXTRACT NOTES (Admin Tool)
app.post('/api/ai/extract-notes', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description required" });
  }

  try {
    const systemPrompt = `You are a master perfumer analyzing fragrance descriptions.
    Extract and structure fragrance notes into this EXACT format:
    "Top: [notes]; Heart: [notes]; Base: [notes]"
    
    If unable to determine all three categories, extract what you can and format appropriately.
    Use proper fragrance terminology.`;

    const structuredNotes = await callGroqAI(systemPrompt, `Extract notes from: ${description}`, 0.3, 150);

    res.json({
      originalDescription: description,
      structuredNotes
    });
  } catch (error) {
    console.error('Note Extraction Error:', error);
    res.status(500).json({ error: "Failed to extract notes" });
  }
});

// 16. AI: CATEGORIZE REQUEST (Admin Tool)
app.post('/api/ai/categorize-request/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const systemPrompt = `You are a luxury perfume procurement specialist.
    Analyze this customer scent request and provide a JSON response with:
    {
      "category": "Highly Niche/Rare" or "Standard Request",
      "estimatedPrice": number (estimated USD),
      "aiNotes": "Brief analysis and recommendations for the admin team"
    }`;

    const userMessage = `Perfume Name: ${request.perfumeName}
    Description: ${request.description}
    
    Categorize this request.`;

    const response = await callGroqAI(systemPrompt, userMessage, 0.4, 200);

    // Parse AI response
    let categorization;
    try {
      categorization = JSON.parse(response);
    } catch (e) {
      // Fallback if JSON parsing fails
      categorization = {
        category: 'Uncategorized',
        estimatedPrice: 0,
        aiNotes: response
      };
    }

    // Update the request
    request.category = categorization.category || 'Uncategorized';
    request.estimatedPrice = categorization.estimatedPrice || 0;
    request.aiNotes = categorization.aiNotes || '';
    await request.save();

    res.json({
      requestId: request._id,
      categorization
    });
  } catch (error) {
    console.error('Request Categorization Error:', error);
    res.status(500).json({ error: "Failed to categorize request" });
  }
});

// ==============================================
// PHASE 5: ADMIN INTELLIGENCE
// ==============================================

// 17. AI: CAROUSEL CURATOR (Dynamic Homepage)
app.get('/api/ai/carousel-curator', async (req, res) => {
  try {
    // Calculate top 5 products from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await User.find();
    const productSales = {};

    users.forEach(user => {
      user.orderHistory.forEach(order => {
        if (new Date(order.date) >= thirtyDaysAgo) {
          productSales[order.productId] = (productSales[order.productId] || 0) + 1;
        }
      });
    });

    // Get top 5 product IDs
    const topProductIds = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topProducts = await Product.find({ id: { $in: topProductIds.map(id => parseInt(id)) } });

    // Generate carousel title and description
    const productNames = topProducts.map(p => p.name).join(', ');
    
    const systemPrompt = `You are a luxury perfume brand copywriter.
    Create an elegant carousel title and subtitle for the homepage featuring these best-selling perfumes.
    Respond in JSON format:
    {
      "title": "Compelling 3-5 word title",
      "subtitle": "One elegant sentence (max 15 words)"
    }`;

    const response = await callGroqAI(systemPrompt, `Featured Products: ${productNames}`, 0.7, 100);

    let carousel;
    try {
      carousel = JSON.parse(response);
    } catch (e) {
      carousel = {
        title: "Elite Best Sellers",
        subtitle: "The Connoisseur's Choice This Month"
      };
    }

    res.json({
      ...carousel,
      products: topProducts,
      salesData: productSales
    });
  } catch (error) {
    console.error('Carousel Curator Error:', error);
    res.status(500).json({ error: "Failed to curate carousel" });
  }
});

// 18. AI: A/B TESTING COPY GENERATOR
app.post('/api/ai/ab-test-copy/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.productId });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const systemPrompt = `You are a luxury perfume copywriter.
    Generate 3 distinct marketing copy variations for A/B testing:
    1. Luxury/Exclusivity focused
    2. Value/Versatility focused
    3. Emotional/Fragrance Notes focused
    
    Respond in JSON format:
    {
      "variation_luxury": "2-3 sentences",
      "variation_value": "2-3 sentences",
      "variation_emotional": "2-3 sentences"
    }`;

    const userMessage = `Product: ${product.name}
    Current Description: ${product.description}
    Notes: ${product.notes}
    Price: $${product.price}`;

    const response = await callGroqAI(systemPrompt, userMessage, 0.8, 400);

    let variations;
    try {
      variations = JSON.parse(response);
    } catch (e) {
      variations = {
        variation_luxury: product.description,
        variation_value: product.description,
        variation_emotional: product.description
      };
    }

    res.json({
      productId: product.id,
      productName: product.name,
      originalDescription: product.description,
      testVariations: variations
    });
  } catch (error) {
    console.error('A/B Test Copy Error:', error);
    res.status(500).json({ error: "Failed to generate test copy" });
  }
});

// 19. AI: RESTOCK PREDICTOR
app.get('/api/ai/restock-predictor', async (req, res) => {
  try {
    // Get all products and their analytics
    const products = await Product.find();
    const analytics = await ProductAnalytics.find();
    
    // Calculate analytics for products without existing records
    const users = await User.find();
    const now = new Date();
    
    for (const product of products) {
      let existing = analytics.find(a => a.productId === product.id.toString());
      
      if (!existing) {
        // Calculate sales velocity
        const sales30 = users.reduce((sum, user) => {
          return sum + user.orderHistory.filter(order => {
            const daysSince = (now - new Date(order.date)) / (1000 * 60 * 60 * 24);
            return order.productId === product.id.toString() && daysSince <= 30;
          }).length;
        }, 0);

        const sales90 = users.reduce((sum, user) => {
          return sum + user.orderHistory.filter(order => {
            const daysSince = (now - new Date(order.date)) / (1000 * 60 * 60 * 24);
            return order.productId === product.id.toString() && daysSince <= 90;
          }).length;
        }, 0);

        const sales180 = users.reduce((sum, user) => {
          return sum + user.orderHistory.filter(order => {
            const daysSince = (now - new Date(order.date)) / (1000 * 60 * 60 * 24);
            return order.productId === product.id.toString() && daysDays <= 180;
          }).length;
        }, 0);

        // Count requests for this product
        const requestCount = await Request.countDocuments({
          perfumeName: new RegExp(product.name, 'i')
        });

        // Determine priority
        let priority = 'Low Demand';
        if (sales30 >= 5 || requestCount >= 3) {
          priority = 'High Priority Restock';
        } else if (sales30 >= 2 || sales90 >= 5 || requestCount >= 1) {
          priority = 'Monitor Closely';
        }

        existing = new ProductAnalytics({
          productId: product.id.toString(),
          productName: product.name,
          requestCount,
          salesVelocity: {
            last30Days: sales30,
            last90Days: sales90,
            last180Days: sales180
          },
          restockPriority: priority
        });

        await existing.save();
      }
    }

    // Fetch updated analytics
    const updatedAnalytics = await ProductAnalytics.find().sort({ restockPriority: 1 });

    res.json({
      totalProducts: products.length,
      analytics: updatedAnalytics
    });
  } catch (error) {
    console.error('Restock Predictor Error:', error);
    res.status(500).json({ error: "Failed to predict restocks" });
  }
});

// 20. AI: ADMIN DAILY SUMMARY
app.get('/api/ai/admin-daily-summary', async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate metrics
    const users = await User.find();
    let totalOrders = 0;
    let totalRevenue = 0;
    const productSales = {};

    users.forEach(user => {
      user.orderHistory.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate >= yesterday && orderDate < today) {
          totalOrders++;
          totalRevenue += order.finalPrice;
          productSales[order.productName] = (productSales[order.productName] || 0) + 1;
        }
      });
    });

    const topProduct = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])[0];

    const newSignups = await User.countDocuments({
      createdAt: { $gte: yesterday, $lt: today }
    });

    // Generate AI summary
    const systemPrompt = `You are an executive assistant for a luxury perfume brand.
    Create a concise daily business summary in 2-3 sentences.
    Use elegant, professional language.`;

    const userMessage = `Yesterday's Metrics:
    - Orders: ${totalOrders}
    - Revenue: $${totalRevenue.toFixed(2)}
    - New Signups: ${newSignups}
    - Top Product: ${topProduct ? topProduct[0] : 'None'} (${topProduct ? topProduct[1] : 0} sales)
    
    Generate a professional summary.`;

    const aiSummary = await callGroqAI(systemPrompt, userMessage, 0.6, 150);

    res.json({
      date: yesterday.toISOString().split('T')[0],
      metrics: {
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        newSignups,
        topProduct: topProduct ? { name: topProduct[0], sales: topProduct[1] } : null
      },
      aiSummary
    });
  } catch (error) {
    console.error('Daily Summary Error:', error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});
