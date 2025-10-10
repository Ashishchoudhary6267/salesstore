const express = require('express');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');

const router = express.Router();

// We'll store cart on the user document transiently for simplicity
// You could also create a dedicated Cart collection.

// GET /api/cart - get current user's cart
router.get('/', auth, async (req, res) => {
  const cart = req.user.cart || { items: [], subtotal: 0 };
  res.json(cart);
});

// POST /api/cart - add item { productId, quantity }
router.post('/', auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const user = req.user;
  if (!user.cart) user.cart = { items: [], subtotal: 0 };
  const existing = user.cart.items?.find(i => String(i.product) === String(product._id));

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    user.cart.items.push({
      product: product._id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: Number(quantity)
    });
  }

  user.cart.subtotal = user.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  await user.save();
  res.status(201).json(user.cart);
});

// PUT /api/cart/:productId - update quantity
router.put('/:productId', auth, async (req, res) => {
  const { quantity } = req.body;
  const user = req.user;
  if (!user.cart) return res.json({ items: [], subtotal: 0 });

  const item = user.cart.items.find(i => String(i.product) === String(req.params.productId));
  if (!item) return res.status(404).json({ message: 'Item not in cart' });

  item.quantity = Number(quantity);
  if (item.quantity <= 0) {
    user.cart.items = user.cart.items.filter(i => String(i.product) !== String(req.params.productId));
  }
  user.cart.subtotal = user.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  await user.save();
  res.json(user.cart);
});

// DELETE /api/cart/:productId - remove item
router.delete('/:productId', auth, async (req, res) => {
  const user = req.user;
  if (!user.cart) return res.json({ items: [], subtotal: 0 });
  user.cart.items = user.cart.items.filter(i => String(i.product) !== String(req.params.productId));
  user.cart.subtotal = user.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  await user.save();
  res.json(user.cart);
});

// DELETE /api/cart - clear cart
router.delete('/', auth, async (req, res) => {
  const user = req.user;
  user.cart = { items: [], subtotal: 0 };
  await user.save();
  res.json(user.cart);
});

module.exports = router;
