require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Adjust the path to your Product model

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

// Sample artist names and descriptions
const artistNames = [
  "The Beatles",
  "Elvis Presley",
  "Michael Jackson",
  "Madonna",
  "Elton John",
  "Led Zeppelin",
  "Pink Floyd",
  "Rihanna",
  "Taylor Swift",
  "Beyoncé",
  "Eminem",
  "Adele",
  "Drake",
  "Kanye West",
  "Bruno Mars",
  "Ed Sheeran",
  "Ariana Grande",
  "Justin Bieber",
  "Lady Gaga",
  "Katy Perry"
];

const sampleDescriptions = [
  "This album features some of the greatest hits from the artist.",
  "A must-have for any music lover, this album showcases the artist's best work.",
  "Experience the magic of live performances with this concert album.",
  "A collection of rare tracks and unreleased songs from the artist.",
  "This merchandise is perfect for fans who want to show their support.",
  "High-quality vinyl record of the artist's most popular album.",
  "Limited edition merchandise featuring exclusive designs.",
  "A beautifully crafted album with stunning artwork and packaging.",
  "This album includes collaborations with other famous artists.",
  "A special edition album with bonus tracks and behind-the-scenes content."
];

// Generate Placeholder Products
const generateProducts = () => {
  const products = [];
  for (let i = 1; i <= 40; i++) {
    const artist = artistNames[Math.floor(Math.random() * artistNames.length)];
    const description = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];
    const category = ["Album", "Music", "Merch"][Math.floor(Math.random() * 3)];

    products.push({
      name: `${artist} - ${category} ${i}`,
      price: Math.floor(Math.random() * 500) + 50, // Random price between 50 and 550
      category: category,
      details: description,
      photos: [
        `https://via.placeholder.com/150?text=${encodeURIComponent(artist)}+Image1`,
        `https://via.placeholder.com/150?text=${encodeURIComponent(artist)}+Image2`,
      ],
      stocks: Math.floor(Math.random() * 100) + 1, // Random stock between 1 and 100
      reviews: [], // Placeholder for reviews
    });
  }
  return products;
};

// Seed Function
const seedProducts = async () => {
  try {
    await Product.deleteMany(); // Clear existing products

    const products = generateProducts();
    await Product.insertMany(products); // Insert products
    console.log('Products seeded successfully');
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