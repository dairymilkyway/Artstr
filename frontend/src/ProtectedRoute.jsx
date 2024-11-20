import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
  if (payload.userType !== userType) {
    return <Navigate to={payload.userType === 'admin' ? '/admin-dashboard' : '/dashboard'} />;
  }

  return children;
};

export default ProtectedRoute;