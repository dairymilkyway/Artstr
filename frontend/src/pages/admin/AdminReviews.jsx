import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme, Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import '../../styles/AdminDashboard.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1DB954' },
    secondary: { main: '#191414' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
});

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);

  const getToken = () => localStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/reviews', {
        headers: { Authorization: getToken() },
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error.response?.data?.message || error.message);
      toast.error('Error fetching reviews', { position: 'top-right' });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (productId, reviewId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}/review/${reviewId}`, {
        headers: { Authorization: getToken() },
      });
      toast.success('Review deleted successfully', { position: 'top-right' });
      fetchReviews(); // Refresh the reviews list to reflect the deleted review
    } catch (error) {
      console.error('Error deleting review:', error.response?.data?.message || error.message);
      toast.error('Error deleting review', { position: 'top-right' });
    }
  };

  const handleDeleteReview = (productId, reviewId) => {
   
      deleteReview(productId, reviewId);
  
  };

  const columns = [
    { name: 'productName', label: 'Product' },
    { name: 'userName', label: 'User' },
    { name: 'comment', label: 'Comment' },
    { name: 'rating', label: 'Rating' },
    {
      name: 'Actions',
      options: {
        customBodyRender: (value, tableMeta) => {
          const review = reviews[tableMeta.rowIndex];
          return (
            <IconButton onClick={() => handleDeleteReview(review.productId, review._id)}>
              <DeleteIcon style={{ color: '#f44336' }} />
            </IconButton>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: 'none',
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="admin-dashboard">
        <Sidebar />
        <div className="content">
          <h1>Manage Reviews</h1>
          <MUIDataTable
            title="Reviews"
            data={reviews}
            columns={columns}
            options={options}
          />
          <ToastContainer />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminReviews;