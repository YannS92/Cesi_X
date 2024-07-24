import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const OrderDialog = ({ open, onClose, selectedQuantity, onQuantityChange, onConfirm }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Select Quantity</DialogTitle>
        <DialogContent>
            <FormControl fullWidth>
                <InputLabel>Quantity</InputLabel>
                <Select value={selectedQuantity} onChange={onQuantityChange}>
                    {[...Array(10).keys()].map((i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                            {i + 1}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} color="primary">Add to order</Button>
        </DialogActions>
    </Dialog>
);

export default OrderDialog;
