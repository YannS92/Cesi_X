import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { rateRestaurant } from '../redux/slice/restaurantSlice';
import { Box, Button, TextField, Typography } from '@mui/material';
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications

const RatingForm = ({ restaurantId }) => {
    const dispatch = useDispatch();
    const notifier = new AWN();
    const [rating, setRating] = useState('');

    const handleInputChange = (e) => {
        setRating(e.target.value);
    };

    const handleSubmit = () => {
        if (!rating) {
            notifier.alert('Please enter a rating.');
            return;
        }

        dispatch(rateRestaurant({ id: restaurantId, rating: Number(rating) }))
            .unwrap()
            .then((response) => {
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Rating submitted successfully!');
                    setRating('');
                }
            })
            .catch((error) => {
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    return (
        <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">Rate this Restaurant</Typography>
            <TextField
                label="Rating"
                type="number"
                value={rating}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 5 } }}
            />
            <Button onClick={handleSubmit} color="primary" variant="contained">
                Submit Rating
            </Button>
        </Box>
    );
};

export default RatingForm;
