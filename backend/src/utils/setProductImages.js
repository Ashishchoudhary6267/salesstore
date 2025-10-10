const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

dotenv.config();

// Map product title -> image URL
const imageMap = new Map([
  ["Men's Cotton T-Shirt", 'https://images.unsplash.com/photo-1520975922284-6a9f6f77384f?q=80&w=800&auto=format&fit=crop'],
  ["Women's Denim Jacket", 'https://images.unsplash.com/photo-1520974735194-35a44c0c4a3f?q=80&w=800&auto=format&fit=crop'],
  ['Gold Plated Necklace', 'https://images.unsplash.com/photo-1518552781854-02e8d9792412?q=80&w=800&auto=format&fit=crop']
]);

(async () => {
  try {
    await connectDB();
    const products = await Product.find({});
    for (const p of products) {
      const url = imageMap.get(p.title);
      if (url && p.imageUrl !== url) {
        p.imageUrl = url;
        await p.save();
        console.log('Updated image for', p.title);
      }
    }
    await mongoose.connection.close();
    console.log('✅ Product images set based on titles');
    process.exit(0);
  } catch (e) {
    console.error('❌ setProductImages error:', e);
    process.exit(1);
  }
})();
