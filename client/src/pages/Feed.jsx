import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAllRestaurants, fetchRestaurantsByCategory } from '../redux/slice/restaurantSlice';
import LoadingScreen from '../components/LoadingScreen';
import { Box, Typography, Button } from '@mui/material';
import CategorySelector from '../components/CategorySelector'; // Import CategorySelector
import GridDisplay from '../components/GridDisplay'; // Import GridDisplay
import CreateRestaurantDialog from '../components/CreateRestaurantDialog '; // Import CreateRestaurantDialog
import '../styles/feed.css';
import '../styles/categorySelector.css'; // Import the CSS file

const Feed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const restaurants = useSelector((state) => state.restaurant.restaurants);
    const status = useSelector((state) => state.restaurant.status);
    const user = useSelector((state) => state.user?.user); // Get the current user from the state

    // ************************** lang section ************************** //
    const [languageData, setLanguageData] = useState({});
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get('lang') || 'fr'; // Default language to 'fr'
    const [loading, setLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [category, setCategory] = useState('All');
    const [showContent, setShowContent] = useState(false);
    const [open, setOpen] = useState(false); // State to handle dialog open/close

    useEffect(() => {
        const loadTimeout = setTimeout(() => {
            setLoading(false);
            setShowContent(true); // Show content after initial load
        }, 1500); // 1.5 seconds delay

        dispatch(fetchAllRestaurants());
        import(`../lang/${lang}.json`)
            .then((data) => {
                setLanguageData(data);
            })
            .catch((error) => {
                console.error("Error loading language file:", error);
            });

        return () => clearTimeout(loadTimeout); // Cleanup timeout on unmount
    }, [lang, dispatch]);

    useEffect(() => {
        const loadCategoryData = async () => {
            setCategoryLoading(true);
            setShowContent(false); // Hide content while loading new category
            if (category === 'All') {
                await dispatch(fetchAllRestaurants());
            } else {
                await dispatch(fetchRestaurantsByCategory(category));
            }
            setTimeout(() => {
                setCategoryLoading(false);
                setShowContent(true); // Show content after category load
            }, 1500); // 1.5 seconds delay for category change
        };

        loadCategoryData();
    }, [category, dispatch]);

    const handleCategoryChange = (category) => {
        setCategory(category);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const generateItems = (restaurants) => {
        return restaurants.map((restaurant, index) => ({
            id: restaurant._id,
            img: restaurant.img || '/default-article-image.png',
            title: restaurant.name,
            content: restaurant.address,
            price: restaurant.address,
            color: ['#d3efda', '#FEE4B6', '#4c526c', '#955979', '#090702'][index % 5],
            link: `/restaurant/${restaurant._id}`,
            text: 'En exclusivité sur Cesi Eats 🔥',
        }));
    };

    const items = generateItems(restaurants);

    return (
        <div className="feed-container">
            <CategorySelector onSelectCategory={handleCategoryChange} />
            {user?.role === 'admin' && (
                <Box sx={{ textAlign: 'start', margin: '10px 0' }}>
                    <Button variant="contained" color="primary" onClick={handleClickOpen}>
                        Create Restaurant
                    </Button>
                </Box>
            )}
            {loading || status === "loading" ? (
                <LoadingScreen fullPage />
            ) : (
                <>
                    {categoryLoading ? (
                        <div className="loader-container">
                            <LoadingScreen fullPage={false} />
                        </div>
                    ) : (
                        <div className={`fade-in ${showContent ? 'show' : ''}`}>
                            {restaurants.length === 0 ? (
                                <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
                                    No restaurants found for the selected category.
                                </Typography>
                            ) : (
                                
                                <GridDisplay items={items} title="Discover More" />
                            )}
                        </div>
                    )}
                </>
            )}
          
            <CreateRestaurantDialog open={open} onClose={handleClose} />
        </div>
    );
};

export default Feed;
