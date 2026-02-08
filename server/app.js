const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const scraperRoutes = require('./routes/scraperRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const requestRoutes = require('./routes/requestRoutes');
const featuredRoutes = require('./routes/featuredRoutes');
const featuredShowcaseRoutes = require('./routes/featuredShowcaseRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const climateTestRoutes = require('./routes/climateTestRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const siteConfigRoutes = require('./routes/siteConfigRoutes');
const catalogController = require('./controllers/catalogController'); // Direct controller usage for simplicity or create a route file

// We can create a separate route file, but for now let's just add it here or create routes/catalogRoutes.js
// Let's create routes/catalogRoutes.js to be consistent.
const catalogRoutes = require('./routes/catalogRoutes');
const imageProxyRoutes = require('./routes/imageProxyRoutes');

const app = express();
app.use(cors({
  origin: [
    "https://pafum-d-elite.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// --- CONFIGURATION ---
if (process.env.NODE_ENV !== 'test') {
  const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

  mongoose.connect(dbAddress)
    .then(() => {
      console.log('[OK] MongoDB Connected');
    })
    .catch(err => console.error('[ERR] MongoDB Error:', err));
}

// Request Logging Middleware
app.use((req, res, next) => {
  // Disable logging in test environment
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', aiRoutes); // Note: aiRoutes handles /api/josie and /api/ai/scent-discovery
app.use('/api', scraperRoutes); // Note: scraperRoutes handles /api/scrape
app.use('/api/reviews', reviewRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/featured-showcase', featuredShowcaseRoutes);
app.use('/api/negotiate', negotiationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/climate-tests', climateTestRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/config', siteConfigRoutes);
app.use('/api/catalog', catalogRoutes);

// Proxy Image Route (Secure)
app.use('/proxy-image', imageProxyRoutes);

module.exports = app;
