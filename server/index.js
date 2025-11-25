const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cheerio = require('cheerio');
const Groq = require("groq-sdk");
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

const Product = require('./models/Product');
const User = require('./models/User');
const Request = require('./models/Request');
const Review = require('./models/Review');
const ProductAnalytics = require('./models/ProductAnalytics');
const { extractFragranceNotes, analyzeReviewSentiment, callGroqAI } = require('./services/aiHelpers');
const { sendAIPersonalizedEmail } = require('./services/emailService');
const app = express();
app.use(cors({
  origin: [
    "https://pafum-d-elite.vercel.app/",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// --- CONFIGURATION ---
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const JWT_SECRET = process.env.JWT_SECRET || "parfum_delite_secret_key_123";
const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

mongoose.connect(dbAddress)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// --- MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- ROUTES ---

// 1. AUTH
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (e) { res.status(500).json({ error: "Email exists or error" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { username: user.username, email: user.email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/user/profile', verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

// Record Purchase
app.post('/api/user/purchase', verifyToken, async (req, res) => {
  try {
    const { items, deliveryLocation } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // STEP 1: Validate stock availability for all items
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productName}` });
      }

      const quantity = item.quantity || 1;

      if (item.selectedSize) {
        // Check size-specific stock
        const sizeVariant = product.sizes.find(s => s.size === item.selectedSize);
        if (!sizeVariant) {
          return res.status(400).json({ error: `Size ${item.selectedSize} not available for ${product.name}` });
        }
        if (sizeVariant.stockQuantity < quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${product.name} (${item.selectedSize}). Only ${sizeVariant.stockQuantity} available.` 
          });
        }
      } else {
        // Check main stock
        if (product.stockQuantity < quantity) {
          return res.status(400).json({ 
            error:`Insufficient stock for ${product.name}. Only ${product.stockQuantity} available.` 
          });
        }
      }
    }

    // STEP 2: Record purchase in user order history
    items.forEach(item => {
      user.orderHistory.push({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        originalPrice: item.originalPrice,
        finalPrice: item.finalPrice,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity || 1,
        negotiated: item.negotiated || false,
        deliveryLocation: deliveryLocation || null,
        date: new Date()
      });
    });

    // STEP 3: Update spending and tier
    const purchaseTotal = items.reduce((sum, item) => sum + (item.finalPrice * (item.quantity || 1)), 0);
    user.spending += purchaseTotal;
    if (user.spending >= 15000) { user.tier = 'Elite Diamond'; }
    else if (user.spending >= 10001) { user.tier = 'Diamond'; }
    else if (user.spending >= 7001) { user.tier = 'Platinum'; }
    else if (user.spending >= 3001) { user.tier = 'Gold'; }
    else { user.tier = 'Bronze'; }
    await user.save();

    // STEP 4: Decrement stock for each item
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      const quantity = item.quantity || 1;

      if (item.selectedSize) {
        const sizeIndex = product.sizes.findIndex(s => s.size === item.selectedSize);
        product.sizes[sizeIndex].stockQuantity -= quantity;
      } else {
        product.stockQuantity -= quantity;
      }

      // Update availability status
      const hasStock = product.sizes.some(s => s.stockQuantity > 0) || product.stockQuantity > 0;
      product.isAvailable = hasStock;
      
      await product.save();
    }

    const updatedUser = await User.findById(req.userId).select('-password');
    res.json({ 
      message: "Purchase recorded successfully", 
      user: updatedUser,
      orderDetails: {
        totalItems: items.length,
        totalAmount: purchaseTotal,
        deliveryLocation
      }
    });
  } catch (error) {
    console.error('Purchase recording error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. PRODUCTS
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  let product = await Product.findOne({ id: req.params.id });
  if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
    product = await Product.findById(req.params.id);
  }
  res.json(product || {});
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    let result = await Product.findOneAndDelete({ id: req.params.id });
    if (!result && mongoose.Types.ObjectId.isValid(req.params.id)) {
      result = await Product.findByIdAndDelete(req.params.id);
    }
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2.5 FEATURED PERFUME
const Featured = require('./models/Featured');

app.get('/api/featured', async (req, res) => {
  try {
    const featured = await Featured.findOne().sort({ _id: -1 });
    res.json(featured || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/featured', async (req, res) => {
  try {
    await Featured.deleteMany({}); 
    const newFeatured = new Featured(req.body);
    await newFeatured.save();
    res.json(newFeatured);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. AI: JOSIE
app.post('/api/josie', async (req, res) => {
  const { userMessage, history } = req.body;
  const products = await Product.find();

  try {
    const inventory = products.map(p => `${p.name} (${p.category})`).join('\n');

    const messages = [
      {
        role: "system",
        content: `You are Josie, a luxury perfume sommelier.
        
        Current Inventory:
        ${inventory}
        
        --- LOGIC ---
        1. IF Greeting: Reply politely.
        2. IF Recommendation Needed:
           - Recommend ONE perfume. 
           - DO NOT recommend the same perfume twice in a row. Look at the history!
           - If the user asks for "another", give a DIFFERENT option.
           
        --- FORMATTING ---
        - No Markdown. Use Emojis for stats.
        - REQUIRED STATS: ⏳ Longevity, 🌬️ Sillage, 💬 Community.
        - IF NOT IN INVENTORY: Must end with "We currently don't have that in stock but you can make a request."
        `
      },
      ...(history || []),
      { role: "user", content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      max_tokens: 250
    });

    res.json({ reply: completion.choices[0]?.message?.content });
  } catch (error) {
    console.error("AI Error:", error);
    res.json({ reply: "I am having trouble accessing the archives. Please try again." });
  }
});

// 4. AI: NEGOTIATOR
app.post('/api/negotiate', async (req, res) => {
  const { product, userOffer, history } = req.body;
  const price = product.price;
  const offer = parseFloat(userOffer);
  const ratio = offer / price;

  let systemInstruction = "";
  let status = "negotiating";

  if (ratio < 0.5) {
    systemInstruction = `The user offered ${offer} for a ${price} item (too low). You are insulted but polite. Reject it firmly. Do not counter.`;
    status = "rejected";
  } else if (ratio < 0.8) {
    const counter = Math.floor((offer + (price * 0.85)) / 2);
    systemInstruction = `The user offered ${offer} for a ${price} item. It's decent but we want more. Counter offer with ${counter}. Be persuasive.`;
    status = "counter";
  } else {
    systemInstruction = `The user offered ${offer} for a ${price} item. This is acceptable. Accept the deal warmly. Use the word "ACCEPTED" in your response.`;
    status = "accepted";
  }

  try {
    const messages = [
      {
        role: "system",
        content: `You are The Concierge, a high-end luxury negotiator for Parfum D'Elite. 
        Your goal is to get the best price, but you have authorization to accept reasonable offers.
        
        Current Context:
        Product: ${product.name}
        List Price: ${price}
        User Offer: ${offer}
        
        Instruction: ${systemInstruction}
        
        Keep your response short (under 2 sentences). Elegant, sophisticated tone.`
      },
      ...(history || []),
      { role: "user", content: `I offer ${offer}` }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      max_tokens: 100
    });

    const reply = completion.choices[0]?.message?.content;

    res.json({ reply, status });
  } catch (error) {
    console.error("Negotiation Error:", error);
    res.status(500).json({ error: "Negotiation failed" });
  }
});

// 5. REQUESTS
app.post('/api/requests', async (req, res) => {
  try {
    const { userVibe, aiRecommendation } = req.body;
    const newRequest = new Request({ userVibe, aiRecommendation });
    await newRequest.save();
    res.json({ message: "Request logged. The concierge will look into it." });
  } catch (e) {
    console.error("Request Logging Error:", e);
    res.status(500).json({ error: "Could not log request." });
  }
});

// 6. SCRAPER
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('fragrantica.com')) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const content = await page.content();
    const $ = cheerio.load(content);

    const name = $('h1[itemprop="name"]').text().replace(/for women and men/i, '').trim();
    const image = $('img[itemprop="image"]').attr('src');
    let description = $('div[itemprop="description"]').text().trim();
    const rating = $('span[itemprop="ratingValue"]').text().trim();
    
    let gender = "Unisex";
    const titleText = $('h1[itemprop="name"]').text();
    if (titleText.includes("for women")) gender = "Female";
    if (titleText.includes("for men") && !titleText.includes("for women")) gender = "Male";

    const notesList = [];
    $('.accord-bar').each((i, el) => {
        notesList.push($(el).text().trim());
    });
    const notes = notesList.join(', ');
    
    // Enhanced perfumer extraction - try multiple selectors
    let perfumer = "Master Perfumer";
    const perfumerSelectors = [
      'div[itemprop="brand"] a',
      '.perfumer-avatar + a',
      'a[href*="/noses/"]',
      'div:contains("Perfumer:") + a',
      'p:contains("Nose:") a'
    ];
    
    for (const selector of perfumerSelectors) {
      const found = $(selector).first().text().trim();
      if (found && found.length > 0 && found !== "Master Perfumer") {
        perfumer = found;
        break;
      }
    }

    // AI Description Shortening
    if (description && description.length > 200) {
      try {
        const aiResponse = await groq.chat.completions.create({
          messages: [{
            role: "system",
            content: "You are a luxury perfume copywriter. Shorten perfume descriptions to 2-3 elegant sentences (max 150 words). Remove unnecessary details, keep only the essence, mood, and key notes. Be poetic but concise."
          }, {
            role: "user",
            content: `Shorten this perfume description:\n\n${description}`
          }],
          model: "llama-3.3-70b-versatile",
          max_tokens: 200
        });
        description = aiResponse.choices[0]?.message?.content || description;
      } catch (aiError) {
        console.error("AI description shortening failed:", aiError);
        // Fallback: just truncate
        description = description.substring(0, 200) + '...';
      }
    }

    const data = { name, image, description, notes, perfumer, rating, gender };

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error("Scraping Error:", error);
    res.status(500).json({ error: "Failed to scrape data" });
  }
});

// 7. ADMIN: GET ALL ORDERS
app.get('/api/admin/orders', async (req, res) => {
  try {
    const users = await User.find({ 'orderHistory.0': { $exists: true } });
    
    let allOrders = [];
    users.forEach(user => {
      user.orderHistory.forEach(order => {
        allOrders.push({
          orderId: order._id || Math.random().toString(36).substr(2, 9),
          username: user.username,
          email: user.email,
          productName: order.productName,
          finalPrice: order.finalPrice,
          date: order.date,
          status: 'Paid'
        });
      });
    });

    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allOrders);
  } catch (error) {
    console.error("Admin Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 8. ADMIN: UPDATE STOCK
app.post('/api/admin/update-stock', async (req, res) => {
  try {
    console.log("Update Stock Request Body:", req.body);
    const { productId, size, quantity } = req.body;
    
    let product = await Product.findOne({ id: productId });
    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (size) {
      // Update size-specific stock
      const sizeIndex = product.sizes.findIndex(s => s.size === size);
      if (sizeIndex === -1) {
        return res.status(404).json({ error: `Size ${size} not found for this product` });
      }
      product.sizes[sizeIndex].stockQuantity = quantity;
    } else {
      // Update main stock
      product.stockQuantity = quantity;
    }

    // Update availability
    const hasStock = product.sizes.some(s => s.stockQuantity > 0) || product.stockQuantity > 0;
    product.isAvailable = hasStock;

    await product.save();

    res.json({
      message: "Stock updated successfully",
      product: {
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        sizes: product.sizes,
        isAvailable: product.isAvailable
      }
    });
  } catch (error) {
    console.error("Stock Update Error:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
});

// 9. PROXY IMAGE
app.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    response.body.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).send('Failed to proxy image');
  }
});

// 9. AI: ENRICH PRODUCT METADATA (for Scent Intel section)
app.post('/api/ai/enrich-product/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.productId });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const aiPrompt = `Analyze this perfume and provide metadata in JSON format:
{"brand":"Brand Name","concentration":"Eau de Parfum/Eau de Toilette/Extrait de Parfum/Eau de Cologne","origin":"Country","season":"Spring/Summer/Fall/Winter/All Year"}

Product Name: ${product.name}
Description: ${product.description || "No description"}
Notes: ${product.notes || "Unknown"}

Provide ONLY valid JSON, no explanation:`;

    const aiResponse = await groq.chat.completions.create({
      messages: [{
        role: "system",
        content: "You are a perfume metadata expert. Respond with valid JSON only."
      }, {
        role: "user",
        content: aiPrompt
      }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 150
    });

    const aiText = aiResponse.choices[0]?.message?.content || "{}";
    const jsonMatch = aiText.match(/\{[\s\S]*\}/) || [aiText];
    const enrichedData = JSON.parse(jsonMatch[0]);

    if (enrichedData.brand) product.brand = enrichedData.brand;
    if (enrichedData.concentration) product.concentration = enrichedData.concentration;
    if (enrichedData.origin) product.origin = enrichedData.origin;
    if (enrichedData.season) product.season = enrichedData.season;

    await product.save();

    res.json({
      message: "Product metadata enriched successfully",
      enrichedFields: enrichedData,
      product
    });

  } catch (error) {
    console.error("Metadata Enrichment Error:", error);
    res.status(500).json({ error: "Failed to enrich product metadata" });
  }
});

// 10. AI: BATCH ENRICH ALL PRODUCTS
app.post('/api/ai/enrich-all-products', async (req, res) => {
  try {
    const products = await Product.find();
    const enrichedProducts = [];
    const errors = [];

    for (const product of products) {
      try {
        const aiPrompt = `Product: ${product.name}
Return JSON: {"brand":"Brand","concentration":"Type","origin":"Country","season":"Season"}`;

        const aiResponse = await groq.chat.completions.create({
          messages: [{
            role: "system",
            content: "Perfume metadata expert. JSON only."
          }, {
            role: "user",
            content: aiPrompt
          }],
          model: "llama-3.3-70b-versatile",
          max_tokens: 100
        });

        const aiText = aiResponse.choices[0]?.message?.content || "{}";
        const jsonMatch = aiText.match(/\{[\s\S]*\}/) || [aiText];
        const data = JSON.parse(jsonMatch[0]);

        if (data.brand) product.brand = data.brand;
        if (data.concentration) product.concentration = data.concentration;
        if (data.origin) product.origin = data.origin;
        if (data.season) product.season = data.season;

        await product.save();
        enrichedProducts.push(product.name);
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        errors.push({ product: product.name, error: err.message });
      }
    }

    res.json({
      message: "Batch enrichment complete",
      enrichedCount: enrichedProducts.length,
      enrichedProducts,
      errors
    });

  } catch (error) {
    console.error("Batch Enrichment Error:", error);
    res.status(500).json({ error: "Failed to batch enrich products" });
  }
});
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

// ==============================================
// PHASE 4.5: SCENT INTEL ENRICHMENT
// ==============================================

// 15.1 AI: ENRICH SINGLE PRODUCT
app.post('/api/ai/enrich-product/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.productId });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const systemPrompt = `You are a master perfumer and fragrance historian.
    Analyze the perfume details and provide the following metadata in JSON format:
    {
      "brand": "Brand Name",
      "concentration": "Eau de Parfum, Extrait, etc.",
      "gender": "Male, Female, Unisex",
      "origin": "Country (e.g. France, Italy, Oman)",
      "season": "Best season (e.g. Winter, All Year)",
      "top": "Top notes (comma separated)",
      "heart": "Heart notes (comma separated)",
      "base": "Base notes (comma separated)"
    }
    If specific details are missing, infer them based on the perfume's reputation and typical profile.`;

    const userMessage = `Product: ${product.name}
    Description: ${product.description}
    Notes: ${product.notes}`;

    const response = await callGroqAI(systemPrompt, userMessage, 0.3, 300);
    
    let enrichedData;
    try {
      enrichedData = JSON.parse(response);
    } catch (e) {
      console.error("Failed to parse AI response", response);
      return res.status(500).json({ error: "AI response parsing failed" });
    }

    // Update Product
    product.brand = enrichedData.brand || "Parfum D'Elite";
    product.concentration = enrichedData.concentration || "Eau de Parfum";
    product.gender = enrichedData.gender || "Unisex";
    product.origin = enrichedData.origin || "France";
    product.season = enrichedData.season || "All Year";
    
    // Update notes if they were split
    if (enrichedData.top && enrichedData.heart && enrichedData.base) {
       // We can store these if we add fields to the model, or just keep them in the 'notes' field
       // For now, let's just update the main metadata fields which are used in ProductBento
    }

    await product.save();

    res.json({
      message: "Product enriched successfully",
      product
    });

  } catch (error) {
    console.error("Enrichment Error:", error);
    res.status(500).json({ error: "Failed to enrich product" });
  }
});

// 15.2 AI: BATCH ENRICH ALL PRODUCTS
app.post('/api/ai/enrich-all-products', async (req, res) => {
  try {
    const products = await Product.find();
    const results = [];

    for (const product of products) {
      // Skip if already enriched (optional check, but good for performance)
      // if (product.brand && product.origin) continue;

      const systemPrompt = `You are a master perfumer.
      Provide JSON metadata for this perfume:
      {
        "brand": "Brand Name",
        "concentration": "Concentration",
        "gender": "Gender",
        "origin": "Country",
        "season": "Season"
      }`;

      const userMessage = `Name: ${product.name}
      Desc: ${product.description}`;

      try {
        const response = await callGroqAI(systemPrompt, userMessage, 0.3, 200);
        const data = JSON.parse(response);

        product.brand = data.brand || "Parfum D'Elite";
        product.concentration = data.concentration || "Eau de Parfum";
        product.gender = data.gender || "Unisex";
        product.origin = data.origin || "France";
        product.season = data.season || "All Year";

        await product.save();
        results.push({ id: product.id, name: product.name, status: "Enriched" });
      } catch (err) {
        console.error(`Failed to enrich ${product.name}:`, err);
        results.push({ id: product.id, name: product.name, status: "Failed" });
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.json({
      message: "Batch enrichment complete",
      results
    });

  } catch (error) {
    console.error("Batch Enrichment Error:", error);
    res.status(500).json({ error: "Batch enrichment failed" });
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
            return order.productId === product.id.toString() && daysSince <= 180;
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

app.listen(5000, () => console.log('🚀 Server running on http://127.0.0.1:5000'));
