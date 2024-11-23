const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/multerConfig');

const router = express.Router();

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
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

module.exports = router;