import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, CircularProgress, Grid, Box } from '@mui/material';
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

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchProducts = async (page) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?page=${page}`, {
        headers: {
          Authorization: getToken(),
        },
      });
      const { products: newProducts, totalPages } = response.data;
      if (newProducts.length === 0 || page >= totalPages) {
        setHasMore(false);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      }
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
    fetchProducts(page);
  }, [page]);

  const fetchMoreData = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <Navbar />
      </Box>

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
        <InfiniteScroll
          dataLength={products.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<CircularProgress />}
          endMessage={
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
              No more products
            </Typography>
          }
          scrollableTarget="scrollableDiv"
          className="infinite-scroll" // Add a custom class for targeting
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
