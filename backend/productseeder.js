require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Adjust the path to your Product model
const Rating = require('./models/Ratings'); // Adjust the path to your Rating model

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
  for (let i = 1; i <= 40; i++) {
    products.push({
      name: `Product ${i}`,
      price: Math.floor(Math.random() * 500) + 50, // Random price between 50 and 550
      category: `Category ${String.fromCharCode(65 + (i % 5))}`, // Cycle through Categories A-E
      details: `Details for Product ${i}`,
      photos: [
        `https://via.placeholder.com/150?text=Product+${i}+Image1`,
        `https://via.placeholder.com/150?text=Product+${i}+Image2`,
      ],
      stocks: Math.floor(Math.random() * 100) + 1, // Random stock between 1 and 100
    });
  }
  return products;
};

// Generate Placeholder Ratings
const generateRatings = async (productId) => {
  const ratings = [];
  for (let i = 1; i <= 5; i++) {
    ratings.push({
      userId: new mongoose.Types.ObjectId(), // Generate a new ObjectId for user
      productId: productId,
      rating: Math.floor(Math.random() * 5) + 1, // Random rating between 1 and 5
      comment: `Comment ${i} for product ${productId}`,
    });
  }
  await Rating.insertMany(ratings);
};

// Seed Function
const seedProducts = async () => {
  try {
    await Product.deleteMany(); // Clear existing products
    const products = generateProducts();
    const insertedProducts = await Product.insertMany(products); // Insert new products

    // Generate ratings for each product
    for (const product of insertedProducts) {
      await generateRatings(product._id);
    }

    console.log('Products and ratings seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding products and ratings:', error.message);
    process.exit(1);
  }
};

// Run Seeder
const runSeeder = async () => {
  await connectDB();
  await seedProducts();
};

runSeeder();