require('dotenv').config();
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
    
    // Set User Agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const content = await page.content();
    const $ = cheerio.load(content);

    const name = $('h1[itemprop="name"]').text().replace(/for women and men/i, '').trim();
    const image = $('img[itemprop="image"]').attr('src');
    const description = $('div[itemprop="description"]').text().trim();
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
    
    const perfumer = $('.perfumer-avatar').next('a').text().trim() || "Master Perfumer";

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