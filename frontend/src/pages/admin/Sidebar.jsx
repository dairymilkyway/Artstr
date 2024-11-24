import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Home,ShoppingCart, AccountCircle, RateReview, BarChart, ExitToApp } from '@mui/icons-material'; // Import new icons
import '../../styles/adminsidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          backgroundColor: '#191414', // Spotify dark background
          color: 'white',
          border: 'none',
          paddingTop: '20px',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <div className="sidebar-header">
        <img
          src="https://res.cloudinary.com/dnzxfbjfq/image/upload/v1732357343/lkvcodsmpzf2u1eincsv.png"
          alt="Spotify"
          className="sidebar-logo"
        />
      </div>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/admin-dashboard')}>
          <ListItemIcon>
            <Home style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button onClick={() => navigate('/admin-orders')}>
          <ListItemIcon>
            <ShoppingCart style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Manage Orders" />
        </ListItem>
        <ListItem button onClick={() => navigate('/admin-reviews')}>
          <ListItemIcon>
            <RateReview style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Reviews" />
        </ListItem>
        <ListItem button onClick={() => navigate('/admin-chart')}>
          <ListItemIcon>
            <BarChart style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Sales Chart" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
