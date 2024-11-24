require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User'); // Assuming User model exists

// Connect to MongoDB
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

// Generate Random Orders
const generateOrders = async () => {
  const products = await Product.find(); // Fetch all products
  const users = await User.find().limit(10); // Fetch some users

  if (!users.length || !products.length) {
    throw new Error('No users or products found to generate orders.');
  }

  const orders = [];
  for (let i = 0; i < 100; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 10) + 1; // Random quantity between 1 and 10
    const totalPrice = randomProduct.price * quantity;

    // Generate a random date within the last 12 months
    const orderDate = new Date();
    orderDate.setMonth(orderDate.getMonth() - Math.floor(Math.random() * 12));

    orders.push({
      user: randomUser._id, // Assign user
      name: randomUser.name || `User${randomUser._id}`, // Use user's name or fallback
      items: [
        {
          product: randomProduct._id, // Reference product ID
          quantity,
          totalPrice,
        },
      ],
      totalPrice,
      courier: ['J&T Express', 'Ninja Van'][Math.floor(Math.random() * 2)], // Random courier
      status: ['pending', 'shipped', 'delivered'][Math.floor(Math.random() * 3)], // Random status
      date: orderDate,
      deliveredAt: Math.random() > 0.5 ? new Date(orderDate.getTime() + Math.random() * 1e8) : null, // Some delivered
      phoneNumber: randomUser.phoneNumber || `+1234567890${i}`, // Use user's phone or fallback
      email: randomUser.email || `user${i}@example.com`, // Use user's email or fallback
      address: randomUser.address || `123 Street Name, City ${i}`, // Use user's address or fallback
      paymentMethod: ['Cash on Delivery', 'GCash'][Math.floor(Math.random() * 2)], // Random payment method
    });
  }

  return orders;
};

// Seed Orders
const seedOrders = async () => {
  try {
    await Order.deleteMany(); // Clear existing orders
    const orders = await generateOrders();
    await Order.insertMany(orders); // Insert generated orders
    console.log('Orders seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding orders:', error.message);
    process.exit(1);
  }
};

// Run Seeder
const runSeeder = async () => {
  await connectDB();
  await seedOrders();
};

runSeeder();
