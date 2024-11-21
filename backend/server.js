const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRouter = require('./routes/cart');
const userRoutes = require('./routes/user'); // Import the user routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/users', userRoutes); // Add the user routes for profile updates

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log('Server is running on port 5000');
});