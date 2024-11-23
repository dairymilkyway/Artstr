// ratings.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxLength: 500
    }
}, { timestamps: true });

// Static method to calculate average rating
ratingSchema.statics.getAverageRating = async function(productId) {
    const result = await this.aggregate([
        { $match: { productId: productId } },
        { 
            $group: {
                _id: '$productId',
                averageRating: { $avg: '$rating' },
                numberOfRatings: { $sum: 1 }
            }
        }
    ]);
    return result[0] || { averageRating: 0, numberOfRatings: 0 };
};

// Update product's average rating after save
ratingSchema.post('save', async function() {
    const stats = await this.constructor.getAverageRating(this.productId);
    // Assuming Product model has averageRating and totalRatings fields
    await mongoose.model('Product').findByIdAndUpdate(this.productId, {
        averageRating: Math.round(stats.averageRating * 10) / 10,
        totalRatings: stats.numberOfRatings
    });
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;