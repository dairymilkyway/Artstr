const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Make orderId optional
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxLength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  details: { type: String },
  photos: [{ type: String }],
  stocks: { type: Number, required: true, default: 0 },
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
});

module.exports = mongoose.model('Product', productSchema);