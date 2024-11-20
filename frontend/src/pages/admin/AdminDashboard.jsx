import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme, Button, TextField, Modal } from '@mui/material';
import Sidebar from './Sidebar'; // Adjust the relative path based on your project structure
import '../../styles/AdminDashboard.css';

// Custom theme to mimic Spotify design
const theme = createTheme({
  palette: {
    mode: 'dark', // Dark mode for a Spotify look
    primary: {
      main: '#1DB954', // Spotify green
    },
    secondary: {
      main: '#191414', // Spotify dark background
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: getToken() },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteSelected = async () => {
    const idsToDelete = selectedRows.map((rowIndex) => products[rowIndex]._id);
    try {
      await axios.post(
        'http://localhost:5000/api/products/delete',
        { ids: idsToDelete },
        { headers: { Authorization: getToken() } }
      );
      alert('Selected products deleted successfully');
      fetchProducts();
      setSelectedRows([]);
      window.location.reload(true);
    } catch (error) {
      console.error('Error deleting products:', error.response?.data?.message || error.message);
    }
  };

  const handleOpenModal = (rowIndex) => {
    setSelectedProduct(products[rowIndex]);
    setShowModal(true);
  };

  const updateProduct = async (id, formData) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
        headers: { Authorization: getToken() },
      });
      alert('Product updated successfully');
      fetchProducts();
      setShowModal(false);
      window.location.reload(true);
    } catch (error) {
      console.error('Error updating product:', error.response?.data?.message || error.message);
    }
  };

  const addProduct = async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: { Authorization: getToken() },
      });
      alert('Product added successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error.response?.data?.message || error.message);
    }
  };

  const columns = [
    { name: 'name', label: 'Name' },
    { name: 'price', label: 'Price' },
    { name: 'category', label: 'Category' },
    {
      name: 'photos',
      label: 'Photos',
      options: {
        customBodyRender: (photos) => (
          <div>
            {photos.map((url, index) => (
              <img
                key={index}
                src={`http://localhost:5000${url}`}
                alt="Product"
                style={{ width: '50px', height: '50px', marginRight: '5px' }}
              />
            ))}
          </div>
        ),
      },
    },
    { name: 'details', label: 'Details' },  // Add this column to show details in the table
    {
      name: 'Action',
      label: 'Action',
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const product = products[rowIndex];
  
          return (
            <div>
              <IconButton onClick={() => handleOpenModal(rowIndex)}>
                <EditIcon style={{ color: '#2196F3' }} />
              </IconButton>
            </div>
          );
        },
      },
    },
  ];
  

  const options = {
    selectableRows: 'multiple',
    onRowsSelect: (currentRowsSelected, allRowsSelected) => {
      const selectedRowIndexes = allRowsSelected.map((row) => row.index);
      setSelectedRows(selectedRowIndexes);
    },
    customToolbarSelect: () => (
      <IconButton onClick={handleDeleteSelected}>
        <DeleteIcon style={{ color: '#f44336' }} />
      </IconButton>
    ),
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      const rowIndex = rowMeta.dataIndex;
      const product = products[rowIndex];

      return (
        <tr>
          <td colSpan={columns.length + 1}>
            <div className="expandable-row">
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Details:</strong> {product.details}</p>
              <div>
                <strong>Photos:</strong>
                <div>
                  {product.photos.map((url, index) => (
                    <img key={index} src={`http://localhost:5000${url}`} alt="Product" className="expandable-photo" />
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      );
    },
  };

  return (
    <ThemeProvider theme={theme}>
           <div style={{ display: 'flex' }}>
           <Sidebar /> {/* Include Sidebar */}
      <div className="admin-dashboard">
        <h1 className="title">Admin Dashboard</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addProduct(formData);
            e.target.reset();
          }}
          className="add-product-form"
        >
          <TextField label="Product Name" name="name" variant="outlined" fullWidth required />
          <TextField label="Price" name="price" type="number" variant="outlined" fullWidth required />
          <TextField label="Category" name="category" variant="outlined" fullWidth required />
          <TextField label="Details" name="details" variant="outlined" fullWidth multiline required />
          <input type="file" name="photos" multiple className="file-input" />
          <Button type="submit" variant="contained" color="primary" className="submit-button">Add Product</Button>
        </form>
        <MUIDataTable title="Products" data={products} columns={columns} options={options} />

        {/* Update Modal */}
        {showModal && selectedProduct && (
          <Modal open={showModal} onClose={() => setShowModal(false)}>
            <div className="modal-content">
              <h3>Update Product</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  updateProduct(selectedProduct._id, formData);
                }}
              >
                <TextField label="Product Name" name="name" defaultValue={selectedProduct.name} variant="outlined" fullWidth required />
                <TextField label="Price" name="price" defaultValue={selectedProduct.price} type="number" variant="outlined" fullWidth required />
                <TextField label="Category" name="category" defaultValue={selectedProduct.category} variant="outlined" fullWidth required />
                <TextField label="Details" name="details" defaultValue={selectedProduct.details} variant="outlined" fullWidth multiline required />
                <input type="file" name="photos" multiple className="file-input" />
                <div className="modal-buttons">
                  <Button type="submit" variant="contained" color="primary">Save Changes</Button>
                  <Button variant="contained" color="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
