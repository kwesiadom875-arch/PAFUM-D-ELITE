const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Product = require('../models/Product');
const catalogPath = path.resolve(__dirname, '../data/catalog.json');
const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

async function seedProducts() {
    try {
        await mongoose.connect(dbAddress);
        console.log('Connected to MongoDB');

        const data = fs.readFileSync(catalogPath, 'utf8');
        const catalog = JSON.parse(data);

        console.log(`Found ${catalog.length} products in catalog.json`);

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        const productsToInsert = catalog.slice(0, 100).map((item, index) => {
            const gender = item.name.includes('(U)') ? 'Unisex' : (item.name.includes('(M)') ? 'Men' : 'Women');
            return {
                id: index + 1,
                name: item.name,
                brand: item.brand,
                price: Math.floor(Math.random() * 200) + 50,
                category: gender,
                description: `Experience the premium scent of ${item.name} by ${item.brand}.`,
                image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2669&auto=format&fit=crop',
                notes: 'Bergamot, Jasmine, Musk',
                concentration: 'Eau de Parfum',
                gender: gender,
                rating: 4.5 + Math.random() * 0.5,
                stockQuantity: 10,
                isAvailable: true
            };
        });

        await Product.insertMany(productsToInsert);
        console.log(`Successfully seeded ${productsToInsert.length} products`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
}

seedProducts();
