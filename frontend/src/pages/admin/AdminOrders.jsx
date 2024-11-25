import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import { ThemeProvider, createTheme, Button, Box, Modal, Typography } from '@mui/material';
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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data?.message || error.message);
      toast.error('Error fetching orders', { position: 'top-right' });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSelectedOrder(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error.response?.data?.message || error.message);
      toast.error('Error fetching order details', { position: 'top-right' });
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success('Order status updated successfully', { position: 'top-right' });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error.response?.data?.message || error.message);
      toast.error('Error updating order status', { position: 'top-right' });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format date as yyyy-mm-dd
  };

  const columns = [
    { name: 'name', label: 'Customer Name' },
    { name: 'totalPrice', label: 'Total Price' },
    { name: 'courier', label: 'Courier' },
    {
      name: 'status',
      label: 'Status',
      options: {
        customBodyRender: (value) => {
          let color;
          if (value === 'delivered') {
            color = '#1DB954'; // Green
          } else if (value === 'canceled') {
            color = '#f44336'; // Red
          } else {
            color = '#fff'; // Default color
          }
          return <Box sx={{ color, fontWeight: 'medium' }}>{value}</Box>;
        },
      },
    },
    {
      name: 'actions',
      label: 'Actions',
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const order = orders[rowIndex];
          return (
            <>
              {order.status !== 'delivered' && order.status !== 'canceled' ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOrderStatusChange(order._id, 'delivered')}
                    sx={{ mr: 1 }}
                  >
                    Delivered
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOrderStatusChange(order._id, 'canceled')}
                    sx={{
                      backgroundColor: '#f44336',
                      '&:hover': { backgroundColor: '#d32f2f' },
                    }}
                  >
                    Canceled
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => fetchOrderDetails(order._id)}
                >
                  View Details
                </Button>
              )}
            </>
          );
        },
      },
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="admin-dashboard">
          <h1 className="title">Manage Orders</h1>
          <MUIDataTable
            title={"Orders List"}
            data={orders}
            columns={columns}
            options={{ selectableRows: 'none' }}
          />
        </div>
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <Modal open={isModalOpen} onClose={closeModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: '#181818',
              color: '#fff',
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Order Details
            </Typography>
            <Typography>
              <strong>Order ID:</strong> {selectedOrder._id}
            </Typography>
            <Typography>
              <strong>User:</strong> {selectedOrder.user.name} ({selectedOrder.user.email})
            </Typography>
            <Typography>
              <strong>Total Price:</strong> ${selectedOrder.totalPrice.toFixed(2)}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              <strong>Status:</strong> {selectedOrder.status}
            </Typography>
            <Typography variant="h6">Items:</Typography>
            <Box sx={{ mb: 3 }}>
              {selectedOrder.items.map((item) => (
                <Box key={item._id} sx={{ mb: 2 }}>
                  <Typography>
                    {item.product.name} - ${item.product.price.toFixed(2)}
                  </Typography>
                  {item.product.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={item.product.name}
                      style={{ width: 100, marginRight: 10 }}
                    />
                  ))}
                </Box>
              ))}
            </Box>
            <Button variant="contained" onClick={closeModal}>
              Close
            </Button>
          </Box>
        </Modal>
      )}
    </ThemeProvider>
  );
};

export default AdminOrders;
