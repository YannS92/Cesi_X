import React from 'react';
import { Box, Grid } from '@mui/material';
import Card from './Card'; // Ensure you have a Card component or create one accordingly

const GridDisplay = ({ items, title }) => {
    return (
        <Box sx={{ margin: '20px 0' }}>
            {title && <h2 className='carousel-title'>{title}</h2>}
            <Grid container spacing={2}>
                {items.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={item.id}>
                        <Box onClick={() => window.location.href = item.link} sx={{ cursor: 'pointer' }}>
                            <Card
                                img={item.img}
                                title={item.title}
                                price={item.price} // Pass the price to the Card component if needed
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default GridDisplay;
