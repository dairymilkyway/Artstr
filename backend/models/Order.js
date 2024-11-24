  const mongoose = require('mongoose');

  const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    courier: { type: String, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, required: true },
    deliveredAt: { type: Date },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, required: true },
  });

  module.exports = mongoose.model('Order', orderSchema);