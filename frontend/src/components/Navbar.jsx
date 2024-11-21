import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, TextField, IconButton, Avatar } from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import axios from 'axios';
import logo from '../assets/logo.png';
import CartModal from './CartModel';

const Navbar = () => {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      try {
        const response = await axios.get('/api/users/current', {
          headers: {
            Authorization: `Bearer ${token}`, // Adjust according to your authentication setup
          },
        });
        const user = response.data.user;
        setProfilePicture(user.profilePicture); // Assuming `profilePicture` is a URL
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
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
              onClick={() => setCartOpen(true)}
              sx={commonButtonStyles}
            >
              <ShoppingCartIcon />
            </IconButton>
            {/* Profile Picture */}
            <IconButton onClick={() => navigate('/profile')} sx={{ padding: 0 }}>
              <Avatar
                src={profilePicture || './assets/default-profile.png'} // Replace with your default image URL
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

      <CartModal open={cartOpen} handleClose={() => setCartOpen(false)} token={token} />
    </>
  );
};

export default Navbar;
