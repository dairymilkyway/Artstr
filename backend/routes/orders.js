const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/authMiddleware');
const sendTransactionEmail = require('../utils/email');
const sendTransactionUpdateNotification = require('../utils/notifications');
const sendOrderDeliveredEmail = require('../utils/orderDeliveredEmail');
const sendOrderCanceledEmail = require('../utils/orderCanceledEmail');
// Get orders containing a specific product for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name').populate('items.product', 'name price');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
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

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      await sendOrderDeliveredEmail(order);
    } else if (status === 'canceled') {
      order.deliveredAt = null;
      await sendOrderCanceledEmail(order);
    }
    await order.save();


    await sendTransactionUpdateNotification(orderId, status);

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

router.get('/user-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({ orders, totalPages });
  } catch (error) {
    console.error('Error fetching paginated orders:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order details by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price photos');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error.message);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});
module.exports = router;