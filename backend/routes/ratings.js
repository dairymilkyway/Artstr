const Rating = require('./ratings');
const express = require('express');
const router = express.Router();

// Create a new rating
router.post('/ratings', async (req, res) => {
    try {
        const rating = new Rating(req.body);
        await rating.save();
        res.status(201).send(rating);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all ratings
router.get('/ratings', async (req, res) => {
    try {
        const ratings = await Rating.find();
        res.status(200).send(ratings);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a rating by ID
router.get('/ratings/:id', async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).send();
        }
        res.status(200).send(rating);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a rating by ID
router.patch('/ratings/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['rating', 'comment'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).send();
        }

        updates.forEach((update) => rating[update] = req.body[update]);
        await rating.save();
        res.status(200).send(rating);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a rating by ID
router.delete('/ratings/:id', async (req, res) => {
    try {
        const rating = await Rating.findByIdAndDelete(req.params.id);
        if (!rating) {
            return res.status(404).send();
        }
        res.status(200).send(rating);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get average rating for a product
router.get('/ratings/average/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const averageRating = await Rating.getAverageRating(productId);

        res.status(200).send(averageRating);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get all ratings for a product
router.get('/ratings', async (req, res) => {
    try {
        const { productId } = req.query;
        const ratings = await Rating.find({ productId });
        res.status(200).send(ratings);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;