import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar'; // Import the Navbar component
import './Dashboard.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get the token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: {
            Authorization: getToken(),
          },
        });
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <Navbar /> {/* Add the Navbar component */}
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to the Dashboard</h1>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div>Loading products...</div>
        ) : (
          <div className="product-list">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;