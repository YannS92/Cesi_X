import React from 'react';
import { Box, Typography, Rating, Button } from '@mui/material';

const RestaurantInfo = ({ restaurant, user, averageRating, onEdit, onCreateArticle, onCreateMenu, onDownload }) => (
    <>
        <Typography variant="h1" className="restaurant-name">{restaurant.name}</Typography>
        <Typography variant="body1" className="restaurant-address">Address: {restaurant.address}</Typography>
        <Rating
            name="read-only"
            value={parseFloat(averageRating)}
            precision={0.1}
            readOnly
        />
        <Typography variant="body1" className="restaurant-phone">Phone: {restaurant.phone}</Typography>
        <Typography variant="body1" className="restaurant-working-hours">Working Hours: {restaurant.workingHours}</Typography>
        <Typography variant="body1" className="restaurant-category">Category: {restaurant.category}</Typography>
        <Box className="restaurant-ratings" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        </Box>
        {(user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId) || user?.role === 'admin' ? (
            <>
                <Button variant="contained" color="primary" onClick={onEdit}>
                    Edit Information
                </Button>
                <Button variant="contained" color="primary" onClick={onCreateArticle} sx={{ marginLeft: 2 }}>
                    Add Article
                </Button>
                <Button variant="contained" color="primary" onClick={onCreateMenu} sx={{ marginLeft: 2 }}>
                    Add Menu
                </Button>
                <Button variant="contained" color="primary" onClick={onDownload} sx={{ marginLeft: 2 }}>
                    Download
                </Button>
            </>
        ) : null}

    </>
);

export default RestaurantInfo;
