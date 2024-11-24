import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { ThemeProvider, createTheme, TextField } from '@mui/material';
import Sidebar from './Sidebar';
import '../../styles/AdminDashboard.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1DB954' },
    secondary: { main: '#191414' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
});

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sales', {
        params: {
          startDate,
          endDate,
        },
      });
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData();
    }
  }, [startDate, endDate]);

  const data = {
    labels: salesData.map((data) => format(new Date(data._id), 'MMM yyyy')),
    datasets: [
      {
        label: 'Sales',
        data: salesData.map((data) => data.totalSales),
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.2)',
        pointBackgroundColor: '#1DB954',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1DB954',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#1DB954',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="admin-dashboard">
          <h1 className="title">Sales Chart</h1>
          <div className="date-picker-container">
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ marginRight: 2 }}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 20 }}>
            <Line data={data} options={options} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SalesChart;