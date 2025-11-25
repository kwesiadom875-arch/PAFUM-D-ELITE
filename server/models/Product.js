const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  notes: { type: String }, // "Oud, Rose, Amber"

  // --- SCENT INTEL FIELDS ---
  brand: { type: String, default: "Parfum D'Elite" },
  concentration: { type: String, default: "Eau de Parfum" },
  origin: { type: String, default: "France" },
  season: { type: String, default: "All Year" }, // Winter, Summer, etc.
  perfumer: { type: String, default: "Unknown" },
  rating: { type: Number, default: 4.5 },
  gender: { type: String, default: "Unisex" },
  accords: [
    { name: { type: String }, width: { type: String }, color: { type: String } }
  ],

  // --- INVENTORY MANAGEMENT ---
  stockQuantity: { type: Number, default: 10 }, // Main stock if no sizes
  isAvailable: { type: Boolean, default: true },
  
  // --- SIZE VARIANTS ---
  sizes: [{
    size: { type: String, required: true }, // e.g., "30ml", "50ml", "100ml"
    price: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    sku: { type: String } // Stock Keeping Unit for tracking
  }]
});

module.exports = mongoose.model('Product', productSchema);