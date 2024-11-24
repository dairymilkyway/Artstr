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
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [canReview, setCanReview] = useState(false); // Can write a review
  const [editingReview, setEditingReview] = useState(false); // Editing an existing review
  const [userReview, setUserReview] = useState(null); // User's existing review
  const [showReviewsModal, setShowReviewsModal] = useState(false); // Modal for viewing reviews
  const maxSteps = product.photos?.length || 1;

  useEffect(() => {
    if (open) {
      fetchRatings();
    }
  }, [open]);

  const fetchRatings = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/${product._id}/reviews`
      );

      const currentUserId = localStorage.getItem('userId'); // Get userId from localStorage
      const existingReview = response.data.find(
        (review) => review.user === currentUserId
      );

      setRatings(response.data);

      if (existingReview) {
        setUserReview(existingReview);
        setReview({
          rating: existingReview.rating,
          comment: existingReview.comment,
        });
        setEditingReview(true); // Enable editing mode if the user has a review
      } else {
        setEditingReview(false);
      }

      checkIfCanReview();
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

      const reviewedOrderIds = new Set(ratings.map((r) => r.orderId));
      const unreviewedOrders = response.data.filter(
        (order) => !reviewedOrderIds.has(order._id)
      );

      setCanReview(unreviewedOrders.length > 0);
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
      const endpoint = `http://localhost:5000/api/products/${product._id}/review`;
      const method = editingReview ? 'put' : 'post';

      await axios[method](
        endpoint,
        review,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchRatings(); // Refresh reviews
      setReview({ rating: 0, comment: '' }); // Reset the form
      setEditingReview(false); // Stop editing mode
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const EditReviewModal = ({ open, onClose, review, onReviewChange, onSubmit }) => (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit Your Review
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
        <Typography variant="h6" gutterBottom>
          Edit Your Review
        </Typography>
        <Rating
          name="rating"
          value={review.rating}
          precision={0.5}
          onChange={(e, value) =>
            onReviewChange({ ...review, rating: value })
          }
          sx={{ mb: 2, color: '#1DB954' }}
        />
        <TextField
          label="Comment"
          name="comment"
          value={review.comment}
          onChange={(e) =>
            onReviewChange({ ...review, comment: e.target.value })
          }
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
          onClick={onSubmit}
          sx={{ mt: 2 }}
        >
          Update Review
        </StyledButton>
      </DialogContent>
    </StyledDialog>
  );
  

  const toggleReviewsModal = () => {
    setShowReviewsModal((prev) => !prev);
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

              {canReview || editingReview ? (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    {editingReview ? 'Edit Your Review' : 'Write a Review'}
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
                    {editingReview ? 'Update Review' : 'Submit Review'}
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
      ratings.map((rating) => {
        const currentUserId = localStorage.getItem('userId'); // Fetch logged-in userId
        const isUserReview = rating.user?._id === currentUserId; // Check if this review belongs to the logged-in user

        return (
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

            {isUserReview && (
              <StyledButton
              className="secondary"
              size="small"
              onClick={() => {
                setEditingReview(true); // Enable editing mode
                setReview({
                  rating: rating.rating,
                  comment: rating.comment,
                }); // Pre-fill the review form
                setShowReviewsModal(false); // Close the reviews modal
              }}
            >
              Edit Your Review
            </StyledButton>
            
            )}

            <Divider sx={{ my: 1 }} />
          </Box>
        );
      })
    ) : (
      <Typography variant="body2" sx={{ color: 'white' }}>
        No reviews yet.
      </Typography>
    )}
  </DialogContent>
</StyledDialog>
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
