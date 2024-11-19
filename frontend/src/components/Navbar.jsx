import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, TextField, IconButton } from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static" color="secondary" sx={{ padding: '12px 0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: 20 }}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', padding: '0 24px' }}>
        {/* Left Section */}
        <Box display="flex" alignItems="center">
          <img src={logo} alt="Logo" style={{ height: 50, marginRight: 12 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            Artstr
          </Typography>
        </Box>

        {/* Center Section */}
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1, mx: 3, justifyContent: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search products..."
            size="small"
            sx={{
              width: 300, // Adjust width to make the search box larger
              marginLeft: 20,
              backgroundColor: 'white',
              borderRadius: 25,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              '& .MuiOutlinedInput-root': {
                borderRadius: 25,
                fontSize: '1rem', // Increase font size inside the input box
              },
            }}
          />
          <IconButton color="inherit" aria-label="search" sx={{ marginLeft: 1, marginRight: 20 }}>
            <FaSearch />
          </IconButton>
        </Box>

        {/* Right Section */}
        <Box display="flex" alignItems="center">
          <Button
            color="inherit"
            startIcon={<StarIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              marginRight: 4,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 10,
              },
            }}
          >
            Reviews
          </Button>
          <Button
            color="inherit"
            startIcon={<ShoppingCartIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              marginRight: 4,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 10,
              },
            }}
          >
            Cart
          </Button>
          <Button
            color="inherit"
            startIcon={<AccountCircleIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              marginRight: 4,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 10,
              },
            }}
          >
            Profile
          </Button>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 10,
              },
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
