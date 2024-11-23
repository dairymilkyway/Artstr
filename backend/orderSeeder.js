require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const generateOrders = async () => {
  const products = await Product.find();
  const orders = [];

  for (let i = 0; i < 100; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const totalPrice = product.price * quantity;
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));

    orders.push({
      product: product._id,
      quantity,
      totalPrice,
      date,
    });
  }

  return orders;
};

const seedOrders = async () => {
  try {
    await Order.deleteMany();
    const orders = await generateOrders();
    await Order.insertMany(orders);
    console.log('Orders seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding orders:', error.message);
    process.exit(1);
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedOrders();
};

runSeeder();