import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const productImage = product.photos.length > 0 
    ? product.photos[0] 
    : '/images/default-product.png'; // Ensure the default image exists

  return (
    <div className="product-card">
      <img src={productImage} alt={product.name} className="product-image" />
      <h2 className="product-name">{product.name}</h2>
      <p className="product-category">{product.category}</p>
      <p className="product-description">{product.details}</p>
      <p className="product-price">${product.price}</p>
      <div className="product-buttons">
        <button className="view-more-btn">View More</button>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    details: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default ProductCard;