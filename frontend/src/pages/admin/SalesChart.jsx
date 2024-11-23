import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, TextField, Button } from '@mui/material';
import axios from 'axios';
import 'chart.js/auto';

const SalesChart = () => {
  const [data, setData] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/sales', {
        params: { startDate, endDate },
      });
      const salesData = response.data;

      const chartData = {
        labels: salesData.map((sale) => sale.month),
        datasets: [
          {
            label: 'Sales',
            data: salesData.map((sale) => sale.totalSales),
            borderColor: '#1DB954',
            backgroundColor: 'rgba(29, 185, 84, 0.2)',
          },
        ],
      };

      setData(chartData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" color="primary" onClick={fetchSalesData}>
          Filter
        </Button>
      </Box>
      <Line data={data} />
    </Box>
  );
};

export default SalesChart;