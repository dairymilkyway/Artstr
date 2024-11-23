import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { auth, googleProvider } from './firebaseConfig';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/logreg.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
const Login = () => {
  const navigate = useNavigate();

  // Validation schema using Yup
  const schema = yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),
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
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const token = await userCredential.user.getIdToken();

      // Send the token to your backend
      const response = await axios.post('http://localhost:5000/api/auth/login', { token });

      // Store the backend token in localStorage
      localStorage.setItem('token', response.data.token);

      // Show success notification
      toast.success('Login successful! Redirecting...', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      // Show error notification
      toast.error(error.response?.data?.message || 'Invalid email or password', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      // Send the token to your backend
      const response = await axios.post('http://localhost:5000/api/auth/login', { token });

      // Store the backend token in localStorage
      localStorage.setItem('token', response.data.token);

      // Show success notification
      toast.success('Login successful! Redirecting...', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      // Show error notification
      toast.error(error.response?.data?.message || 'Google login failed', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="login-container">
      <ToastContainer /> {/* Toastify container for notifications */}
      <div className="pulse-circle"></div>
      <div className="pulse-circle"></div>
      <div className="pulse-circle"></div>

      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              type="password"
              name="password"
              placeholder="Password"
              {...register('password')}
              className="input-field"
            />
            {errors.password && <span className="floating-error">{errors.password.message}</span>}
          </div>
          <button type="submit" className="submit-btn">Login</button>
        </form>
        <button onClick={handleGoogleLogin} className="google-login-btn">
  <FontAwesomeIcon icon={faGoogle} className="google-icon" />
  Login with Google
</button>

      </div>
    </div>
  );
};

export default Login;