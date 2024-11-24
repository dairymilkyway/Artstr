import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Button,
  styled,
} from '@mui/material';
import axios from 'axios';
import Navbar from '../components/Navbar';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#b3b3b3',
  borderBottom: '1px solid #282828',
  '&.MuiTableCell-head': {
    backgroundColor: '#282828',
    color: '#fff',
    fontWeight: 'bold',
  },
}));

const StyledTableRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: '#282828',
    cursor: 'pointer',
  },
  '& td': {
    borderBottom: '1px solid #282828',
  },
});

const StyledPagination = styled(Pagination)({
  '& .MuiPaginationItem-root': {
    color: '#b3b3b3',
  },
});

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/user-orders?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const { orders, totalPages } = response.data || {};
      setOrders(orders || []);
      setTotalPages(totalPages || 1);
    } catch (error) {
      console.error('Error fetching paginated orders:', error.response?.data || error.message);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchOrders(page); // Refresh orders after status update
    } catch (error) {
      console.error('Error updating order status:', error.response?.data?.message || error.message);
    }
  };

  const handleDelivered = (orderId) => {
    updateOrderStatus(orderId, 'delivered');
  };

  const handleCanceled = (orderId) => {
    updateOrderStatus(orderId, 'canceled');
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format date as yyyy-mm-dd
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#121212',
      color: '#fff'
    }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <Navbar />
      </Box>
      <Box sx={{ flex: 1, padding: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: '#fff',
            fontWeight: 'bold',
            marginBottom: 3
          }}
        >
          Orders
        </Typography>
        <TableContainer 
          component={Paper} 
          sx={{ 
            bgcolor: '#181818',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Order ID</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Total Price</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Order Date</StyledTableCell>
                <StyledTableCell>Delivery Date</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <StyledTableRow key={order._id}>
                    <StyledTableCell>{order._id}</StyledTableCell>
                    <StyledTableCell>{order.name}</StyledTableCell>
                    <StyledTableCell>${order.totalPrice.toFixed(2)}</StyledTableCell>
                    <StyledTableCell>
                      <Box 
                        sx={{ 
                          color: order.status === 'delivered' ? '#1DB954' : order.status === 'canceled' ? '#f44336' : '#fff',
                          fontWeight: 'medium'
                        }}
                      >
                        {order.status}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>{formatDate(order.date)}</StyledTableCell>
                    <StyledTableCell>{order.status === 'delivered' ? formatDate(order.deliveredAt) : 'N/A'}</StyledTableCell>
                    <StyledTableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleDelivered(order._id)}
                        sx={{ mr: 1 }}
                        disabled={order.status === 'delivered'}
                      >
                        Delivered
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleCanceled(order._id)}
                        sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
                        disabled={order.status === 'delivered'}
                      >
                        Canceled
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell colSpan={7} align="center">
                    No orders found.
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
          <StyledPagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OrdersPage;