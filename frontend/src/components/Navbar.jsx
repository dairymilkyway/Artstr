import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { AppBar, Toolbar, Typography, Button, Box, TextField, IconButton, Avatar, Badge } from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import axios from 'axios';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchCartItemsCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItemsCount(response.data.items ? response.data.items.length : 0);
    } catch (error) {
      console.error('Error fetching cart items count:', error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user;
        setProfilePicture(user.profilePicture);
      } catch (error) {
        console.error('Error fetching profile picture:', error.response?.data?.message || error.message);
      }
    };

    fetchProfilePicture();
    fetchCartItemsCount();
  }, [token]);

  const commonButtonStyles = {
    textTransform: 'none',
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 10,
    },
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="secondary"
        sx={{
          padding: '12px 0',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 20,
          marginTop: 5,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            padding: '0 24px',
          }}
        >
          {/* Left Section */}
          <Box display="flex" alignItems="center">
            <img src={logo} alt="Logo" style={{ height: 50, marginRight: 12 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
            >
              ARTSTR
            </Typography>
          </Box>

          {/* Center Section */}
          <Box
            display="flex"
            alignItems="center"
            sx={{ flexGrow: 1, mx: 3, justifyContent: 'center' }}
          >
            <TextField
              variant="outlined"
              placeholder="Search products..."
              size="small"
              sx={{
                width: 300,
                backgroundColor: 'white',
                borderRadius: 25,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 25,
                  fontSize: '1rem',
                },
              }}
            />
            <IconButton color="inherit" aria-label="search" sx={{ ml: 1 }}>
              <FaSearch />
            </IconButton>
          </Box>

          {/* Right Section */}
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              color="inherit"
              startIcon={<StarIcon />}
              sx={commonButtonStyles}
            >
              Reviews
            </Button>
            <Button
              color="inherit"
              startIcon={<LocalMallIcon />}
              onClick={() => navigate('/orders')}
              sx={commonButtonStyles}
            >
              Orders
            </Button>
            <IconButton
  color="inherit"
  onClick={() => navigate('/cart')}
  sx={commonButtonStyles}
>
  <Badge
    badgeContent={
      location.pathname === '/cart' || location.pathname === '/checkout'
        ? 0 // No badge count on '/cart' or '/checkout'
        : cartItemsCount
    }
    color="error"
  >
    <ShoppingCartIcon />
  </Badge>
</IconButton>

            {/* Profile Picture */}
            <IconButton onClick={() => navigate('/profile')} sx={{ padding: 0 }}>
              <Avatar
                src={profilePicture || './assets/default-profile.png'} // Use default image if no profile picture
                alt="Profile"
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
            </IconButton>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              sx={commonButtonStyles}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
