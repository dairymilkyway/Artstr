import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { auth } from './firebaseConfig';
import '../styles/logreg.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const token = await userCredential.user.getIdToken();

      // Send the token to your backend
      const response = await axios.post('http://localhost:5000/api/auth/login', { token });

      // Store the backend token in localStorage
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="pulse-circle"></div>
      <div className="pulse-circle"></div>
      <div className="login-box">
        <h2>Login</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="input-field"
          />
          <button type="submit" className="submit-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;