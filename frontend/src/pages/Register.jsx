import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { auth } from './firebaseConfig';
import '../styles/logreg.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const token = await userCredential.user.getIdToken();

      // Send the token and user data to your backend
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password, // Include password
      });

      // Store the JWT token in localStorage
      localStorage.setItem('token', response.data.token);

      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.message || 'Something went wrong!');
    }
  };

  return (
    <div className="register-container">
      <div className="pulse-circle"></div>
      <div className="pulse-circle"></div>
      <div className="pulse-circle"></div>

      <div className="register-box">
        <h2>Register</h2>
        {message && <p className="message">{message}</p>} {/* Display registration messages */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
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
          <button type="submit" className="submit-btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;