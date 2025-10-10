const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 }
}, { _id: false });

module.exports = CartItemSchema;
