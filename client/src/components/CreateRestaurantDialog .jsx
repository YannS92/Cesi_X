// CreateRestaurantDialog.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createRestaurant } from '../redux/slice/restaurantSlice';
import { fetchAllUsers } from '../redux/slice/userSlice'; // Import the fetchAllUsers thunk
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications

const CreateRestaurantDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const notifier = new AWN();
  const users = useSelector((state) => state.user.users); // Get the users from the state

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    ownerId: '', // You might want to set the ownerId based on the admin's selection or current user
    workingHours: '',
    category: ''
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchAllUsers());
    }
  }, [open, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateRestaurant = () => {
    if (!formData.name || !formData.address || !formData.phone || !formData.email || !formData.ownerId || !formData.workingHours || !formData.category) {
      notifier.alert('Please fill in all fields to create the restaurant.');
      return;
    }

    dispatch(createRestaurant(formData))
      .unwrap()
      .then((response) => {
        if (response.error) {
          notifier.alert(response.error);
        } else {
          notifier.success('Restaurant created successfully!');
          onClose();
        }
      })
      .catch((error) => {
        console.error(error);
        notifier.alert('An unexpected error occurred. Please try again.');
      });
  };

  const restaurantOwners = users.filter(user => user.role === 'restaurantOwner');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Create Restaurant
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="ownerId-label">Owner</InputLabel>
          <Select
            labelId="ownerId-label"
            name="ownerId"
            value={formData.ownerId}
            onChange={handleInputChange}
          >
            {restaurantOwners.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Working Hours"
          name="workingHours"
          value={formData.workingHours}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCreateRestaurant} color="primary">Create</Button>
        <Button onClick={onClose} color="secondary">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRestaurantDialog;
