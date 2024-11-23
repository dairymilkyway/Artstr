const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
    const { startDate, endDate } = req.query;
    const filter = {};
  
    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
  
    try {
      const orders = await Order.find(filter).populate('product');
      const salesData = orders.reduce((acc, order) => {
        const month = order.date.toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + order.totalPrice;
        return acc;
      }, {});
  
      const labels = Object.keys(salesData);
      const sales = Object.values(salesData);
  
      // Validate response structure
      if (!labels.length || !sales.length) {
        throw new Error('No sales data available');
      }
  
      res.json({ labels, sales });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({ message: 'Error fetching sales data' });
    }
  });
  
module.exports = router;