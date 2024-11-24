import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import { ThemeProvider, createTheme, Button, Box } from '@mui/material';
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

  const updateOrderStatus = async (orderId, status) => {
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

  const handleOrderStatusChange = (orderId, status) => {
    updateOrderStatus(orderId, status);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format date as yyyy-mm-dd
  };

  const columns = [
    { name: 'name', label: 'Customer Name' },
    { name: 'totalPrice', label: 'Total Price' },
    { name: 'courier', label: 'Courier' },
    { name: 'status', label: 'Status', options: {
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
    }},
    { name: 'date', label: 'Order Date', options: {
      customBodyRender: (value) => formatDate(value),
    }},
    { name: 'deliveredAt', label: 'Delivery Date', options: {
      customBodyRender: (value, tableMeta) => {
        const rowIndex = tableMeta.rowIndex;
        const order = orders[rowIndex];
        return order.status === 'delivered' ? formatDate(order.deliveredAt) : 'N/A';
      },
    }},
    { name: 'actions', label: 'Actions', options: {
      customBodyRender: (value, tableMeta) => {
        const rowIndex = tableMeta.rowIndex;
        const order = orders[rowIndex];
        return (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOrderStatusChange(order._id, 'delivered')}
              sx={{ mr: 1 }}
              disabled={order.status === 'delivered' || order.status === 'canceled'}
            >
              Delivered
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleOrderStatusChange(order._id, 'canceled')}
              sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
              disabled={order.status === 'delivered' || order.status === 'canceled'}
            >
              Canceled
            </Button>
          </>
        );
      },
    }},
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
    </ThemeProvider>
  );
};

export default AdminOrders;