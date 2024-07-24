import React from 'react';
import { Box } from '@mui/material';
import pizzaLoader from '../assets/pizza-loader.gif'; // Adjust the path as necessary

const LoadingScreen = ({ fullPage = true }) => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: fullPage ? '100vh' : '100%',
            width: '100%',
            backgroundColor: fullPage ? '#f5f5f5' : 'transparent',
        }}
    >
        <img src={pizzaLoader} alt="Loading..." style={{ width: '200px', height: '200px' }} />
    </Box>
);

export default LoadingScreen;
