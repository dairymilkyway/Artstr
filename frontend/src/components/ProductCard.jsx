import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  styled,
  IconButton
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import ProductDetails from './ProductDetails'; // Import the ProductDetails component

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 345,
  background: '#181413',
  color: '#fff',
  borderRadius: 8,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  }
}));

const StyledButton = styled(Button)({
  color: '#fff',
  padding: '6px 16px',
  textTransform: 'none',
  fontSize: '14px',
  borderRadius: '500px', // Spotify uses pill-shaped buttons
  '&.primary': {
    backgroundColor: '#1DB954',
    '&:hover': {
      backgroundColor: '#1ed760',
      transform: 'scale(1.04)'
    }
  },
  '&.secondary': {
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '&:hover': {
      border: '1px solid #fff',
      transform: 'scale(1.04)'
    }
  }
});

const ProductCard = ({ product, onAddToCart }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal open/close
  const maxSteps = product.photos?.length || 1;

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <StyledCard>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              height: 200,
              display: 'flex',
              overflow: 'hidden',
              width: '100%',
              position: 'relative'
            }}
          >
            {product.photos?.map((photo, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: index === activeStep ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                }}
              >
                <img
                  src={photo}
                  alt={`${product.name} - ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}

            <IconButton
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.4)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
              }}
              onClick={handleBack}
              disabled={maxSteps <= 1}
            >
              <KeyboardArrowLeft sx={{ color: 'white' }} />
            </IconButton>

            <IconButton
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.4)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
              }}
              onClick={handleNext}
              disabled={maxSteps <= 1}
            >
              <KeyboardArrowRight sx={{ color: 'white' }} />
            </IconButton>

            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: 1
              }}
            >
              {Array.from(Array(maxSteps)).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index === activeStep ? '#1DB954' : 'rgba(255,255,255,0.5)',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <CardContent>
          <Typography variant="h6" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#b3b3b3' }}>
            {product.category}
          </Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mt: 1 }}>
            {product.details}
          </Typography>
          <Typography variant="h6" sx={{ color: '#1DB954', mt: 2 }}>
            ${product.price}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              mt: 1,
              color: product.stocks > 0 ? '#1DB954' : '#f44336',
              fontWeight: 'bold',
            }}
          >
            {product.stocks > 0
              ? `${product.stocks} in stock`
              : 'Out of stock'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mt: 1 }}>
            Average Rating: {product.averageRating || 'No ratings yet'}
          </Typography>
        </CardContent>

        <CardActions sx={{ padding: 2 }}>
          <StyledButton
            size="small"
            className="primary"
            onClick={onAddToCart}
            disabled={product.stocks <= 0} // Disable button if out of stock
          >
            {product.stocks > 0 ? 'Add to Cart' : 'Out of Stock'}
          </StyledButton>
          <StyledButton
            size="small"
            className="secondary"
            onClick={handleOpenModal}
          >
            View More
          </StyledButton>
        </CardActions>
      </StyledCard>

      <ProductDetails
        product={product}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    details: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.string),
    stocks: PropTypes.number.isRequired,
    averageRating: PropTypes.number, // Added averageRating prop type
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default ProductCard;