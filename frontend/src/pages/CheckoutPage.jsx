import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/Navbar';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = location.state || { items: [] };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    courier: '',
    paymentMethod: '',
  });
  const [extraFee, setExtraFee] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user;
        setFormData((prevData) => ({
          ...prevData,
          name: user.name || '',
          phoneNumber: user.mobileNumber || '',
          email: user.email || '',
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'courier') {
      if (value === 'J&T Express') {
        setExtraFee(10);
      } else if (value === 'Ninja Van') {
        setExtraFee(15);
      } else {
        setExtraFee(0);
      }
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/orders/checkout',
        { ...formData, items: items.map(item => ({ productId: item.product._id, quantity: item.quantity })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/dashboard', { state: { message: 'Checkout successful!' } }); // Redirect to dashboard with message
    } catch (error) {
      setError('Failed to process checkout');
      toast.error('Failed to process checkout', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = items.reduce((total, item) => total + item.quantity * item.product.price, 0);
  const totalAmount = totalPrice + extraFee;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#121212',
        color: '#fff',
      }}
    >
      <Navbar />
      <Container
        sx={{
          mt: 4,
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#fff' }}>
          Checkout
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: '70vh' }}>
            <List>
              {items.map((item) => (
                <ListItem key={item.product._id} sx={{ mb: 2, bgcolor: '#1c1c1c', borderRadius: 2, p: 2 }}>
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
                  <ListItemText
                    primary={item.product.name || 'Unknown Product'}
                    secondary={`Quantity: ${item.quantity} / Price: $${item.product.price}`}
                    primaryTypographyProps={{ color: '#fff' }}
                    secondaryTypographyProps={{ color: '#fff' }}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2, borderColor: '#fff' }} />
            <Box sx={{ overflowY: 'auto', maxHeight: '50vh' }}>
              <form>
                <TextField
                  label="Name"
                  name="name"
                  variant="outlined"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  sx={{ mb: 2, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#fff' }, '&:hover fieldset': { borderColor: '#ccc' }, '&.Mui-focused fieldset': { borderColor: '#fff' } } }}
                />
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  variant="outlined"
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  sx={{ mb: 2, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#fff' }, '&:hover fieldset': { borderColor: '#ccc' }, '&.Mui-focused fieldset': { borderColor: '#fff' } } }}
                />
                <TextField
                  label="Email"
                  name="email"
                  variant="outlined"
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ mb: 2, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#fff' }, '&:hover fieldset': { borderColor: '#ccc' }, '&.Mui-focused fieldset': { borderColor: '#fff' } } }}
                />
                <TextField
                  label="Address"
                  name="address"
                  variant="outlined"
                  fullWidth
                  value={formData.address}
                  onChange={handleChange}
                  sx={{ mb: 2, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#fff' }, '&:hover fieldset': { borderColor: '#ccc' }, '&.Mui-focused fieldset': { borderColor: '#fff' } } }}
                />
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#fff' }}>Courier</InputLabel>
                  <Select
                    name="courier"
                    value={formData.courier}
                    onChange={handleChange}
                    label="Courier"
                    sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' } }}
                  >
                    <MenuItem value="J&T Express">J&T Express - $10</MenuItem>
                    <MenuItem value="Ninja Van">Ninja Van - $15</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#fff' }}>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    label="Payment Method"
                    sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' } }}
                  >
                    <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                    <MenuItem value="GCash">GCash</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="h6" sx={{ color: '#fff', mt: 2 }}>
                  Total Amount: ${totalAmount.toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckout}
                  sx={{
                    bgcolor: '#1DB954',
                    '&:hover': { bgcolor: '#1ed760' },
                    textTransform: 'none',
                    fontSize: '1.2rem',
                    px: 4,
                    mt: 2,
                  }}
                >
                  Checkout
                </Button>
              </form>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CheckoutPage;