import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme, Button, TextField, Modal } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: getToken() },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error.response?.data?.message || error.message);
      toast.error('Error fetching products', { position: 'top-right' });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      toast.warn('No rows selected for deletion', { position: 'top-right' });
      return;
    }
  
    const idsToDelete = selectedRows.map((rowIndex) => products[rowIndex]._id);
  
    try {
      await axios.post(
        'http://localhost:5000/api/products/delete',
        { ids: idsToDelete },
        { headers: { Authorization: getToken() } }
      );
  
      toast.success('Selected products deleted successfully', { position: 'top-right' });
  
      // Refresh the products list
      await fetchProducts();
  
      // Clear selected rows
      setSelectedRows([]);
  
      // Reload the page (optional)
      window.location.reload(); // Use only if a full reload is absolutely necessary
    } catch (error) {
      console.error('Error deleting products:', error.response?.data?.message || error.message);
      toast.error('Error deleting products', { position: 'top-right' });
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
      toast.success('Product updated successfully', { position: 'top-right' });
  
      // Fetch the updated products list
      await fetchProducts();
  
      // Update the selected product details in the modal
      const updatedProduct = products.find((product) => product._id === id);
      setSelectedProduct(updatedProduct);
  
      setShowModal(false);
    } catch (error) {
      console.error('Error updating product:', error.response?.data?.message || error.message);
      toast.error('Error updating product', { position: 'top-right' });
    }
  };
  

  const addProduct = async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: { Authorization: getToken() },
      });
      toast.success('Product added successfully', { position: 'top-right' });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error.response?.data?.message || error.message);
      toast.error('Error adding product', { position: 'top-right' });
    }
  };

  const schema = yup.object().shape({
    name: yup.string().trim().required('Product Name is required'),
    price: yup
      .number()
      .positive('Price must be a positive number')
      .required('Price is required')
      .typeError('Price must be a number'),
    category: yup.string().trim().required('Category is required'),
    details: yup.string().trim().required('Details are required'),
    photos: yup
      .mixed()
      .test('fileType', 'Only image files are allowed', (value) => {
        if (!value || value.length === 0) return true;
        return Array.from(value).every((file) => file.type.startsWith('image/'));
      })
      .test('fileSize', 'Each file must be smaller than 5MB', (value) => {
        if (!value || value.length === 0) return true;
        return Array.from(value).every((file) => file.size <= 5 * 1024 * 1024);
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    register: modalRegister,
    handleSubmit: modalHandleSubmit,
    formState: { errors: modalErrors },
    reset: resetModalForm,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleModalSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'photos') {
        Array.from(data[key]).forEach((file) => formData.append(key, file));
      } else {
        formData.append(key, data[key]);
      }
    });
  
    // Call the updateProduct function with the real-time update handling
    updateProduct(selectedProduct._id, formData);
  };
  

  const columns = [
    { name: 'name', label: 'Name' },
    { name: 'price', label: 'Price' },
    { name: 'category', label: 'Category' },
    { name: 'details', label: 'Details' },
    {
      name: 'photos',
      label: 'Photos',
      options: {
        customBodyRender: (photos) => (
          <div>
            {photos.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="Product"
                style={{ width: '50px', height: '50px', marginRight: '5px' }}
              />
            ))}
          </div>
        ),
      },
    },
    {
      name: 'Action',
      label: 'Action',
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          return (
            <IconButton onClick={() => handleOpenModal(rowIndex)}>
              <EditIcon style={{ color: '#2196F3' }} />
            </IconButton>
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
    renderExpandableRow: (_, rowMeta) => {
      const product = products[rowMeta.dataIndex];

      return (
        <tr>
          <td colSpan={6}>
            <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
              <h4>Product Details</h4>
              <p>
                <strong>Name:</strong> {product.name}
              </p>
              <p>
                <strong>Price:</strong> {product.price}
              </p>
              <p>
                <strong>Category:</strong> {product.category}
              </p>
              <p>
                <strong>Details:</strong> {product.details}
              </p>
              <div>
                <strong>Photos:</strong>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {product.photos.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="Product"
                      style={{ width: '100px', height: '100px', marginRight: '5px' }}
                    />
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
      <ToastContainer />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="admin-dashboard">
          <h1 className="title">Admin Dashboard</h1>
          <form
            onSubmit={handleSubmit((data) => {
              const formData = new FormData();
              Object.keys(data).forEach((key) => {
                if (key === 'photos') {
                  Array.from(data[key]).forEach((file) => formData.append(key, file));
                } else {
                  formData.append(key, data[key]);
                }
              });
              addProduct(formData);
              reset();
            })}
            className="add-product-form"
          >
            <TextField
              label="Product Name"
              variant="outlined"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Price"
              type="number"
              variant="outlined"
              fullWidth
              {...register('price')}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
            <TextField
              label="Category"
              variant="outlined"
              fullWidth
              {...register('category')}
              error={!!errors.category}
              helperText={errors.category?.message}
            />
            <TextField
              label="Details"
              variant="outlined"
              fullWidth
              multiline
              {...register('details')}
              error={!!errors.details}
              helperText={errors.details?.message}
            />
            <input
              type="file"
              multiple
              {...register('photos')}
              className="file-input"
            />
            {errors.photos && <p className="error-text">{errors.photos.message}</p>}
            <Button type="submit" variant="contained" color="primary" className="submit-button">
              Add Product
            </Button>
          </form>
          <MUIDataTable title="Products" data={products} columns={columns} options={options} />

          {showModal && selectedProduct && (
            <Modal open={showModal} onClose={() => setShowModal(false)}>
              <div className="modal-content">
                <h3>Update Product</h3>
                <form
                  onSubmit={modalHandleSubmit((data) => handleModalSubmit(data))}
                  className="modal-form"
                >
                  <TextField
                    label="Product Name"
                    variant="outlined"
                    fullWidth
                    defaultValue={selectedProduct.name}
                    {...modalRegister('name')}
                    error={!!modalErrors.name}
                    helperText={modalErrors.name?.message}
                  />
                  <TextField
                    label="Price"
                    type="number"
                    variant="outlined"
                    fullWidth
                    defaultValue={selectedProduct.price}
                    {...modalRegister('price')}
                    error={!!modalErrors.price}
                    helperText={modalErrors.price?.message}
                  />
                  <TextField
                    label="Category"
                    variant="outlined"
                    fullWidth
                    defaultValue={selectedProduct.category}
                    {...modalRegister('category')}
                    error={!!modalErrors.category}
                    helperText={modalErrors.category?.message}
                  />
                  <TextField
                    label="Details"
                    variant="outlined"
                    fullWidth
                    multiline
                    defaultValue={selectedProduct.details}
                    {...modalRegister('details')}
                    error={!!modalErrors.details}
                    helperText={modalErrors.details?.message}
                  />
                  <input
                    type="file"
                    multiple
                    {...modalRegister('photos')}
                    className="file-input"
                  />
                  {modalErrors.photos && <p className="error-text">{modalErrors.photos.message}</p>}
                  <div className="modal-buttons">
                    <Button type="submit" variant="contained" color="primary">
                      Save Changes
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        resetModalForm();
                        setShowModal(false);
                      }}
                    >
                      Cancel
                    </Button>
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