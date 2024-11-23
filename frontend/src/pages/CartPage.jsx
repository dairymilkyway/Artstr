import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../components/Navbar';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 5; // Display 5 items per page
  const token = localStorage.getItem('token');

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data); // Ensure the cart is updated
    } catch (error) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity, stocks) => {
    if (quantity < 1 || quantity > stocks) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/cart/update/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCart(response.data); // Update cart with server response
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(response.data); // Update cart with server response
    } catch (error) {
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate items for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = cart?.items?.slice(startIndex, endIndex) || [];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box
      sx={{
        height: '100vh', // Full viewport height
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#121212',
        color: '#fff', // Text color set to white
      }}
    >
      <Navbar />
      <Container
        sx={{
          mt: 4,
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Prevent overflowing outside the viewport
        }}
      >
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : currentItems.length > 0 ? (
          <>
            {/* Scrollable Area */}
            <Box
              sx={{
                flex: '1', // Take up remaining space
                overflowY: 'auto', // Enable vertical scrolling
                pr: 2, // Padding for scrollbar
                maxHeight: '70vh', // Limit the height to allow scrolling
              }}
            >
              <List>
                {currentItems.map((item) => (
                  <ListItem
                    key={item.product._id}
                    sx={{
                      mb: 2,
                      bgcolor: '#1c1c1c',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                    }}
                  >
                    {/* Product Image */}
                    <Box
                      component="img"
                      src={
                        item.product.photos && item.product.photos.length > 0
                          ? item.product.photos[0]
                          : 'https://via.placeholder.com/80'
                      }
                      alt={item.product.name || 'Product Image'}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 2,
                        mr: 2,
                      }}
                    />

                    {/* Product Details */}
                    <ListItemText
                      primary={item.product.name || 'Unknown Product'}
                      secondary={`Quantity: ${item.quantity} / Stock: ${item.product.stocks}`}
                      primaryTypographyProps={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                      }}
                      secondaryTypographyProps={{ color: '#b3b3b3' }}
                    />

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity - 1,
                            item.product.stocks
                          )
                        }
                        disabled={loading}
                        sx={{
                          color: '#1DB954',
                          '&:focus': { outline: '2px solid #1DB954' },
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <IconButton
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity + 1,
                            item.product.stocks
                          )
                        }
                        disabled={loading || item.quantity >= item.product.stocks} // Disable when quantity matches stocks
                        sx={{
                          color: '#1DB954',
                          '&:focus': { outline: '2px solid #1DB954' },
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        aria-label="Remove item"
                        onClick={() => removeItem(item.product._id)}
                        disabled={loading}
                        sx={{
                          color: '#ff4d4d',
                          '&:focus': { outline: '2px solid #ff4d4d' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={Math.ceil((cart?.items?.length || 0) / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        ) : (
          <Typography variant="body1" sx={{ mt: 4 }}>
            Your cart is empty.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Total Price */}
        {cart?.totalPrice && (
          <Typography
            variant="h6"
            sx={{
              textAlign: 'right',
              color: '#fff',
              fontWeight: 'bold',
              mt: 2,
            }}
          >
            Total Price: ${cart.totalPrice.toFixed(2)}
          </Typography>
        )}

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/checkout')}
            sx={{
              bgcolor: '#1DB954',
              '&:hover': { bgcolor: '#1ed760' },
              textTransform: 'none',
              fontSize: '1.2rem',
              px: 4,
            }}
          >
            Checkout
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CartPage;
