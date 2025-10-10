const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config();

(async () => {
  try {
    await connectDB();

    // Create admin user if not exists
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const password = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: 'admin123', // will be hashed by pre-save, but we already hashed above as a backup
        isAdmin: true
      });
      console.log('✅ Admin created: admin@example.com / admin123');
    } else {
      console.log('ℹ️ Admin already exists:', adminEmail);
    }

    // Seed sample products if none exist
    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      await Product.insertMany([
        {
          title: "Men's Cotton T-Shirt",
          description: 'Soft cotton tee for everyday wear',
          price: 19.99,
          imageUrl: 'https://via.placeholder.com/300x300.png?text=T-Shirt',
          category: "men's clothing",
          stock: 50
        },
        {
          title: "Women's Denim Jacket",
          description: 'Classic denim jacket with modern fit',
          price: 49.99,
          imageUrl: 'https://via.placeholder.com/300x300.png?text=Jacket',
          category: "women's clothing",
          stock: 30
        },
        {
          title: 'Gold Plated Necklace',
          description: 'Elegant jewelry for special occasions',
          price: 79.99,
          imageUrl: 'https://via.placeholder.com/300x300.png?text=Necklace',
          category: 'jewelery',
          stock: 20
        }
      ]);
      console.log('✅ Sample products inserted');
    } else {
      console.log(`ℹ️ Products already exist: ${existingCount}`);
    }

    await mongoose.connection.close();
    console.log('✅ Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
})();
