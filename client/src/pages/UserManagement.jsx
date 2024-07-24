import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, userEdit, userDelete, userAdd, suspendUser } from '../redux/slice/userSlice';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Avatar } from '@mui/material';
import AWN from 'awesome-notifications';
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/userManagement.css'; // Import the CSS for user management

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const { users, status, error, user: currentUser } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    isVerified: false,
    lang: 'en',
    referralCode: ''
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const notifier = new AWN();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, currentUser]);

  const handleClickOpen = (user) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lang: user.lang,
        referralCode: user.referralCode,
        password: ''
      });
      setSelectedUserId(user._id);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        isVerified: false,
        lang: 'en',
        referralCode: ''
      });
      setSelectedUserId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    if (selectedUserId) {
      dispatch(userEdit({ ...formData, id: selectedUserId }))
        .unwrap()
        .then(() => {
          notifier.success('User updated successfully');
          handleClose();
        })
        .catch((error) => {
          notifier.alert(error.message);
        });
    } else {
      dispatch(userAdd(formData))
        .unwrap()
        .then(() => {
          notifier.success('User added successfully');
          handleClose();
        })
        .catch((error) => {
          notifier.alert(error.message);
        });
    }
  };

  const handleDelete = (userId) => {
    dispatch(userDelete(userId))
      .unwrap()
      .then(() => {
        notifier.success('User deleted successfully');
      })
      .catch((error) => {
        notifier.alert(error.message);
      });
  };

  const handleSuspend = (userId, suspend) => {
    dispatch(suspendUser({ id: userId, suspend }))
      .unwrap()
      .then(() => {
        notifier.success(`User ${suspend ? 'suspended' : 'unsuspended'} successfully`);
      })
      .catch((error) => {
        notifier.alert(error.message);
      });
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (currentUser?.role !== 'admin') {
    return <Typography variant="h6">Access Denied</Typography>;
  }

  return (
    <div className="user-management-container">
      <Typography variant="h4" className="title">User Management</Typography>
      <Button variant="contained" color="primary" onClick={() => handleClickOpen(null)}>Add New User</Button>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="user-list">
          {users.map((user) => (
            <Box key={user._id} className="user-item" onClick={() => handleUserClick(user._id)}>
              <Avatar src={user.img} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <Typography variant="body1" className="user-name">{user.name}</Typography>
                <Typography variant="body2" className="user-email">{user.email}</Typography>
                <Typography variant="body2" className="user-role">{user.role}</Typography>
                {user.suspended && (
                  <Typography variant="body2" className="user-status" color="error">Suspended</Typography>
                )}
              </div>
              <Button variant="contained" color="secondary" onClick={(e) => { e.stopPropagation(); handleDelete(user._id); }}>Delete</Button>
              <Button variant="contained" color={user.suspended ? "success" : "error"} onClick={(e) => { e.stopPropagation(); handleSuspend(user._id, !user.suspended); }}>
                {user.suspended ? 'Unsuspend' : 'Suspend'}
              </Button>
            </Box>
          ))}
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          {!selectedUserId && (
            <TextField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="password"
            />
          )}
          <TextField
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Language"
            name="lang"
            value={formData.lang}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Referral Code"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <label>
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
            />
            Verified
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;
