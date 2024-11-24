const express = require('express');
const User = require('../models/User'); 
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/multerConfig');
const Order = require('../models/Order'); 
const Filter = require('bad-words');
const router = express.Router();

// Get all products with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 products per page
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(); // Total number of products
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({ 
      products, 
      currentPage: page, 
      totalPages 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new product with photo uploads
router.post('/', authMiddleware, upload.array('photos', 10), async (req, res) => {
  try {
    const { name, price, category, details, stocks } = req.body; // Include stocks
    const photos = req.files.map((file) => file.path); // Cloudinary URLs

    const newProduct = new Product({ name, price, category, details, photos, stocks }); // Add stocks here
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a product
router.put('/:id', authMiddleware, upload.array('photos', 10), async (req, res) => {
  try {
    const { name, price, category, details, stocks } = req.body; // Include stocks
    const photos = req.files.map((file) => file.path); // Cloudinary URLs

    const updateFields = { name, price, category, details, stocks }; // Add stocks here
    if (photos.length > 0) {
      updateFields.photos = photos;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete products
router.post('/delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Products deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add a review to a product
router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    // Check if the user has ordered the product
    const orders = await Order.find({ user: userId, 'items.product': productId });
    if (orders.length === 0) {
      return res.status(403).json({ message: 'You can only review products you have ordered' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(userId);

    // Filter bad words from the comment
    const filter = new Filter();
    const cleanComment = filter.clean(comment);

    const review = {
      user: userId,
      rating,
      comment: cleanComment,
      userName: user.name,
    };

    product.reviews.push(review);

    // Update the average rating
    product.totalRatings += 1;
    product.averageRating =
      product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.totalRatings;

    await product.save();
    res.status(201).json({ message: 'Review added successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Update a review
router.put('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the review to update
    const reviewIndex = product.reviews.findIndex(
      (review) => review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res
        .status(403)
        .json({ message: 'You can only update your own review' });
    }

    // Update the review
    const filter = new Filter();
    product.reviews[reviewIndex].rating = rating;
    product.reviews[reviewIndex].comment = filter.clean(comment);

    // Recalculate average rating
    product.averageRating =
      product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(200).json({ message: 'Review updated successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a product
router.get('/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate('reviews.user', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch orders to get the reviewer's name
    const orders = await Order.find({ 'items.product': productId }).populate('user', 'name');
    const reviewsWithNames = product.reviews.map(review => {
      const order = orders.find(order => order.user._id.toString() === review.user._id.toString());
      return {
        ...review.toObject(),
        userName: order ? order.user.name : 'Unknown',
      };
    });

    res.json(reviewsWithNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;