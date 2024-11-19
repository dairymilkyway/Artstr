const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  details: { type: String },
  photos: [{ type: String }], // Array of photo URLs
});

module.exports = mongoose.model('Product', productSchema);
