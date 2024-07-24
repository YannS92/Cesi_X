import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Rating
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchRestaurantById, updateRestaurant, uploadRestaurantImage, rateRestaurant } from '../redux/slice/restaurantSlice';
import { updateArticle, addArticle, deleteArticle, fetchArticlesByRestaurantId, uploadArticleImage } from '../redux/slice/articleSlice';
import { fetchMenusByRestaurantId, createMenu, deleteMenu, updateMenu } from '../redux/slice/menuSlice';
import AssignDeliveryPersonDialog from '../components/AssignDeliveryPersonDialog';
import CardCarousel from '../components/CardCarousel';
import ArticleDialog from '../components/ArticleDialog';
import ViewArticleDialog from '../components/ViewArticleDialog';
import ViewMenuDialog from '../components/ViewMenuDialog';
import RestaurantInfo from '../components/RestaurantInfo';
import LoadingScreen from '../components/LoadingScreen';
import OrderDialog from '../components/OrderDialog';
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications
import '../styles/restaurantDetail.css';
import { TailSpin } from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import Order from '../class/order'; // Ajouter cette ligne
import DeleteRestaurantDialog from '../components/DeleteRestaurantDialog'; // Import the new component

const RestaurantDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const restaurant = useSelector((state) => state.restaurant.restaurant);
    const status = useSelector((state) => state.restaurant.status);
    const user = useSelector((state) => state.user?.user);
    const articles = useSelector((state) => state.article.restaurantArticles);
    const menus = useSelector((state) => state.menu.menus);
    const notifier = new AWN();
    const [showContent, setShowContent] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [viewArticleMode, setViewArticleMode] = useState(false);
    const [editArticleMode, setEditArticleMode] = useState(false);
    const [deleteArticleMode, setDeleteArticleMode] = useState(false);
    const [createArticleMode, setCreateArticleMode] = useState(false);
    const [createMenuMode, setCreateMenuMode] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [viewMenuMode, setViewMenuMode] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [articleSelected, setArticleSelected] = useState(null);
    const [order, setOrder] = useState(null);
    const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for the delete dialog
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', workingHours: '', category: '' });
    const [articleFormData, setArticleFormData] = useState({ name: '', price: '', description: '', category: '' });
    const [newMenuData, setNewMenuData] = useState({ name: '', description: '', price: '', articles: [] });
    const [downloadMode, setDownloadMode] = useState(false);
    const [displayMode, setDisplayMode] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false); // State for the assign dialog
    const [currentOrderId, setCurrentOrderId] = useState(null); // State for the current order ID
    
    useEffect(() => {
        if (id) {
            dispatch(fetchRestaurantById(id));
            dispatch(fetchMenusByRestaurantId(id));
            dispatch(fetchArticlesByRestaurantId(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (status === 'succeeded' || status === 'failed') {
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 1000); // Ensure the loading animation is shown for at least 1 second

            return () => clearTimeout(timer);
        }
    }, [status]);

    useEffect(() => {
        if (restaurant) {
            setFormData({
                name: restaurant.name || '',
                address: restaurant.address || '',
                phone: restaurant.phone || '',
                workingHours: restaurant.workingHours || '',
                category: restaurant.category || ''
            });
        }
    }, [restaurant]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleArticleInputChange = (e) => {
        const { name, value } = e.target;
        setArticleFormData({
            ...articleFormData,
            [name]: value
        });
    };

    const handleNewMenuInputChange = (e) => {
        const { name, value } = e.target;
        setNewMenuData({
            ...newMenuData,
            [name]: value
        });
    };

    const handleNewMenuArticleChange = (e) => {
        const { value } = e.target;
        setNewMenuData({
            ...newMenuData,
            articles: value
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('img', file);
        setIsUploading(true);

        dispatch(uploadRestaurantImage({ id: restaurant._id, formData }))
            .unwrap()
            .then((response) => {
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Image uploaded successfully!');
                    setIsUploading(false);
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
                setIsUploading(false);
            });
    };

    const handleOpenAssignDialog = (orderId) => {
        setCurrentOrderId(orderId);
        setAssignDialogOpen(true);
    };
    
    const handleAssignDeliveryPerson = async (deliveryPersonId) => {
        try {
            const order = new Order({ orderId: currentOrderId });
            await order.assignDeliveryPerson(deliveryPersonId);
            notifier.success('Delivery person assigned successfully');
            setAssignDialogOpen(false);
            dispatch(fetchRestaurantById(id));
        } catch (error) {
            notifier.alert('Error assigning delivery person');
        }
    };
    

    const handleArticleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('img', file);

        dispatch(uploadArticleImage({ id: selectedArticle.id, formData }))
            .unwrap()
            .then((response) => {
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Image uploaded successfully!');
                    dispatch(fetchArticlesByRestaurantId(id)); // Refetch the articles to get the latest updates
                }
            })
            .catch((error) => {
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleSaveChanges = () => {
        if (!formData.name || !formData.address || !formData.phone || !formData.workingHours || !formData.category) {
            notifier.alert('Please fill in all fields to update the restaurant.');
            return;
        }

        setIsSaving(true);

        dispatch(updateRestaurant({
            id: restaurant._id,
            ...formData
        }))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Restaurant updated successfully!');
                    setEditMode(false);
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleSaveArticleChanges = () => {
        if (!articleFormData.name || !articleFormData.price || !articleFormData.description || !articleFormData.category) {
            notifier.alert('Please fill in all fields to update the article.');
            return;
        }

        setIsSaving(true);

        dispatch(updateArticle({ id: selectedArticle.id, articleData: articleFormData }))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Article updated successfully!');
                    setEditArticleMode(false);
                    setSelectedArticle(null);
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                    window.location.reload();
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error('Error:', error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleViewArticle = (article) => {
        setSelectedArticle(article);
        setViewArticleMode(true);
        setArticleSelected(article);
    };

    const handleEditArticle = () => {
        setArticleFormData({
            name: selectedArticle.title,
            price: selectedArticle.price.replace(' €', ''), // Remove the Euro symbol for editing
            description: selectedArticle.content,
            category: selectedArticle.category || ''
        });
        setViewArticleMode(false);
        setEditArticleMode(true);
    };

    const handleQuantityChange = (event) => {
        setSelectedQuantity(event.target.value);
    };

    const handleAddToCartConfirmed = async () => {
        try {
            let orderData;
    
            if (selectedMenu) {
                orderData = {
                    orderaddress: user.address,
                    orderPhone: user.phoneNumber,
                    userId: user._id,
                    Articles: [],
                    Menus: [
                        {
                            menuId: selectedMenu.id,
                            quantityMenu: selectedQuantity,
                            Articles: selectedMenu.articles.map(article => ({
                                articleId: article.id,
                                quantity: article.quantity * selectedQuantity
                            }))
                        }
                    ]
                };
            } else if (articleSelected) {
                orderData = {
                    orderaddress: user.address,
                    orderPhone: user.phoneNumber,
                    userId: user._id,
                    Articles: [
                        {
                            articleId: articleSelected.id,
                            quantity: selectedQuantity
                        }
                    ],
                    Menus: []
                };
            }
    
            console.log(user);
    
            const order = new Order(orderData);
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (order.initialized) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
    
            setOrder(order);
            console.log(order);
        } catch (error) {
            console.error('Error creating order:', error);
        }
        setQuantityDialogOpen(false);
        notifier.success('Item added to cart successfully!');
    };
    

    const handleAddToCart = async () => {
        setQuantityDialogOpen(true);
    };

    const handleCreateArticle = () => {
        if (!articleFormData.name || !articleFormData.price || !articleFormData.description || !articleFormData.category) {
            notifier.alert('Please fill in all fields to add the article.');
            return;
        }

        setIsSaving(true);

        dispatch(addArticle({
            ...articleFormData,
            restaurantId: restaurant._id
        }))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Article added successfully!');
                    setCreateArticleMode(false);
                    setArticleFormData({ name: '', price: '', description: '', category: '' });
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleDeleteArticle = () => {
        setIsSaving(true);

        dispatch(deleteArticle(selectedArticle.id))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                notifier.success('Article deleted successfully!');
                setDeleteArticleMode(false);
                setSelectedArticle(null);
                dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
            })
            .catch((error) => {
                setIsSaving(false);
                console.error('Error:', error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleViewMenu = (menu) => {
        setSelectedMenu(menu);
        setViewMenuMode(true);
    };

    const handleCreateMenu = () => {
        if (!newMenuData.name || !newMenuData.price || !newMenuData.description || newMenuData.articles.length === 0) {
            notifier.alert('Please fill in all fields to create a menu.');
            return;
        }

        setIsSaving(true);

        const formattedPrice = parseFloat(newMenuData.price);
        const newMenu = {
            ...newMenuData,
            price: formattedPrice,
            restaurantId: restaurant._id
        };

        console.log(restaurant._id);
        console.log(newMenuData);

        dispatch(createMenu(newMenu))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Menu created successfully!');
                    setCreateMenuMode(false);
                    setNewMenuData({ name: '', description: '', price: '', articles: [] });
                    document.body.classList.remove('fade-in');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleOpenRatingDialog = () => {
        setRatingDialogOpen(true);
    };

    const handleCloseRatingDialog = () => {
        setRatingDialogOpen(false);
    };

    const handleRatingChange = (event, newValue) => {
        setUserRating(newValue);
    };

    const handleSubmitRating = () => {
        if (userRating < 1 || userRating > 5) {
            notifier.alert('Rating must be between 1 and 5 stars.');
            return;
        }

        dispatch(rateRestaurant({ id: restaurant._id, rating: userRating }))
            .unwrap()
            .then((response) => {
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Rating submitted successfully!');
                    setUserRating(0); // Reset rating
                    setRatingDialogOpen(false);
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    if (!showContent) {
        return <LoadingScreen />;
    }

    if (!restaurant) {
        return <div>Restaurant not found</div>;
    }

    const handleArticleClick = (article) => {
        const articleXML = `
        <article>
            <N>Name : ${article.name}</N>
            <D>Description : ${article.description}</D>
            <P>Price : ${article.price}</P>
            <C>Category${article.category}</C>
        </article>`;
        const blob = new Blob([articleXML], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.name}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleMenuClick = (menu) => {
        const menuXML = `
        <menu>
            <name>${menu.name}</name>
            <description>${menu.description}</description>
            <price>${menu.price}</price>
            <category>${menu.category}</category>
        </menu>`;
        const blob = new Blob([menuXML], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${menu.name}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRestaurantClick = () => {
        const restaurantXML = `
        <restaurant>
            <name>${restaurant.name}</name>
            <address>${restaurant.address}</address>
            <phone>${restaurant.phone}</phone>
            <workingHours>${restaurant.workingHours}</workingHours>
            <category>${restaurant.category}</category>
            <averageRating>${averageRating}</averageRating>
        </restaurant>`;
        const blob = new Blob([restaurantXML], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${restaurant.name}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const averageRating = restaurant.ratings && restaurant.ratings.length > 0
        ? (restaurant.ratings.reduce((acc, rating) => acc + rating, 0) / restaurant.ratings.length).toFixed(1)
        : 0;

    return (
        <div className="restaurant-detail-container">
            <div className="restaurant-image-container">
                {isUploading
                    ? (
                        <div className="loader-container">
                            <TailSpin color="#007bff" height={40} width={40} />
                        </div>
                    )
                    : (<>
                        <img src={restaurant.img} alt="Restaurant" className="restaurant-img" />
                        {(user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId) || user?.role === 'admin'
                            ? (
                                <label htmlFor="upload-img" className="restaurant-camera-icon">
                                    <FontAwesomeIcon icon={faCamera} />
                                </label>
                            )
                            : null}
                        <input type="file" id="upload-img" style={{ display: 'none' }}
                            onChange={handleImageUpload} />
                    </>)}
            </div>
            {editMode
                ? (
                    <Dialog open={editMode} onClose={() => setEditMode(false)}>
                        <DialogTitle
                            sx={{
                                backgroundColor: 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                            Edit Restaurant
                            <IconButton onClick={() => setEditMode(false)}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                <TextField
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal" />
                                <TextField
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal" />
                                <TextField
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal" />
                                <TextField
                                    label="Working Hours"
                                    name="workingHours"
                                    value={formData.workingHours}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal" />
                                <TextField
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal" />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleSaveChanges} color="primary">Save</Button>
                            <Button onClick={() => setEditMode(false)} color="secondary">Cancel</Button>
                        </DialogActions>
                    </Dialog>
                )
                : (<RestaurantInfo
                    restaurant={restaurant}
                    user={user}
                    averageRating={averageRating}
                    onEdit={() => setEditMode(true)}
                    onCreateArticle={() => setCreateArticleMode(true)}
                    onCreateMenu={() => setCreateMenuMode(true)}
                    onDownload={() => setDownloadMode(true)} />)}
            {user?.role === 'client' && (
                <div className="rating-container">
                    <Typography variant="h6">Rate this Restaurant:</Typography>
                    <Rating name="user-rating" value={userRating} onChange={handleRatingChange} />
                    <Button variant="contained" color="primary" onClick={handleOpenRatingDialog}>Submit Rating</Button>
                </div>
            )}

            <Dialog open={ratingDialogOpen} onClose={handleCloseRatingDialog}>
                <DialogTitle>
                    Submit Your Rating
                    <IconButton onClick={handleCloseRatingDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                        <Rating name="user-rating" value={userRating} onChange={handleRatingChange} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubmitRating} color="primary">Submit</Button>
                    <Button onClick={handleCloseRatingDialog} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>

            <h2 className="carousel-title">Menus</h2>
            {restaurant.menus && restaurant.menus.length > 0
                ? (<CardCarousel
                    items={restaurant.menus.map(menu => ({
                        id: menu._id,
                        img: menu.img || '/default-article-image.png',
                        title: menu.name,
                        price: `${menu.price} €`,
                        description: menu.description,
                        articles: menu.articles
                    }))}
                    carouselId="menus"
                    onCardClick={handleViewMenu} />)
                : (
                    <p>No menus available.</p>
                )}

            <h2 className="carousel-title">Articles</h2>
            {restaurant.articles && restaurant.articles.length > 0
                ? (<CardCarousel
                    items={restaurant.articles.map(article => ({
                        id: article._id,
                        img: article.img || '/default-article-image.png',
                        title: article.name,
                        content: article.description,
                        price: `${article.price} €`,
                        color: article.color || '#e3f1f8',
                        text: 'Read Article',
                        link: '',
                        category: article.category
                    }))}
                    carouselId="articles"
                    onCardClick={handleViewArticle} />)
                : (
                    <p>No articles available.</p>
                )}

            {selectedArticle && (<ViewArticleDialog
                open={viewArticleMode}
                onClose={() => setViewArticleMode(false)}
                article={selectedArticle}
                onEdit={handleEditArticle}
                onDelete={() => setDeleteArticleMode(true)}
                onAddToCart={handleAddToCart}
                user={user}
                restaurant={restaurant}
                onImageUpload={handleArticleImageUpload} />)}

            {editArticleMode && selectedArticle && (<ArticleDialog
                open={editArticleMode}
                onClose={() => setEditArticleMode(false)}
                title="Edit Article"
                formData={articleFormData}
                onInputChange={handleArticleInputChange}
                onSave={handleSaveArticleChanges}
                onCancel={() => setEditArticleMode(false)} />)}

            {createArticleMode && (<ArticleDialog
                open={createArticleMode}
                onClose={() => setCreateArticleMode(false)}
                title="Add Article"
                formData={articleFormData}
                onInputChange={handleArticleInputChange}
                onSave={handleCreateArticle}
                onCancel={() => setCreateArticleMode(false)} />)}

            {deleteArticleMode && (
                <Dialog open={deleteArticleMode} onClose={() => setDeleteArticleMode(false)}>
                    <DialogTitle
                        sx={{
                            backgroundColor: 'transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        Confirm Delete
                        <IconButton onClick={() => setDeleteArticleMode(false)}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this article?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteArticle} color="error">Delete</Button>
                        <Button onClick={() => setDeleteArticleMode(false)} color="secondary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}

            {selectedMenu && (<ViewMenuDialog
                open={viewMenuMode}
                onClose={() => setViewMenuMode(false)}
                menu={selectedMenu}
                onAddToCart={handleAddToCart}
                user={user}
                restaurant={restaurant} />)}

<Dialog
    open={createMenuMode}
    onClose={() => setCreateMenuMode(false)}
    fullWidth
    maxWidth="md">
    <DialogTitle
        sx={{
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
        Create Menu
        <IconButton onClick={() => setCreateMenuMode(false)}>
            <CloseIcon />
        </IconButton>
    </DialogTitle>
    <DialogContent>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 2
            }}>
            <TextField
                label="Name"
                name="name"
                value={newMenuData.name}
                onChange={handleNewMenuInputChange}
                fullWidth
                margin="normal" />
            <TextField
                label="Description"
                name="description"
                value={newMenuData.description}
                onChange={handleNewMenuInputChange}
                fullWidth
                margin="normal" />
            <TextField
                label="Price"
                name="price"
                value={newMenuData.price}
                onChange={handleNewMenuInputChange}
                fullWidth
                margin="normal" />
            <FormControl fullWidth margin="normal">
                <InputLabel id="articles-label">Articles</InputLabel>
                <Select
                    labelId="articles-label"
                    name="articles"
                    multiple
                    value={newMenuData.articles}
                    onChange={handleNewMenuArticleChange}
                    renderValue={(selected) => selected.map(id => {
                        const article = articles.find(a => a._id === id);
                        return article ? article.name : id;
                    }).join(', ')}>
                    {articles.map((article) => (
                        <MenuItem key={article._id} value={article._id}>
                            {article.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>

    </DialogContent>
    <DialogActions>
        <Button onClick={handleCreateMenu} color="primary">Create</Button>
        <Button onClick={() => setCreateMenuMode(false)} color="secondary">Cancel</Button>
    </DialogActions>
</Dialog>


            <Dialog
                open={downloadMode}
                onClose={() => setDownloadMode(false)}
                fullWidth
                maxWidth="md">
                <DialogTitle
                    sx={{
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Download
                    <IconButton onClick={() => setDownloadMode(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 2
                        }}>
                        <Button variant="contained" color="primary" onClick={() => { handleRestaurantClick(); }} sx={{ margin: 1 }}>
                            Restaurant
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => { setDisplayMode('articles'); setDownloadMode(false); }} sx={{ margin: 1 }}>
                            Articles
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => { setDisplayMode('menus'); setDownloadMode(false); }} sx={{ margin: 1 }}>
                            Menus
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog
                open={displayMode === 'articles'}
                onClose={() => setDisplayMode(null)}
                fullWidth
                maxWidth="md">
                <DialogTitle
                    sx={{
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Articles
                    <IconButton onClick={() => setDisplayMode(null)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: 2
                        }}>
                        {articles.map((article) => (
                            <Box
                                key={article._id}
                                sx={{
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: 2,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleArticleClick(article)}>
                                <Typography variant="h6">{article.name}</Typography>
                                <Typography variant="body2">{article.description}</Typography>
                                <Typography variant="body2">{article.price} €</Typography>
                                <Typography variant="body2">{article.category}</Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog
                open={displayMode === 'menus'}
                onClose={() => setDisplayMode(null)}
                fullWidth
                maxWidth="md">
                <DialogTitle
                    sx={{
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Menus
                    <IconButton onClick={() => setDisplayMode(null)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: 2
                        }}>
                        {menus.map((menu) => (
                            <Box
                                key={menu._id}
                                sx={{
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: 2,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleMenuClick(menu)}>
                                <Typography variant="h6">{menu.name}</Typography>
                                <Typography variant="body2">{menu.description}</Typography>
                                <Typography variant="body2">{menu.price} €</Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>

            <OrderDialog
                open={quantityDialogOpen}
                onClose={() => setQuantityDialogOpen(false)}
                selectedQuantity={selectedQuantity}
                onQuantityChange={handleQuantityChange}
                onConfirm={handleAddToCartConfirmed} />
            {user?.role === 'admin' && (
                <div className="admin-controls">
                    <h2>
                        ⚠️ Delete
                    </h2>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setDeleteDialogOpen(true)}>Delete Restaurant</Button>
                </div>
            )}
            <DeleteRestaurantDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                restaurantId={restaurant._id} />
        </div>
    );
};

export default RestaurantDetail;
