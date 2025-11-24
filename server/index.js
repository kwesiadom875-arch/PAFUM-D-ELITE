require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt =require('jsonwebtoken');
const cheerio = require('cheerio');
const Groq = require("groq-sdk");
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const crypto = require('crypto');
const argon2 = require('argon2');
const rateLimit = require('express-rate-limit');

const Product = require('./models/Product');
const User = require('./models/User');
const Request = require('./models/Request');
const { sendVerificationEmail } = require('./services/emailService');
const { hashPassword, verifyPassword } = require('./utils/security');

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

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false, 
  message: "Too many login/register attempts. Please try again after 15 minutes."
});

// --- ROUTES ---

// 1. AUTH
// Secure registration with email verification
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ 
        message: "If this email is valid, a verification link has been sent to your inbox." 
      });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hour

    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry: tokenExpiry
    });
    
    await newUser.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't reveal email sending failure to user
    }
    
    // Generic success message (anti-enumeration)
    res.status(200).json({ 
      message: "If this email is valid, a verification link has been sent to your inbox." 
    });
    
  } catch (e) {
    console.error('Registration error:', e);
    // Generic error (don't leak system information)
    res.status(200).json({ 
      message: "If this email is valid, a verification link has been sent to your inbox." 
    });
  }
});

// Email verification endpoint
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    res.json({ message: "Email verified successfully! You can now sign in." });
    
  } catch (e) {
    console.error('Verification error:', e);
    res.status(500).json({ message: "Verification failed" });
  }
});

// Login with email verification check and Argon2
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    // Check user exists and password is correct (using Argon2)
    if (!user || !(await verifyPassword(user.password, password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Please verify your email before signing in. Check your inbox for the verification link." 
      });
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { 
        username: user.username, 
        email: user.email,
        tier: user.tier,
        spending: user.spending
      } 
    });
  } catch (e) { 
    console.error('Login error:', e);
    res.status(500).json({ error: "Login failed" }); 
  }
});

app.get('/api/user/profile', verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

// Record Purchase
app.post('/api/user/purchase', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    items.forEach(item => {
      user.orderHistory.push({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        originalPrice: item.originalPrice,
        finalPrice: item.finalPrice,
        negotiated: item.negotiated || false,
        date: new Date()
      });
    });
    const purchaseTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);
    user.spending += purchaseTotal;
    if (user.spending >= 15000) { user.tier = 'Elite Diamond'; }
    else if (user.spending >= 10001) { user.tier = 'Diamond'; }
    else if (user.spending >= 7001) { user.tier = 'Platinum'; }
    else if (user.spending >= 3001) { user.tier = 'Gold'; }
    else { user.tier = 'Bronze'; }
    await user.save();
    const updatedUser = await User.findById(req.userId).select('-password');
    res.json({ message: "Purchase recorded successfully", user: updatedUser });
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

// 3. AI: JOSIE
app.post('/api/josie', async (req, res) => {
  const { userMessage } = req.body;

  try {
    // A. Get Inventory Context (So AI knows what you actually sell)
    const products = await Product.find();
    const inventoryContext = products.map(p => 
      `ID:${p.id}, Name:${p.name}, Price: GH₵${p.price}, Category:${p.category}, Notes:${p.notes}, Desc:${p.description.substring(0, 100)}...`
    ).join('\n');

    // B. The "Generative UI" System Prompt
    const systemPrompt = `
      You are Josie, the Senior Scent Sommelier for Parfum D'Elite.
      
      CRITICAL: You must return valid JSON only. No markdown.
      Your response must have a "type" and "data".
      
      Supported Types:
      1. "text": Standard chat response.
      2. "product_card": Recommend a specific product. Data must include "productId" and "reason".
      3. "comparison": Compare 2 products. Data must include "productIds" (array of ints) and "analysis".

      Inventory:
      ${inventoryContext}

      If the user asks for a recommendation, prefer sending a "product_card".
      If they ask "A vs B", send a "comparison".
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.3-70b-versatile",
      // This forces the AI to be a coder, not a chatterbox
      response_format: { type: "json_object" } 
    });

    // Parse the JSON string back into an object
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    res.json(aiResponse);

  } catch (error) {
    console.error("AI Error:", error);
    // Fallback if AI fails
    res.json({ 
      type: "text", 
      data: { message: "I am sensing some interference. Could you repeat that?" } 
    });
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

app.listen(5000, () => console.log('🚀 Server running on http://127.0.0.1:5000'));