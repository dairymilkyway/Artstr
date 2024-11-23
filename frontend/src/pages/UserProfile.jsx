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
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobileNumber: Yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits').required('Mobile number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
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
      email: '',
      mobileNumber: '',
      password: '',
    },
  });

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const user = response.data.user;

      setValue('email', user.email || '');
      setValue('mobileNumber', user.mobileNumber || '');
      setProfilePicturePreview(user.profilePicture || '/default-profile.png');
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
          name="mobileNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mobile Number"
              fullWidth
              margin="normal"
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
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