import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const REACT_APP_API_URL = "http://localhost:5000";

const AssignDeliveryPersonDialog = ({ open, onClose, onAssign, orderId }) => {
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            const fetchDeliveryPersons = async () => {
                try {
                    const response = await axios.get(`${REACT_APP_API_URL}/delivery-person/all`, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                        },
                    });
                    setDeliveryPersons(response.data);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching delivery persons:', error);
                    setLoading(false);
                }
            };

            fetchDeliveryPersons();
        }
    }, [open]);

    const handleAssign = () => {
        onAssign(selectedPerson);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Assign Delivery Person</DialogTitle>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="delivery-person-label">Delivery Person</InputLabel>
                        <Select
                            labelId="delivery-person-label"
                            value={selectedPerson}
                            onChange={(e) => setSelectedPerson(e.target.value)}
                        >
                            {deliveryPersons.map((person) => (
                                <MenuItem key={person._id} value={person._id}>
                                    {person.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAssign} color="primary" disabled={!selectedPerson}>Assign</Button>
                <Button onClick={onClose} color="secondary">Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignDeliveryPersonDialog;
