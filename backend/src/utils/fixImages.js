const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

dotenv.config();

(async () => {
  try {
    await connectDB();

    const products = await Product.find({});
    const updates = products.map(async (p, idx) => {
      // use picsum photos as reliable placeholder
      const newUrl = `https://picsum.photos/seed/p${p._id}/300/300`;
      if (p.imageUrl !== newUrl) {
        p.imageUrl = newUrl;
        await p.save();
      }
    });

    await Promise.all(updates);
    await mongoose.connection.close();
    console.log('✅ Image URLs updated to picsum.photos');
    process.exit(0);
  } catch (e) {
    console.error('❌ fixImages error:', e);
    process.exit(1);
  }
})();
