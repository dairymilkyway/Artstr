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

const Register = () => {
  const navigate = useNavigate();

  // Validation schema using Yup
  const schema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    username: yup.string().min(4, 'Username must be at least 4 characters').required('Username is required'),
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

  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const token = await userCredential.user.getIdToken();

      // Send the token and user data to your backend
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        token,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        password: data.password,
      });

      // Show success notification
      toast.success('Registration successful! Redirecting to login...', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      // Show error notification
      toast.error(error.response?.data?.message || 'Something went wrong!', {
        position: 'top-right',
        autoClose: 5000,
      });
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
              name="firstName"
              placeholder="First Name"
              {...register('firstName')}
              className="input-field"
            />
            {errors.firstName && <span className="floating-error">{errors.firstName.message}</span>}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              {...register('lastName')}
              className="input-field"
            />
            {errors.lastName && <span className="floating-error">{errors.lastName.message}</span>}
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
              name="username"
              placeholder="Username"
              {...register('username')}
              className="input-field"
            />
            {errors.username && <span className="floating-error">{errors.username.message}</span>}
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
          <button type="submit" className="submit-btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
