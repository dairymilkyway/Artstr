import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, CircularProgress, Grid, Box, TextField, MenuItem, Slider, Select } from '@mui/material';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import './Dashboard.css'; // Import custom styles

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState([]);

  const getToken = () => localStorage.getItem('token');

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: getToken() },
      });
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        params: {
          page,
          priceRange: priceRange.join(','), // Format as "min,max"
          category,
          rating,
        },
        headers: { Authorization: getToken() },
      });
      const { products: newProducts, totalPages } = response.data;

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      }

      setHasMore(page < totalPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Item added to cart', { position: 'top-right' });
    } catch (error) {
      toast.error('Failed to add item to cart', { position: 'top-right' });
      console.error(error);
    }
  };

  // Update filters and reset products
  const handleFilterChange = () => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true); // Reset products with new filters
  };

  useEffect(() => {
    fetchProducts(page);
    fetchCategories();
  }, [page]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <Navbar />
      </Box>

      {/* Filters Section */}
      <Box sx={{ padding: 3, backgroundColor: '#f5f5f5', display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            handleFilterChange();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.name}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          onChangeCommitted={handleFilterChange} // Trigger API call after final value
          valueLabelDisplay="auto"
          max={1000}
          sx={{ width: 200 }}
          aria-labelledby="price-range-slider"
        />
        <Typography>Price: ${priceRange[0]} - ${priceRange[1]}</Typography>

        <Select
          value={rating}
          onChange={(e) => {
            setRating(e.target.value);
            handleFilterChange();
          }}
          displayEmpty
          sx={{ minWidth: 120 }}
        >
          <MenuItem value={0}>All Ratings</MenuItem>
          <MenuItem value={1}>1 Star & Up</MenuItem>
          <MenuItem value={2}>2 Stars & Up</MenuItem>
          <MenuItem value={3}>3 Stars & Up</MenuItem>
          <MenuItem value={4}>4 Stars & Up</MenuItem>
          <MenuItem value={5}>5 Stars</MenuItem>
        </Select>
      </Box>

      {/* Product List */}
      <Box
        id="scrollableDiv"
        sx={{
          flexGrow: 1,
          padding: 3,
          height: '100%',
          overflow: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        {loading && page === 1 && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        <InfiniteScroll
          dataLength={products.length}
          next={() => setPage((prevPage) => prevPage + 1)}
          hasMore={hasMore}
          loader={<CircularProgress />}
          endMessage={
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
              No more products
            </Typography>
          }
          scrollableTarget="scrollableDiv"
          className="infinite-scroll"
        >
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} onAddToCart={() => addToCart(product._id, 1)} />
              </Grid>
            ))}
          </Grid>
        </InfiniteScroll>
      </Box>
    </Box>
  );
};

export default Dashboard;
