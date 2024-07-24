import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, fetchUserLogs, userEdit, suspendUser } from '../redux/slice/userSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import AWN from 'awesome-notifications';
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications
import '../styles/userDetails.css';

const UserDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const { id } = useParams();
  const { selectedUser, logs, status, error } = useSelector((state) => state.user);
  const notifier = new AWN();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchUserLogs(id));
    }
  }, [dispatch, id]);

  const handleClickOpen = () => {
    if (selectedUser) {
      setFormData({ name: selectedUser.name, email: selectedUser.email, role: selectedUser.role });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (id) {
      dispatch(userEdit({ ...formData, id }))
        .unwrap()
        .then(() => {
          notifier.success('User updated successfully');
          handleClose();
          window.location.reload();
        })
        .catch((error) => {
          notifier.alert(error.message);
        });
    }
  };

  const handleSuspend = (suspend) => {
    dispatch(suspendUser({ id, suspend }))
      .unwrap()
      .then(() => {
        notifier.success(`User ${suspend ? 'suspended' : 'unsuspended'} successfully`);
      })
      .catch((error) => {
        notifier.alert(error.message);
      });
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!selectedUser) {
    return <p>No user found.</p>;
  }

  return (
    <div className="user-details-container">
      <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
      <div className="user-details">
        <Avatar src={selectedUser.img} alt={selectedUser.name} className="user-avatar" />
        <div>
          <Typography variant="h4" className="user-name">{selectedUser.name}</Typography>
          <Typography variant="body1" className="user-email">Email: {selectedUser.email}</Typography>
          <Typography variant="body1" className="user-role">Role: {selectedUser.role}</Typography>
          {selectedUser.suspended && (
            <Typography variant="body2" className="user-status" color="error">Suspended</Typography>
          )}
        </div>
      </div>
      <div className="logs-container">
        <Typography variant="h5" className="logs-title">Logs</Typography>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <Box key={index} className="log-entry">
              <Typography variant="body2">{log.action}</Typography>
              <Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography>
            </Box>
          ))
        ) : (
          <p>No logs available for this user.</p>
        )}
      </div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>Edit</Button>
      <Button variant="contained" color={selectedUser.suspended ? "success" : "error"} onClick={() => handleSuspend(!selectedUser.suspended)}>
        {selectedUser.suspended ? 'Unsuspend' : 'Suspend'}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
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
          <TextField
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserDetails;
