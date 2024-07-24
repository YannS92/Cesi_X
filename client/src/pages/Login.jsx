import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/login.css';
import { userLogin, userRegister, validateReferralCode } from '../redux/slice/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginContainer = ({ ping, setPing }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { referralValidation, error: referralError } = useSelector((state) => state.user); // Destructure state
    const [login, setLogin] = useState({ email: '', password: '', showPassword: false });
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: '', referralCode: '',
        address: '', phoneNumber: '', vehicleDetails: '', showPassword: false
    });
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [languageData, setLanguageData] = useState({});
    const passwordRef = useRef(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const lang = searchParams.get('lang') || 'en';
        import(`../lang/${lang}.json`)
            .then((data) => {
                setLanguageData(data);
            })
            .catch((error) => {
                console.error("Error loading language file:", error);
            });
    }, [location.search]);

    const togglePasswordVisibility = () => {
        setLogin({ ...login, showPassword: !login.showPassword });
    };

    const toggleNewUserPasswordVisibility = () => {
        setNewUser({ ...newUser, showPassword: !newUser.showPassword });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (e.target.id === 'email') {
                passwordRef.current.focus();
            } else if (e.target.id === 'password') {
                handleLogin();
            }
        }
    };

    const handleLogin = async () => {
        try {
            setError('');
            const response = await dispatch(userLogin(login)).unwrap();
            if (response.token) {
                navigate('/feed');
                setPing(!ping);
            }
        } catch (error) {
            if (error.msg === 'Account is suspended') {
                setError('Your account is suspended. Please contact support.');
            } else {
                setError('Email or password incorrect.');
            }
            console.error('Login error:', error);
        }
    };

    const validateInputs = () => {
        const errors = {};
        if (!newUser.name) {
            errors.name = 'Name is required.';
        }
        if (!newUser.email) {
            errors.email = 'Email is required.';
        } else if (!validateEmail(newUser.email)) {
            errors.email = 'Invalid email format.';
        }
        if (!newUser.password) {
            errors.password = 'Password is required.';
        } else if (!validatePassword(newUser.password)) {
            errors.password = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.';
        }
        if (!newUser.address) {
            errors.address = 'Address is required.';
        }
        if (!newUser.phoneNumber) {
            errors.phoneNumber = 'Phone number is required.';
        }
        if (!newUser.role) {
            errors.role = 'Role is required.';
        }
        if (newUser.role === 'deliveryPerson' && !newUser.vehicleDetails) {
            errors.vehicleDetails = 'Vehicle details are required for delivery persons.';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateInputs()) {
            return;
        }
        if (newUser.referralCode) {
            try {
                const response = await dispatch(validateReferralCode(newUser.referralCode)).unwrap();
                if (!response.valid) {
                    setError('Invalid referral code.');
                    return;
                }
            } catch (error) {
                setError('Error validating referral code.');
                console.error("Error validating referral code", error);
                return;
            }
        }
        try {
            console.log('Registering user:', newUser); // Debug log
            await dispatch(userRegister(newUser)).unwrap();
            setNewUser({ name: '', email: '', password: '', role: '', referralCode: '', address: '', phoneNumber: '', vehicleDetails: '' });
            setShowCreateAccountModal(false); // Close modal on successful registration
            setShowSignInModal(true); // Show login modal
        } catch (error) {
            setError('Error registering user.');
            console.error("Error registering user", error);
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(String(password));
    };

    const handleInputChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    return (
        <div className="login-page">
            <div className="text-container">
                <h1 className="headline">{languageData.meals || "Your favorite meals"}</h1>
                <h2 className="subheadline">Delivered to you</h2>
                <div className="button-container">
                    <button className="sign-in" onClick={() => setShowSignInModal(true)}>Sign in</button>
                    <button className="create-account" onClick={() => {
                        setNewUser({
                            name: '', email: '', password: '', role: '', referralCode: '',
                            address: '', phoneNumber: '', vehicleDetails: '', showPassword: false
                        });
                        setShowCreateAccountModal(true);
                    }}>Create account</button>
                    <p className="terms-text">
                        By signing up, you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>, including <a href="#">Cookie Use</a>.
                    </p>
                </div>
            </div>

            {showSignInModal && (
                <div id="loginModal" className="modal">
                    <div className="modal-content">
                        <div className="login-container">
                            <span className="close" onClick={() => setShowSignInModal(false)}>&times;</span>
                            <h2 className="headline-login">Sign in to use X</h2>
                            <div className="input-container">
                                <input
                                    id="email"
                                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                                    onKeyPress={handleKeyPress}
                                    type="text"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="input-container">
                                <input
                                    id="password"
                                    ref={passwordRef}
                                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                                    onKeyPress={handleKeyPress}
                                    type={login.showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                />
                                <FontAwesomeIcon
                                    icon={login.showPassword ? faEyeSlash : faEye}
                                    onClick={togglePasswordVisibility}
                                    className="eye-icon"
                                />
                            </div>
                            <button onClick={handleLogin}>Next</button>
                            {error && <p className="error">{error}</p>}
                        </div>
                    </div>
                </div>
            )}

            {showCreateAccountModal && (
                <div id="loginModal" className="modal">
                    <div className="modal-content">
                        <div className="login-container">
                            <span className="close" onClick={() => setShowCreateAccountModal(false)}>&times;</span>
                            <h2 className="create-account">Create your account</h2>
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.name && <p className="error">{validationErrors.name}</p>}
                            </div>
                            <div className="input-container">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.email && <p className="error">{validationErrors.email}</p>}
                            </div>
                            <div className="input-container">
                                <input
                                    type={newUser.showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                />
                                <FontAwesomeIcon
                                    icon={newUser.showPassword ? faEyeSlash : faEye}
                                    onClick={toggleNewUserPasswordVisibility}
                                    className="eye-icon"
                                />
                                {validationErrors.password && <p className="error">{validationErrors.password}</p>}
                            </div>
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    value={newUser.address}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.address && <p className="error">{validationErrors.address}</p>}
                            </div>
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={newUser.phoneNumber}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.phoneNumber && <p className="error">{validationErrors.phoneNumber}</p>}
                            </div>
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="referralCode"
                                    placeholder="Referral Code (Optional)"
                                    value={newUser.referralCode}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-container">
                                <select
                                    name="role"
                                    value={newUser.role}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Role</option>
                                    <option value="user">User</option>
                                    <option value="restaurantOwner">Restaurant Owner</option>
                                    <option value="deliveryPerson">Delivery Person</option>
                                </select>
                                {validationErrors.role && <p className="error">{validationErrors.role}</p>}
                            </div>
                            {newUser.role === 'deliveryPerson' && (
                                <div className="input-container">
                                    <input
                                        type="text"
                                        name="vehicleDetails"
                                        placeholder="Vehicle Details"
                                        value={newUser.vehicleDetails}
                                        onChange={handleInputChange}
                                    />
                                    {validationErrors.vehicleDetails && <p className="error">{validationErrors.vehicleDetails}</p>}
                                </div>
                            )}
                            <button onClick={handleRegister}>Register</button>
                            {error && <p className="error">{error}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginContainer;
