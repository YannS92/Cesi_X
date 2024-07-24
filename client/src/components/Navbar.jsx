import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slice/userSlice";
import { fetchRestaurantsByOwnerId } from "../redux/slice/restaurantSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHeart,
  faShoppingCart,
  faWallet,
  faTachometerAlt,
  faStore,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { Input, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import moment from 'moment';

const Navbar = ({ setPing, ping }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [animationClass, setAnimationClass] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [cartAnimationClass, setCartAnimationClass] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const user = useSelector((state) => state.user?.user);
    const ownedRestaurants = useSelector((state) => state.restaurant?.ownedRestaurants);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notificationsRef = useRef(null);
    const location = useLocation();
    const navbarRef = useRef(null);
    const cartRef = useRef(null);

    useEffect(() => {
        if (user?.role === "restaurantOwner") {
            dispatch(fetchRestaurantsByOwnerId(user._id));
        }
    }, [dispatch, user, ping]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (user) {
                try {
                    const response = await axios.get(`http://localhost:5000/notifications?userId=${user._id}`);
                    setNotifications(response.data);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            }
        };

        fetchNotifications();
    }, [user]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
        window.location.reload();
    };

    const toggleMenu = () => {
        if (menuOpen) {
            setAnimationClass("fade-out");
            setTimeout(() => {
                setMenuOpen(false);
                setAnimationClass("");
            }, 500);
        } else {
            setMenuOpen(true);
            setAnimationClass("fade-in");
        }
    };

    const handleSearchInput = async (event) => {
        const name = event.target.value.trim().toLowerCase();
        if (name.length >= 3) {
            try {
                const response = await axios.get(
                    `http://localhost:5000/restaurant/name/${name}`
                );

                if (Array.isArray(response.data)) {
                    setSearchResults(response.data);
                } else {
                    console.error("Error, let's try again");
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Error fetching restaurants:", error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    const toggleCart = () => {
        if (cartOpen) {
            setCartAnimationClass("fade-out");
            setTimeout(() => {
                setCartOpen(false);
                setCartAnimationClass("");
            }, 500);
        } else {
            setCartOpen(true);
            setCartAnimationClass("fade-in");
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const handleCloseMenu = () => {
        if (menuOpen) {
            setAnimationClass('fade-out');
            setTimeout(() => {
                setMenuOpen(false);
                setAnimationClass('');
            }, 500);
        }
    };

    const handleCloseCart = () => {
        if (cartOpen) {
            setCartAnimationClass("fade-out");
            setTimeout(() => {
                setCartOpen(false);
                setCartAnimationClass("");
            }, 500);
        }
    };

    const handleNotificationClick = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/notifications/${id}`);
            setNotifications(notifications.filter(notification => notification._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const renderNotifications = () => (
        <div ref={notificationsRef} className="notification-dropdown">
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <div key={notification._id} className="notification-item" onClick={() => handleNotificationClick(notification._id)}>
                        <div>{notification.message}</div>
                        <div className="notification-meta">
                            <span>{moment(notification.createdAt).fromNow()}</span>
                            <span>{moment(notification.createdAt).format('YYYY-MM-DD | HH:mm')}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="notification-item">No notifications</div>
            )}
            <button className="payment-history-button" onClick={() => navigate('/payment-history')}>
                Historique des Paiements
            </button>
        </div>
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (menuOpen && navbarRef.current && !navbarRef.current.contains(event.target)) {
                handleCloseMenu();
            }
            if (cartOpen && cartRef.current && !cartRef.current.contains(event.target)) {
                handleCloseCart();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen, cartOpen]);

    const renderCartOrAuthButtons = () => {
        switch (user?.role) {
            case "client":
                return (
                    <button className="cart-button" onClick={toggleCart}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                    </button>
                );
            case "admin":
                return null;
            case "restaurantOwner":
                return (
                    <button className="dropdown-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faStore} /> My Restaurants
                    </button>
                );
<<<<<<< HEAD
                case "deliveryPerson":
=======
            case "deliveryPerson":
                    return null;
            case "user":
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
                    return null;
            default:
                return (
                    <div className="auth-buttons">
                        <button className="sign-in" onClick={() => navigate("/")}>
                            Sign in
                        </button>
                        <button className="sign-up" onClick={() => navigate("/")}>
                            Sign up
                        </button>
                    </div>
                );
        }
    };

    // ************************** lang section ************************** //
    const [languageData, setLanguageData] = useState({});
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get('lang') || "fr";

    useEffect(() => {
        import(`../lang/${lang}.json`)
            .then((data) => {
                setLanguageData(data);
            })
            .catch((error) => {
                console.error("Error loading language file:", error);
            });
    }, [location.search]);

    return (
        <>
            <div className={`navbar`}>
                <button className="menu-button" onClick={toggleMenu}>
                    ☰
                </button>
                <Link to={`/feed?lang=${lang}`}>
                    <img src="/logo.svg" alt="App Logo" className="app-logo" />
                </Link>
                <div className="spacer"></div>
                <div className="search-container">
                    <IconButton type="submit" aria-label="search">
                        <SearchIcon />
                    </IconButton>
                    <Input
                        placeholder="Search in CESI_X"
                        inputProps={{ "aria-label": "search" }}
                        className="search-input"
                        onChange={handleSearchInput}
                    />
                </div>

                <button className="notification-button" onClick={toggleNotifications}>
                    <FontAwesomeIcon icon={faBell} />
                    {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                </button>

                <div id="result">
                    {searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map((result) => (
                                <li key={result._id}>
                                    <Link to={`/restaurant/${result._id}`}>{result.name}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : searchResults.length >= 3 ? (
                        <p>No results found</p>
                    ) : null}
                </div>

                {renderCartOrAuthButtons()}
            </div>

            {user?.role === "admin" && (
                <>
                    {renderCartOrAuthButtons()}
                </>
            )}

            {menuOpen && (
                <>
                    <div className={`overlay ${animationClass}`} onClick={                    handleCloseMenu}></div>
                    <div ref={navbarRef} className={`dropdown-menu ${animationClass}`}>
                        <Link to={`/profile?lang=${lang}`} onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faUser} className="menu-icon" />{languageData.profile}</h1>
                        </Link>
                        {user?.role === 'admin' && (
                            <>
                                <Link to={`/usermanagement?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faTachometerAlt} className="menu-icon" /> User Management</h1>
                                </Link>
                                <Link to={`/admin-orders?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" /> Orders</h1>
                                </Link>
                                <Link to={`/feed?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" /> Feed</h1>
                                </Link>
                            </>
                        )}
                        {user?.role === 'restaurantOwner' && (
                            <>
                                <Link to={`/restaurantOrder?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" /> Orders</h1>
                                </Link>
                                <Link to={`/feed?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" /> Feed</h1>
                                </Link>
<<<<<<< HEAD
=======
                                <Link to={`/financial-dashboard?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faWallet} className="menu-icon" /> Financial Dashboard</h1>
                                </Link>
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
                                <h1 className='dropdown-content' onClick={toggleMenu}>
                                    <FontAwesomeIcon icon={faStore} className="menu-icon" /> My Restaurants
                                </h1>
                                {ownedRestaurants && ownedRestaurants.length > 0 ? (
                                    ownedRestaurants.map((restaurant) => (
                                        <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} onClick={toggleMenu}>
                                            <h2 className='submenu-item'>{restaurant.name}</h2>
                                        </Link>
                                    ))
                                ) : (
                                    <p className='submenu-item'>No restaurants found</p>
                                )}
                            </>
                        )}
                           {user?.role === 'deliveryPerson' && (
                            <>
                                
                                <Link to={`/delivery-commands?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" /> Commandes</h1>
                                </Link>
                            </>
                        )}
<<<<<<< HEAD
=======
                        {user?.role === 'user' && (
                            <>
                              
                                <Link to={`/commandes?lang=${lang}`} onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" /> Orders</h1>
                                </Link>
                            </>
                        )

                        }
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </>
            )}

            {showNotifications && renderNotifications()}

            {cartOpen && (
                <>
                    <div
                        className={`overlay ${cartAnimationClass}`}
                        onClick={handleCloseCart}
                    ></div>
                    <div ref={cartRef} className={`cart-menu ${cartAnimationClass}`}>
                        <h1 className="dropdown-content">Cart Content</h1>
                        <button className="close-cart-button" onClick={handleCloseCart}>
                            Close
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default Navbar;

