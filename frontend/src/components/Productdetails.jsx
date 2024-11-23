import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Box,
  styled,
  Button,
  Divider
} from '@mui/material';
import { Close, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: '#181413',
    color: '#fff',
    borderRadius: 8,
    maxWidth: '800px',
    width: '100%',
  },
}));

const StyledButton = styled(Button)({
  color: '#fff',
  padding: '6px 16px',
  textTransform: 'none',
  fontSize: '14px',
  borderRadius: '500px',
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

const ProductModal = ({ product, open, onClose }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [ratings, setRatings] = useState([]);
  const maxSteps = product.photos?.length || 1;

  useEffect(() => {
    if (open) {
      fetchRatings();
    }
  }, [open]);

  const fetchRatings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/ratings?productId=${product._id}`);
      setRatings(response.data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        {product.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#fff',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flex: 2, position: 'relative', mb: 2 }}>
            <Box
              sx={{
                height: 400,
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

          <Box sx={{ flex: 1, ml: 2 }}>
            <Typography variant="h6" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#b3b3b3' }}>
              {product.category}
            </Typography>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mt: 1 }}>
              {product.details}
            </Typography>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mt: 1 }}>
              {product.specifications}
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

            <Box sx={{ mt: 2 }}>
              <StyledButton
                size="small"
                className="primary"
                onClick={() => {
                  // Add to cart logic here
                  onClose();
                }}
                disabled={product.stocks <= 0} // Disable button if out of stock
              >
                {product.stocks > 0 ? 'Add to Cart' : 'Out of Stock'}
              </StyledButton>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Ratings
            </Typography>
            {ratings.length > 0 ? (
              ratings.map((rating) => (
                <Box key={rating._id} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                    {rating.comment}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                    Rating: {rating.rating} / 5
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                No ratings yet.
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

ProductModal.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    details: PropTypes.string,
    specifications: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.string),
    stocks: PropTypes.number.isRequired,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProductModal;