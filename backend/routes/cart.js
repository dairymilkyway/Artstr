const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
  }
  return cart;
};

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve cart', error: error.message });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    let cart = await getOrCreateCart(req.user.id);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
});

// Update item quantity
router.put('/update/:productId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item quantity', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

module.exports = router;