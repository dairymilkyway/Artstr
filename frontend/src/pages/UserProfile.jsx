import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  CircularProgress,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/users'; // Match backend route
const getToken = () => localStorage.getItem('token');

const UserProfile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const user = response.data.user;
        setUserData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        });
        setProfilePicturePreview(user.profilePicture);
      } catch (error) {
        toast.error('Failed to fetch user data');
        console.error('Error:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/update-profile`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile updated successfully');
      setProfilePicturePreview(response.data.user.profilePicture);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <ToastContainer position="top-right" />
      <Typography variant="h5" gutterBottom>
        Update Profile
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Avatar
            src={profilePicturePreview || '/default-profile.png'}
            sx={{ width: 80, height: 80 }}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" component="label">
            Upload Picture
            <input 
              type="file" 
              hidden 
              onChange={handleFileChange} 
              accept="image/*"
            />
          </Button>
        </Grid>
      </Grid>

      <form onSubmit={handleSubmit}>
        {Object.entries(userData).map(([key, value]) => (
          <TextField
            key={key}
            fullWidth
            margin="normal"
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            name={key}
            type={key === 'email' ? 'email' : 'text'}
            value={value}
            onChange={handleInputChange}
            required
          />
        ))}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Update Profile'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default UserProfile;