import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import { ThemeProvider, createTheme, Select, MenuItem } from '@mui/material';
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

  const handleOrderStatusChange = (orderId, event) => {
    const newStatus = event.target.value;
    updateOrderStatus(orderId, newStatus);
  };

  const columns = [
    { name: 'name', label: 'Customer Name' },
    { name: 'totalPrice', label: 'Total Price' },
    { name: 'courier', label: 'Courier' },
    { name: 'status', label: 'Status', options: {
      customBodyRender: (value, tableMeta) => {
        const rowIndex = tableMeta.rowIndex;
        const order = orders[rowIndex];
        return (
          <Select
            value={order.status}
            onChange={(event) => handleOrderStatusChange(order._id, event)}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        );
      },
    }},
    { name: 'date', label: 'Order Date' },
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