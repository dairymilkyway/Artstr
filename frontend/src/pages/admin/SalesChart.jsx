import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import axios from 'axios';
import 'chart.js/auto';
import Sidebar from './Sidebar'; // Importing Sidebar

const SalesChart = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesData = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/sales', {
        params: {
          startDate,
          endDate,
        },
      });
      const salesData = response.data;

      if (salesData.labels && salesData.sales) {
        const chartData = {
          labels: salesData.labels,
          datasets: [
            {
              label: 'Sales',
              data: salesData.sales,
              borderColor: '#fff', // White line for the chart
              backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light gray for points
              pointBackgroundColor: '#fff',
              pointBorderColor: '#fff',
              tension: 0.4,
            },
          ],
        };
        setData(chartData);
      } else {
        throw new Error('Invalid data structure from API');
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to fetch sales data. Please try again later.');
      setData({
        labels: [],
        datasets: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#000', // Ensure full background is black
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 800,
            backgroundColor: '#000', // Ensure card matches center content background
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            padding: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              marginBottom: 4,
              textAlign: 'center',
              color: '#fff', // White text for titles
            }}
          >
            Sales Insights
          </Typography>

          <CardContent>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    backgroundColor: '#000',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      color: '#fff',
                      '& fieldset': {
                        borderColor: '#fff',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ccc',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#fff',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    backgroundColor: '#000',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      color: '#fff',
                      '& fieldset': {
                        borderColor: '#fff',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ccc',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#fff',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: '#fff',
                    color: '#000',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#ccc',
                    },
                  }}
                  onClick={fetchSalesData}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Apply Filter'}
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 3, backgroundColor: '#404040' }} />

            {error && (
              <Typography
                variant="body1"
                sx={{ color: 'red', marginBottom: 2, textAlign: 'center' }}
              >
                {error}
              </Typography>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 5 }}>
                <CircularProgress sx={{ color: '#fff' }} />
              </Box>
            ) : data.labels.length > 0 ? (
              <Line
                data={data}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: true,
                      labels: {
                        color: '#fff', // White labels for legend
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: '#fff' }, // White ticks
                      grid: { color: '#333' }, // Dark gray gridlines
                    },
                    y: {
                      ticks: { color: '#fff' }, // White ticks
                      grid: { color: '#333' }, // Dark gray gridlines
                    },
                  },
                }}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{ textAlign: 'center', color: '#fff', marginTop: 3 }}
              >
                No data available for the selected date range.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SalesChart;
