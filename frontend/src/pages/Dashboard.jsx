import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, CircularProgress, Grid, Alert, Box } from '@mui/material';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: {
            Authorization: getToken(),
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

    fetchProducts();
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;