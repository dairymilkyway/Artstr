const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/authMiddleware');
const sendTransactionEmail = require('../utils/email');


// Get orders containing a specific product for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.query;
    const orders = await Order.find({ user: req.user.id, 'items.product': productId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
});


// Checkout route
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { items, name, phoneNumber, email, address, courier, paymentMethod } = req.body;
    const userId = req.user.id;

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stocks < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      const itemTotalPrice = (product.price || 0) * (item.quantity || 0); // Safeguard to ensure no undefined values
      totalPrice += itemTotalPrice;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        totalPrice: itemTotalPrice,
      });

      // Reduce the stock
      product.stocks -= item.quantity;
      await product.save();
    }

    // Add extra fee based on courier
    let extraFee = 0;
    if (courier === 'J&T Express') {
      extraFee = 10;
    } else if (courier === 'Ninja Van') {
      extraFee = 15;
    }

    // Ensure totalPrice is a valid number
    const finalTotalPrice = parseFloat((totalPrice + extraFee).toFixed(2)); // Add safeguard for undefined values

    const order = new Order({
      user: userId,
      name,
      items: orderItems,
      totalPrice: finalTotalPrice,
      courier,
      status: 'pending',
      date: new Date(),
      deliveredAt: null, // Set to null initially
      phoneNumber,
      email,
      address,
      paymentMethod,
    });

    await order.save();

    // Remove only the checked-out items from the cart
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = cart.items.filter(cartItem =>
        !items.some(checkedOutItem => checkedOutItem.productId === cartItem.product.toString())
      );
      await cart.save();
    }

    // Send transaction email
    await sendTransactionEmail(order);

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error processing checkout:', error.message);
    res.status(500).json({ message: 'Failed to process checkout' });
  }
});

  

module.exports = router;