import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Home, AccountCircle, RateReview, BarChart, ExitToApp } from '@mui/icons-material'; // Import new icons
import '../../styles/adminsidebar.css';

const Sidebar = () => {
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
        <ListItem button>
          <ListItemIcon>
            <Home style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <AccountCircle style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Account" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <RateReview style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Reviews" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <BarChart style={{ color: '#1DB954' }} />
          </ListItemIcon>
          <ListItemText primary="Charts" />
        </ListItem>
        <ListItem button>
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
