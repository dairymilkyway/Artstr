const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Assuming you have an Order model

router.get('/', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.json(salesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;