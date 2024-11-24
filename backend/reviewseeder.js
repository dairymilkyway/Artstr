require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

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

// Sample comments
const sampleComments = [
  "Great product, highly recommend!",
  "Good value for the price.",
  "Quality could be better, but overall satisfied.",
  "Exceeded my expectations!",
  "Not what I expected, but it works.",
  "Would buy again.",
  "Fast shipping and good packaging.",
  "Customer service was very helpful.",
  "The product arrived damaged.",
  "Five stars, very happy with my purchase.",
  "It's okay, does the job.",
  "Amazing quality, will definitely buy more.",
  "Not worth the price.",
  "Very satisfied with this product.",
  "The product description was accurate.",
  "I had some issues, but they were resolved quickly.",
  "The color was different than expected.",
  "Works as advertised.",
  "I love it!",
  "Would not recommend."
];

// Generate Random Reviews
const generateReviews = async () => {
  const products = await Product.find(); // Fetch all products
  const users = await User.find(); // Fetch all users

  if (!users.length || !products.length) {
    throw new Error('No users or products found to generate reviews.');
  }

  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const rating = Math.floor(Math.random() * 5) + 1; // Random rating between 1 and 5
    const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];

    randomProduct.reviews.push({
      user: randomUser._id,
      rating,
      comment,
    });

    // Recalculate average rating and total ratings
    randomProduct.totalRatings = randomProduct.reviews.length;
    randomProduct.averageRating =
      randomProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / randomProduct.totalRatings;
  }

  // Save all products after adding reviews
  await Promise.all(products.map(product => product.save()));
  console.log('Reviews seeded successfully');
};

// Seed Reviews
const seedReviews = async () => {
  try {
    await connectDB();
    await generateReviews();
    process.exit();
  } catch (error) {
    console.error('Error seeding reviews:', error.message);
    process.exit(1);
  }
};

// Run Seeder
seedReviews();