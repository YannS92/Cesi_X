// DeleteRestaurantDialog.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { deleteRestaurant } from '../redux/slice/restaurantSlice';
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications

const DeleteRestaurantDialog = ({ open, onClose, restaurantId }) => {
  const dispatch = useDispatch();
  const notifier = new AWN();

  const handleDeleteRestaurant = () => {
    dispatch(deleteRestaurant(restaurantId))
      .unwrap()
      .then((response) => {
        if (response.error) {
          notifier.alert(response.error);
        } else {
          notifier.success('Restaurant deleted successfully!');
          onClose();
        }
      })
      .catch((error) => {
        console.error(error);
        notifier.alert('An unexpected error occurred. Please try again.');
      });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Confirm Delete
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this restaurant?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteRestaurant} color="error">Delete</Button>
        <Button onClick={onClose} color="secondary">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRestaurantDialog;
