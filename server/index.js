require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Groq = require("groq-sdk");
const puppeteer = require('puppeteer'); // <--- Import Puppeteer

const Product = require('./models/Product');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
// 1. AI Config (Groq)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "gsk_YOUR_KEY_HERE" }); 

// 2. Auth Config
const JWT_SECRET = process.env.JWT_SECRET || "parfum_delite_secret_key_123";

// 3. Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/parfum_delite')
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

// 1. AUTH: REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (e) { res.status(500).json({ error: "Email exists or error" }); }
});

// 2. AUTH: LOGIN
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

// 3. GET PROFILE (Protected Route) - This seems to have been removed in the new code, which is fine.
app.get('/api/user/profile', verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).select('-password'); // Don't send password back
  res.json(user);
});

// 3. PRODUCT: GET ALL
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// 4. PRODUCT: GET ONE
app.get('/api/products/:id', async (req, res) => {
  let product = await Product.findOne({ id: req.params.id });
  if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
    product = await Product.findById(req.params.id);
  }
  res.json(product || {});
});

// 5. PRODUCT: ADD
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. PRODUCT: DELETE
app.delete('/api/products/:id', async (req, res) => {
  try {
    let result = await Product.findOneAndDelete({ id: req.params.id });
    if (!result && mongoose.Types.ObjectId.isValid(req.params.id)) {
      result = await Product.findByIdAndDelete(req.params.id);
    }
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. AI: JOSIE (GROQ)
app.post('/api/josie', async (req, res) => {
  const { userMessage } = req.body;
  const products = await Product.find();
  try {
    const inventory = products.map(p => `${p.name} (${p.category})`).join('\n');
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: `You are Josie, a perfume expert. Inventory: ${inventory}. User: "${userMessage}". Recommend one.` },
        { "role": "user", "content": userMessage }
      ],
      model: "llama-3.3-70b-versatile"
    });
    res.json({ reply: completion.choices[0]?.message?.content });
  } catch (error) {
    res.json({ reply: "I am currently meditating. Ask me later." });
  }
});

app.get('/api/seed', async (req, res) => {
  try {
    // 1. Clear existing data
    await Product.deleteMany({});

    // 2. Define the perfumes
    const seedProducts = [
      {
        id: 1,
        name: "Carolina Herrera Good Girl",
        price: 1800,
        category: "Floral",
        description: "A sensual, evocative fragrance born of the beautiful contradictions and the ever-present duality of modern women.",
        image: "https://fimgs.net/mdimg/perfume/375x500.39681.jpg",
        notes: "Tuberose, Jasmine, Tonka Bean"
      },
      {
        id: 2,
        name: "Dior Sauvage Elixir",
        price: 2200,
        category: "Spicy",
        description: "Sauvage Elixir is an extraordinarily concentrated fragrance steeped in the emblematic freshness of Sauvage.",
        image: "https://fimgs.net/mdimg/perfume/375x500.68415.jpg",
        notes: "Cinnamon, Nutmeg, Cardamom"
      },
      {
        id: 3,
        name: "Penhaligon's Halfeti",
        price: 3500,
        category: "Woody",
        description: "Inspired by the opulent goods traded in Turkey. A dark, mysterious, and captivating scent.",
        image: "https://fimgs.net/mdimg/perfume/375x500.31400.jpg",
        notes: "Oud, Leather, Saffron"
      },
      {
        id: 4,
        name: "Maison Francis Kurkdjian Baccarat Rouge 540",
        price: 4200,
        category: "Woody",
        description: "Luminous and sophisticated, Baccarat Rouge 540 lays on the skin like an amber, floral and woody breeze.",
        image: "https://fimgs.net/mdimg/perfume/375x500.33519.jpg",
        notes: "Amberwood, Fir Resin, Jasmine"
      },
      {
        id: 5,
        name: "Creed Aventus",
        price: 3800,
        category: "Fresh",
        description: "The exceptional Aventus was inspired by the dramatic life of a historic emperor, celebrating strength, power and success.",
        image: "https://fimgs.net/mdimg/perfume/375x500.9828.jpg",
        notes: "Pineapple, Birch, Musk"
      },
      {
        id: 6,
        name: "Tom Ford Black Orchid",
        price: 1900,
        category: "Floral",
        description: "A luxurious and sensual fragrance of rich, dark accords and an alluring potion of black orchids and spice.",
        image: "https://fimgs.net/mdimg/perfume/375x500.1018.jpg",
        notes: "Truffle, Orchid, Patchouli"
      }
    ];

    // 3. Insert them
    await Product.insertMany(seedProducts);

    res.json({ message: "Database Seeded Successfully!", products: seedProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROBUST SCRAPER ROUTE (PUPPETEER) ---
app.post('/api/scrape', async (req, res) => {
  let browser = null;
  try {
    const { url } = req.body;
    if (!url.includes('fragrantica.com')) {
      return res.status(400).json({ error: "Invalid URL. Use a Fragrantica link." });
    }

    console.log("🕶️ Launching Stealth Browser...");
    
    // 1. Launch a real browser (headless)
    browser = await puppeteer.launch({
      headless: "new", // Run in background
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    // 2. Set a real User-Agent so we look like a standard Laptop user
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 3. Go to the URL and wait for the page to actually load
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 4. Extract Data directly from the page context
    const data = await page.evaluate(() => {
      // This code runs INSIDE the browser page
      const name = document.querySelector('h1[itemprop="name"]')?.innerText.trim();
      const image = document.querySelector('img[itemprop="image"]')?.src;
      
      // Description logic
      let description = "";
      const descElement = document.querySelector('div[itemprop="description"]');
      if (descElement) {
        description = descElement.innerText.trim().substring(0, 400) + "...";
      }

      // Accords logic (Fragrantica specific bars)
      const accordElements = document.querySelectorAll('.cell.accordion-cell .accord-bar');
      const accords = Array.from(accordElements).map(el => el.innerText.trim());
      
      return {
        name,
        image,
        description,
        accords
      };
    });

    console.log("✅ Scraped Data:", data.name);

    // 5. Format Data for your App
    const notes = data.accords.length > 0 ? data.accords.slice(0, 5).join(', ') : "Musk, Amber, Wood";

    res.json({
      name: data.name || "Unknown Scent",
      image: data.image || "",
      description: data.description || "No description available.",
      notes: notes,
      category: "Niche"
    });

  } catch (error) {
    console.error("Puppeteer Error:", error.message);
    res.status(500).json({ error: "Security check blocked the scraper. Try again." });
  } finally {
    // ALWAYS close the browser to free up memory
    if (browser) await browser.close();
  }
});

// 9. SEED
// The new code has a placeholder for the seed route. I'll keep your existing logic.

app.listen(5000, () => console.log('🚀 Server running on http://127.0.0.1:5000'));