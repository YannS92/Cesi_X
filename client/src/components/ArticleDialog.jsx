import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Button, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ArticleDialog = ({ open, onClose, title, formData, onInputChange, onSave, onCancel }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {title}
            <IconButton onClick={onClose}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Price"
                    name="price"
                    value={formData.price}
                    onChange={onInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={onInputChange}
                    fullWidth
                    margin="normal"
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onSave} color="primary">Save</Button>
            <Button onClick={onCancel} color="secondary">Cancel</Button>
        </DialogActions>
    </Dialog>
);

export default ArticleDialog;
