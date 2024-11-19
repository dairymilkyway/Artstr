require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Adjust the path to your Product model

// Connect to MongoDB using environment variables
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

// Generate Placeholder Products
const generateProducts = () => {
  const products = [];
  for (let i = 1; i <= 25; i++) {
    products.push({
      name: `Product ${i}`,
      price: Math.floor(Math.random() * 500) + 50, // Random price between 50 and 550
      category: `Category ${String.fromCharCode(65 + (i % 5))}`, // Cycle through Categories A-E
      details: `Details for Product ${i}`,
      photos: [
        `https://via.placeholder.com/150?text=Product+${i}+Image1`,
        `https://via.placeholder.com/150?text=Product+${i}+Image2`,
      ],
    });
  }
  return products;
};

// Products to Seed
const products = generateProducts();

// Seed Function
const seedProducts = async () => {
  try {
    await Product.deleteMany(); // Clear existing products
    await Product.insertMany(products); // Insert new products
    console.log('25 Products seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
};

// Run Seeder
const runSeeder = async () => {
  await connectDB();
  await seedProducts();
};

runSeeder();
