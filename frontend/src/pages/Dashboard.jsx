import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Grid, Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import './Dashboard.css'; // Import custom styles

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [priceRange, setPriceRange] = useState([0, 1000]); // Default price range
  const [ratingFilter, setRatingFilter] = useState(0); // Default no rating filter

  const getToken = () => localStorage.getItem('token');

  const fetchProducts = async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        params: { page },
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

  const filterProducts = () => {
    const filtered = products.filter((product) => {
      // Apply price range filter
      const matchesPriceRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      // Apply rating filter
      const matchesRating = ratingFilter > 0 ? product.averageRating >= ratingFilter : true;

      return matchesPriceRange && matchesRating;
    });

    setFilteredProducts(filtered);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleRatingChange = (event) => {
    setRatingFilter(event.target.value); // Set rating filter to the selected value
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

  // Fetch products when page changes
  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // Filter products when priceRange or ratingFilter changes
  useEffect(() => {
    filterProducts();
  }, [priceRange, ratingFilter, products]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <Navbar />
      </Box>

 {/* Filters Section */}
<Box
  sx={{
    padding: 3,
    backgroundColor: '#121212',
    borderRadius: 10,
    boxShadow: 2,
    marginTop: 3,
    marginBottom: 3,

  }}
>
  <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
    Price Range
  </Typography>
  <Slider
    value={priceRange}
    onChange={handlePriceChange}
    valueLabelDisplay="auto"
    min={0}
    max={1000}
    step={10}
    sx={{
      marginBottom: 3,
      '& .MuiSlider-thumb': {
        color: '#1DB954',
      },
      '& .MuiSlider-track': {
        color: '#1DB954',
      },
      '& .MuiSlider-rail': {
        color: '#444',
      },
    }}
  />

  <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
    Minimum Rating
  </Typography>
  <FormControl fullWidth>
    <InputLabel sx={{ color: '#FFFFFF' }}>Rating</InputLabel>
    <Select
  value={ratingFilter}
  onChange={handleRatingChange}
  label="Rating"
  sx={{
    marginBottom: 2,
    color: '#FFFFFF',
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: '#1DB954',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1DB954',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1DB954',
    },
  }}
  MenuProps={{
    PaperProps: {
      sx: {
        backgroundColor: '#121212',
        color: '#FFFFFF',
      },
    },
  }}
>
  <MenuItem value={0} sx={{ color: '#FFFFFF' }}>All Ratings</MenuItem>
  <MenuItem value={1} sx={{ color: '#FFFFFF' }}>1 Star and above</MenuItem>
  <MenuItem value={2} sx={{ color: '#FFFFFF' }}>2 Stars and above</MenuItem>
  <MenuItem value={3} sx={{ color: '#FFFFFF' }}>3 Stars and above</MenuItem>
  <MenuItem value={4} sx={{ color: '#FFFFFF' }}>4 Stars and above</MenuItem>
  <MenuItem value={5} sx={{ color: '#FFFFFF' }}>5 Stars</MenuItem>
</Select>
  </FormControl>
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
          dataLength={filteredProducts.length}
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
            {filteredProducts.map((product) => (
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
