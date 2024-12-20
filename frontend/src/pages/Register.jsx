import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { auth } from './firebaseConfig';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/logreg.css';
import { Link } from 'react-router-dom';
import { getMessaging, getToken } from "firebase/messaging";
import { messaging } from './firebaseConfig'; // Import the messaging instance


const Register = () => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);

  // Validation schema using Yup
  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    mobileNumber: yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits').required('Mobile number is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  // React Hook Form with Yup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getFcmToken = async () => {
    try {
      const currentToken = await getToken(messaging, { vapidKey: 'BL9I7rufDPvwTz0E7HqbjOSxMI7zGnFQlA3xm8q4-J5YFtmH92Z6n5HE2nIhK3y8CbMD8szsQs7aD0SngQZV6qM' });
      if (currentToken) {
        return currentToken;
      } else {
        console.error('No registration token available. Request permission to generate one.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      const fcmToken = await getFcmToken();
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const token = await userCredential.user.getIdToken();
  
      const formData = new FormData();
      formData.append('token', token);
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('mobileNumber', data.mobileNumber);
      formData.append('password', data.password);
      formData.append('fcmToken', fcmToken); // Append FCM token
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
  
      const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.success('Registration successful! Redirecting to login...', {
        position: 'top-right',
        autoClose: 3000,
      });
  
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong!', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer /> {/* Toastify container for notifications */}
      <div className="pulse-circle"></div>
      <div className="pulse-circle"></div>
      <div className="pulse-circle"></div>

      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              {...register('name')}
              className="input-field"
            />
            {errors.name && <span className="floating-error">{errors.name.message}</span>}
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              {...register('email')}
              className="input-field"
            />
            {errors.email && <span className="floating-error">{errors.email.message}</span>}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number"
              {...register('mobileNumber')}
              className="input-field"
            />
            {errors.mobileNumber && <span className="floating-error">{errors.mobileNumber.message}</span>}
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              {...register('password')}
              className="input-field"
            />
            {errors.password && <span className="floating-error">{errors.password.message}</span>}
          </div>
          <div className="input-group">
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              className="input-field"
              accept="image/*"
            />
          </div>
          <button type="submit" className="submit-btn">Register</button>
        </form>
        <div className="nav-links">
          <Link to="/">Back to Home</Link>
          <span>|</span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;