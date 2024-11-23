import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Home, AccountCircle, RateReview, BarChart, ExitToApp } from '@mui/icons-material'; // Import new icons
import '../../styles/adminsidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
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
          src="https://upload.wikimedia.org/wikipedia/commons/6/66/Spotify_Logo.png"
          alt="Spotify"
          className="sidebar-logo"
        />
      </div>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/products')}>
          <ListItemIcon>
            <Home style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button onClick={() => navigate('/account')}>
          <ListItemIcon>
            <AccountCircle style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Account" />
        </ListItem>
        <ListItem button onClick={() => navigate('/reviews')}>
          <ListItemIcon>
            <RateReview style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Reviews" />
        </ListItem>
        <ListItem button onClick={() => navigate('/sales-chart')}>
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
