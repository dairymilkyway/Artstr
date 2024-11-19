import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // For editing
  const [showModal, setShowModal] = useState(false); // Toggle modal visibility
  const [selectedRows, setSelectedRows] = useState([]); // Tracks selected rows

  // Function to get the token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: {
          Authorization: getToken(),
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const addProduct = async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          Authorization: getToken(),
        },
      });
      alert('Product added successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error.response?.data?.message || error.message);
    }
  };

  // Update product
  const updateProduct = async (id, formData) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
        headers: {
          Authorization: getToken(),
        },
      });
      alert('Product updated successfully');
      fetchProducts();
      setShowModal(false); // Close modal
    } catch (error) {
      console.error('Error updating product:', error.response?.data?.message || error.message);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: getToken(),
        },
      });
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error.response?.data?.message || error.message);
    }
  };

  // Bulk delete products
  const bulkDeleteProducts = async () => {
    const idsToDelete = selectedRows.map((rowIndex) => products[rowIndex]._id);
    try {
      await axios.post(
        'http://localhost:5000/api/products/delete',
        { ids: idsToDelete },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      alert('Selected products deleted successfully');
      fetchProducts();
      setSelectedRows([]); // Clear selected rows after deletion
    } catch (error) {
      console.error('Error deleting products:', error.response?.data?.message || error.message);
    }
  };

  // Table columns
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
    {
      name: 'Action',
      label: 'Action',
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const product = products[rowIndex];

          return (
            <div>
              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setShowModal(true);
                }}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  marginRight: '5px',
                  cursor: 'pointer',
                }}
              >
                Update
              </button>
              <button
                onClick={() => deleteProduct(product._id)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          );
        },
      },
    },
  ];

  // Table options
  const options = {
    selectableRows: 'multiple', // Enable multiple row selection
    onRowsSelect: (currentRowsSelected, allRowsSelected) => {
      const selectedRowIndexes = allRowsSelected.map((row) => row.index);
      setSelectedRows(selectedRowIndexes);
    },
    customToolbarSelect: (selectedRows) => {
      const selectedCount = selectedRows.data.length;
      return (
        selectedCount >= 2 && (
          <button
            onClick={bulkDeleteProducts}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Bulk Delete
          </button>
        )
      );
    },
    expandableRows: true, // Enable expandable rows
    renderExpandableRow: (rowData, rowMeta) => {
      const rowIndex = rowMeta.dataIndex;
      const product = products[rowIndex];

      return (
        <tr>
          <td colSpan={columns.length + 1}>
            <div style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
              <p>
                <strong>Name:</strong> {product.name}
              </p>
              <p>
                <strong>Price:</strong> ${product.price}
              </p>
              <p>
                <strong>Category:</strong> {product.category}
              </p>
              <p>
                <strong>Details:</strong> {product.details}
              </p>
              <div>
                <strong>Photos:</strong>
                <div>
                  {product.photos.map((url, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${url}`}
                      alt="Product"
                      style={{ width: '100px', marginRight: '5px', marginTop: '5px' }}
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
    <div style={{ padding: '20px', height: '100vh', overflowY: 'auto' }}>
      <h1>Admin Dashboard</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addProduct(formData);
          e.target.reset();
        }}
      >
        <input type="text" name="name" placeholder="Product Name" required />
        <input type="number" name="price" placeholder="Price" required />
        <input type="text" name="category" placeholder="Category" required />
        <textarea name="details" placeholder="Details" required></textarea>
        <input type="file" name="photos" multiple />
        <button type="submit">Add Product</button>
      </form>
      <MUIDataTable title="Products" data={products} columns={columns} options={options} />

      {/* Update Modal */}
      {showModal && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h3>Update Product</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              updateProduct(selectedProduct._id, formData);
            }}
          >
            <input
              type="text"
              name="name"
              defaultValue={selectedProduct.name}
              placeholder="Product Name"
              required
            />
            <input
              type="number"
              name="price"
              defaultValue={selectedProduct.price}
              placeholder="Price"
              required
            />
            <input
              type="text"
              name="category"
              defaultValue={selectedProduct.category}
              placeholder="Category"
              required
            />
            <textarea
              name="details"
              defaultValue={selectedProduct.details}
              placeholder="Details"
              required
            ></textarea>
            <input type="file" name="photos" multiple />
            <div>
              <button type="submit" style={{ marginRight: '10px' }}>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
