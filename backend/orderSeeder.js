const mongoose = require('mongoose');
const Order = require('./models/Order'); // Assuming you have an Order model
const User = require('./models/User'); // Assuming you have a User model
const Product = require('./models/Product'); // Assuming you have a Product model
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const generateOrderData = async () => {
  const orders = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  const users = await User.find();
  const products = await Product.find();

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    const user = users[Math.floor(Math.random() * users.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const totalPrice = product.price * quantity;

    orders.push({
      user: user._id,
      name: user.name || 'John Doe', // Ensure name is populated
      items: [
        {
          product: product._id,
          quantity,
          totalPrice,
        },
      ],
      totalPrice,
      courier: 'DHL',
      status: 'pending',
      date: new Date(date),
      phoneNumber: user.phoneNumber || '123-456-7890',
      email: user.email || 'example@example.com',
      address: user.address || '123 Main St, Anytown, USA',
      paymentMethod: 'Credit Card',
    });
  }

  try {
    await Order.insertMany(orders);
    console.log('Order data seeded successfully');
  } catch (error) {
    console.error('Error seeding order data:', error);
  } finally {
    mongoose.connection.close();
  }
};

generateOrderData();