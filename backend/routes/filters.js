const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/products', async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice, rating, page = 1, limit = 20 } = req.query;

    // Convert to proper types
    const parsedMinPrice = parseFloat(minPrice) || 0;
    const parsedMaxPrice = parseFloat(maxPrice) || 1000;
    const parsedRating = parseFloat(rating) || 0;
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 20;

    // Build the filter query
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // Case-insensitive regex search
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = { $gte: parsedMinPrice, $lte: parsedMaxPrice };
    }

    if (rating) {
      filter.averageRating = { $gte: parsedRating };
    }

    // Pagination logic
    const skip = (parsedPage - 1) * parsedLimit;

    // Fetch products based on the filters
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parsedLimit)
      .exec();

    // Count the total number of products matching the filter (for pagination)
    const totalProducts = await Product.countDocuments(filter);

    // Return products and pagination data
    res.json({
      products,
      totalPages: Math.ceil(totalProducts / parsedLimit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;