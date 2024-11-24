require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Adjust the path to your Product model
const User = require('./models/User'); // Assuming you have a User model

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
      reviews: [], // Placeholder for reviews
    });
  }
  return products;
};

// Generate Reviews for a Product
const generateReviews = async (productId) => {
  const reviews = [];
  const users = await User.find().limit(10); // Fetch 10 users for review generation
  const reviewCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 reviews

  for (let i = 0; i < reviewCount; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const rating = Math.floor(Math.random() * 5) + 1; // Random rating between 1 and 5
    const comment = `Review ${i + 1} for product ${productId}`;

    reviews.push({
      user: randomUser._id,
      rating,
      comment,
    });
  }

  // Calculate average rating and total ratings
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return { reviews, averageRating, totalRatings: reviews.length };
};

// Seed Function
const seedProducts = async () => {
  try {
    await Product.deleteMany(); // Clear existing products

    const products = generateProducts();

    for (const product of products) {
      const { reviews, averageRating, totalRatings } = await generateReviews(
        product._id
      );
      product.reviews = reviews;
      product.averageRating = averageRating.toFixed(1); // Round to 1 decimal
      product.totalRatings = totalRatings;
    }

    await Product.insertMany(products); // Insert products with reviews
    console.log('Products and reviews seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding products and reviews:', error.message);
    process.exit(1);
  }
};

// Run Seeder
const runSeeder = async () => {
  await connectDB();
  await seedProducts();
};

runSeeder();
