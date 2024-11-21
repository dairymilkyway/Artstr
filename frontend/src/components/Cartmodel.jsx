import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const CartModal = ({ open, handleClose, token }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `/api/cart/update/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data);
    } catch {
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch {
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2">
          Your Cart
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : cart && cart.items.length > 0 ? (
          <List>
            {cart.items.map((item) => (
              <ListItem key={item.product._id}>
                <ListItemText
                  primary={item.product.name || 'Unknown Product'}
                  secondary={`Quantity: ${item.quantity}`}
                />
                <Stack direction="row" spacing={1}>
                  <IconButton
                    aria-label="decrease quantity"
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    disabled={loading}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <IconButton
                    aria-label="increase quantity"
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    disabled={loading}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    aria-label="remove item"
                    onClick={() => removeItem(item.product._id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">Your cart is empty.</Typography>
        )}

        <Divider sx={{ my: 2 }} />
        <Button variant="contained" color="primary" onClick={handleClose}>
          Checkout
        </Button>
      </Box>
    </Modal>
  );
};

CartModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
};

export default CartModal;