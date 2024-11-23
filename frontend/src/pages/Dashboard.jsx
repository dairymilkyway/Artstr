import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Grid, Alert, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      const response = await axios.post(
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

  useEffect(() => {
    fetchProducts();

    // Check for message in location state and show toast
    if (location.state?.message) {
      toast.success(location.state.message, { position: 'top-right' });
    }
  }, [location.state]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <Navbar />
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        padding: 3
      }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4}>
                <ProductCard product={product} onAddToCart={() => addToCart(product._id, 1)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;