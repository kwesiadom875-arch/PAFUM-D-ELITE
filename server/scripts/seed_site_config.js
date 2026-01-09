const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const SiteConfig = require('../models/SiteConfig');

const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

const seedData = [
  {
    key: 'home_hero',
    value: {
      title: 'SCENT OF\nKINGS', 
      subtitle: 'Experience the art of luxury perfumery. Crafted for the elite.',
      buttonText: 'SHOP COLLECTION',
      buttonLink: '/shop',
      backgroundImage: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2574&auto=format&fit=crop'
    }
  },
  {
    key: 'home_banners',
    value: [
        {
            id: 1,
            title: "Women's Fragrances",
            subtitle: "Elegant & captivating scents",
            link: "/shop?category=Women",
            image: "https://images.unsplash.com/photo-1585120040315-2241b774ad0f?q=80&w=2670&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Men's Fragrances",
            subtitle: "Bold & sophisticated scents",
            link: "/shop?category=Men",
            image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2670&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Luxury Collections",
            subtitle: "Exclusive designer perfumes",
            link: "/shop?category=Luxury",
            image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2669&auto=format&fit=crop"
        }
    ]
  }
];

const seed = async () => {
  try {
    await mongoose.connect(dbAddress);
    console.log('[OK] Connected to MongoDB');

    for (const item of seedData) {
      await SiteConfig.findOneAndUpdate(
        { key: item.key },
        { value: item.value, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log(`[OK] Seeded ${item.key}`);
    }

    console.log('[SUCCESS] Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('[ERR] Seeding failed:', error);
    process.exit(1);
  }
};

seed();
