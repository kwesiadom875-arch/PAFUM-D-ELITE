const mongoose = require('mongoose');



const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  notes: { type: String }, // "Oud, Rose, Amber"

  // --- NEW FIELDS ---
  perfumer: { type: String, default: "Unknown" },
  rating: { type: Number, default: 4.5 },
  gender: { type: String, default: "Unisex" },
  season: { type: String, default: "All Year" }, // Winter, Summer, etc.
  accords: [
    { name: { type: String }, width: { type: String }, color: { type: String } }
  ]
});

module.exports = mongoose.model('Product', productSchema);