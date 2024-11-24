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
  Divider,
  TextField,
  Rating,
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
      transform: 'scale(1.04)',
    },
  },
  '&.secondary': {
    backgroundColor: '#444',
    '&:hover': {
      backgroundColor: '#666',
    },
  },
});

const ProductModal = ({ product, open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [review, setReview] = useState({ rating: 0, comment: '', orderId: '' });
  const [canReview, setCanReview] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const maxSteps = product.photos?.length || 1;

  useEffect(() => {
    if (open) {
      fetchRatings();
      checkIfCanReview();
    }
  }, [open]);

  const fetchRatings = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/${product._id}/reviews`
      );
      setRatings(response.data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  const checkIfCanReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/orders?productId=${product._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const reviewedOrderIds = new Set(ratings.map(rating => rating.orderId));
      const unreviewedOrders = response.data.filter(order => !reviewedOrderIds.has(order._id));
      if (unreviewedOrders.length > 0) {
        setReview(prevReview => ({ ...prevReview, orderId: unreviewedOrders[0]._id }));
        setCanReview(true);
      } else {
        setCanReview(false);
      }
    } catch (error) {
      console.error('Failed to check if user can review:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReview((prevReview) => ({ ...prevReview, [name]: value }));
  };

  const handleReviewSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/products/${product._id}/review`,
        review,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRatings();
      setReview({ rating: 0, comment: '', orderId: '' });
      checkIfCanReview();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleReviewUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/products/${product._id}/review`,
        review,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRatings();
      setReview({ rating: 0, comment: '', orderId: '' });
      setEditingReview(null);
      checkIfCanReview();
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const toggleReviewsModal = () => {
    setShowReviewsModal((prev) => !prev);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReview({ rating: review.rating, comment: review.comment, orderId: review.orderId });
  };

  return (
    <>
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
                  position: 'relative',
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
              </Box>
            </Box>

            <Box sx={{ flex: 1, ml: 2 }}>
              <Typography variant="h6" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'white' }}>
                {product.category}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
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

              <Divider sx={{ my: 2 }} />

              <StyledButton
                className="secondary"
                onClick={toggleReviewsModal}
                size="small"
              >
                View Reviews
              </StyledButton>

              {canReview ? (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Write a Review
                  </Typography>
                  <Rating
                    name="rating"
                    value={review.rating}
                    precision={0.5}
                    onChange={(e, value) =>
                      setReview((prev) => ({ ...prev, rating: value }))
                    }
                    sx={{ mb: 2, color: '#1DB954' }}
                  />
                  <TextField
                    label="Comment"
                    name="comment"
                    value={review.comment}
                    onChange={handleReviewChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    InputLabelProps={{
                      style: { color: 'white' },
                    }}
                    InputProps={{
                      style: { color: 'white' },
                    }}
                  />
                  <StyledButton
                    size="small"
                    className="primary"
                    onClick={handleReviewSubmit}
                  >
                    Submit Review
                  </StyledButton>
                </>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'white', mt: 3 }}
                >
                  You must place an order to leave a review.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
      </StyledDialog>

      {/* Reviews Modal */}
      <StyledDialog open={showReviewsModal} onClose={toggleReviewsModal}>
        <DialogTitle>
          Reviews for {product.name}
          <IconButton
            aria-label="close"
            onClick={toggleReviewsModal}
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
          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <Box key={rating._id} sx={{ mb: 2 }}>
                <Rating
                  value={rating.rating}
                  precision={0.5}
                  readOnly
                  sx={{ color: '#1DB954' }}
                />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {rating.comment}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  By: {rating.userName}
                </Typography>
                {rating.user === localStorage.getItem('userId') && (
                  <StyledButton
                    size="small"
                    className="primary"
                    onClick={() => handleEditReview(rating)}
                  >
                    Edit Review
                  </StyledButton>
                )}
                <Divider sx={{ my: 1 }} />
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: 'white' }}>
              No reviews yet.
            </Typography>
          )}
        </DialogContent>
      </StyledDialog>

      {/* Edit Review Modal */}
      {editingReview && (
        <StyledDialog open={Boolean(editingReview)} onClose={() => setEditingReview(null)}>
          <DialogTitle>
            Edit Review
            <IconButton
              aria-label="close"
              onClick={() => setEditingReview(null)}
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
            <Typography variant="h6" gutterBottom>
              Edit your review for {product.name}
            </Typography>
            <Rating
              name="rating"
              value={review.rating}
              precision={0.5}
              onChange={(e, value) =>
                setReview((prev) => ({ ...prev, rating: value }))
              }
              sx={{ mb: 2, color: '#1DB954' }}
            />
            <TextField
              label="Comment"
              name="comment"
              value={review.comment}
              onChange={handleReviewChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              InputLabelProps={{
                style: { color: 'white' },
              }}
              InputProps={{
                style: { color: 'white' },
              }}
            />
            <StyledButton
              size="small"
              className="primary"
              onClick={handleReviewUpdate}
            >
              Update Review
            </StyledButton>
          </DialogContent>
        </StyledDialog>
      )}
    </>
  );
};

ProductModal.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    details: PropTypes.string,
    price: PropTypes.number.isRequired,
    stocks: PropTypes.number.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProductModal;