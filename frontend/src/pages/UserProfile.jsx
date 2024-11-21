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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios from 'axios';

const getToken = () => localStorage.getItem('token');

// Validation schema
const profileValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').min(2, 'Too short'),
  lastName: Yup.string().required('Last name is required').min(2, 'Too short'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  username: Yup.string().required('Username is required').min(3, 'Too short'),
});

const UserProfile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('/default-profile.png');
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Profile update form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
    },
  });

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const user = response.data.user;

      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
      setValue('username', user.username || '');
      setProfilePicturePreview(
        user.profilePicture === 'default-profile.png'
          ? '/default-profile.png'
          : user.profilePicture
      );
    } catch (error) {
      toast.error('Error fetching user data');
    } finally {
      setIsFetching(false);
    }
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

  const handleProfileUpdate = async (data) => {
    setIsProfileUpdating(true);

    try {
      // Prepare data for the backend
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      // Send update request to the backend
      const response = await axios.put('http://localhost:5000/api/users/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile updated successfully');
      setProfilePicturePreview(response.data.user.profilePicture);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsProfileUpdating(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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

      {/* Profile Update Form */}
      <form onSubmit={handleSubmit(handleProfileUpdate)}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Avatar
              src={profilePicturePreview}
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
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="First Name"
              fullWidth
              margin="normal"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Last Name"
              fullWidth
              margin="normal"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Username"
              fullWidth
              margin="normal"
              error={!!errors.username}
              helperText={errors.username?.message}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isProfileUpdating}
          sx={{ mt: 3 }}
        >
          {isProfileUpdating ? <CircularProgress size={24} /> : 'Update Details'}
        </Button>
      </form>
    </Box>
  );
};

export default UserProfile;
