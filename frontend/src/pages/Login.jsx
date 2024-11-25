import React from 'react';
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
import { Link } from 'react-router-dom';
import { getMessaging, getToken } from "firebase/messaging";

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

  const getFcmToken = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, { vapidKey: 'BL9I7rufDPvwTz0E7HqbjOSxMI7zGnFQlA3xm8q4-J5YFtmH92Z6n5HE2nIhK3y8CbMD8szsQs7aD0SngQZV6qM', serviceWorkerRegistration: registration });
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
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const token = await userCredential.user.getIdToken();

      const response = await axios.post('http://localhost:5000/api/auth/login', { token, fcmToken });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);

      toast.success('Login successful! Redirecting...', {
        position: 'top-right',
        autoClose: 3000,
      });

      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
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
      const fcmToken = await getFcmToken();

      const response = await axios.post('http://localhost:5000/api/auth/login', { token, fcmToken });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      
      toast.success('Login successful! Redirecting...', {
        position: 'top-right',
        autoClose: 3000,
      });

      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error('Google login error:', error);
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
        <div className="nav-links">
          <Link to="/">Back to Home</Link>
          <span>|</span>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;