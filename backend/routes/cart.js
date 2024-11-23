const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product'); // Populate the product field
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
  }
  return cart;
};


const updateCartTotalPrice = async (cart) => {
  try {
    // Calculate the total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      if (!item.product || typeof item.product.price !== 'number') {
        console.error('Invalid product or price in cart item:', item);
        return total; // Skip invalid items
      }
      return total + item.quantity * item.product.price;
    }, 0);

    await cart.save();
  } catch (error) {
    console.error('Error updating cart total price:', error.message);
  }
};


// Get the user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.json({ items: [], totalPrice: 0 });
    }
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ message: 'Failed to retrieve cart' });
  }
});

// Add item to the cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product._id.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await updateCartTotalPrice(cart);
    res.json(cart);
  } catch (error) {
    console.error('Error adding item to cart:', error.message);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

// Update the quantity of a cart item
router.put('/update/:productId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product._id.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;

    await updateCartTotalPrice(cart);
    res.json(cart);
  } catch (error) {
    console.error('Error updating quantity:', error.message);
    res.status(500).json({ message: 'Failed to update item quantity' });
  }
});

// Remove an item from the cart
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product._id.toString() !== productId);

    await updateCartTotalPrice(cart);
    res.json(cart);
  } catch (error) {
    console.error('Error removing item from cart:', error.message);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

module.exports = router;