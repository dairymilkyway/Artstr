import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios from 'axios';
import Navbar from '../components/Navbar';

const getToken = () => localStorage.getItem('token');

// Validation schema
const profileValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const UserProfile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('/default-profile.png');
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
  
      const response = await axios.put('http://localhost:5000/api/users/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.success('Profile updated successfully!', {
        onClose: () => {
          window.location.reload(); // Refresh the page after the toast is closed
        },
      });
  
      setProfilePicturePreview(response.data.user.profilePicture);
    } catch (error) {
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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Sticky Navbar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <Navbar />
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 4,
          px: 2,
          backgroundColor: 'transparent',
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
            mx: 'auto',
            p: 3,
            background: '#181413',
            borderRadius: 2,
            boxShadow: 3,
            color: 'white',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
            Profile Settings
          </Typography>

          <form onSubmit={handleSubmit(handleProfileUpdate)}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Avatar
                src={profilePicturePreview}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{
                  textTransform: 'none',
                  color: 'white',
                  borderColor: '#1db954',
                  '&:hover': {
                    borderColor: '#1db954',
                    backgroundColor: 'rgba(29, 185, 84, 0.1)',
                  },
                }}
              >
                Upload Profile Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label="Email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...field}
                  margin="normal"
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiFormLabel-root': { color: 'white' },
                    '& .MuiFormHelperText-root': { color: '#d4d4d4' },
                  }}
                />
              )}
            />

            <Controller
              name="mobileNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label="Mobile Number"
                  error={!!errors.mobileNumber}
                  helperText={errors.mobileNumber?.message}
                  {...field}
                  margin="normal"
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiFormLabel-root': { color: 'white' },
                    '& .MuiFormHelperText-root': { color: '#d4d4d4' },
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...field}
                  margin="normal"
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiFormLabel-root': { color: 'white' },
                    '& .MuiFormHelperText-root': { color: '#d4d4d4' },
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isProfileUpdating}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                textTransform: 'none',
                backgroundColor: '#1db954',
                color: 'white',
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: '#1ed760',
                },
              }}
            >
              {isProfileUpdating ? <CircularProgress size={24} color="inherit" /> : 'Update Details'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
