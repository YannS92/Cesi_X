import {useEffect, useState} from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AWN from 'awesome-notifications';
import 'awesome-notifications/dist/style.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField } from '@mui/material';

const ViewPaymentDialog  = ({ order, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const user = useSelector((state) => state.user?.user);
    const notifier = new AWN();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);

    const handlePayment = async () => {
 
        if (!stripe || !elements) {
            return;
        }
        if (!firstName || !lastName) {
            setFirstNameError(!firstName);
            setLastNameError(!lastName);
            notifier.alert('Please enter your first and last name.');
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.log('[error]', error);
            notifier.alert('Payment method creation failed');
        } else {
            console.log('[PaymentMethod]', paymentMethod);

            const response = await fetch('http://localhost:5000/payments/create-payment-intent', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(order.OrderPrice * 100), // montant en cents
                    currency: 'eur',
                    paymentMethodId: paymentMethod.id,
                    userId: user._id,
                    orderId: order._id,
                    firstName: firstName,
                    lastName: lastName,
                }),
            });

            const { paymentIntent, error: backendError } = await response.json();

            if (backendError) {
                console.log('Backend error:', backendError);
                setPaymentStatus(`Payment failed: ${backendError}`);

                // Enregistrer la notification de paiement échoué
                await axios.post('http://localhost:5000/notifications', {
                    userId: user._id,
                    message: `Payment failed: ${backendError}`,
                });
                notifier.alert(`Payment failed: ${backendError}`);
                navigate('/verif-pay', { state: { paymentStatus: `Payment failed: ${backendError}` } });
            } else {
                if (paymentIntent.status === 'succeeded') {
                    const orderId = order._id; 
                    const headers = {
                        Authorization: localStorage.getItem("token"),
                    };
                    const updatedOrder = await axios.put(`http://localhost:5000/order/${orderId}/status`, {
                        OrderStatus: 'payé'
                    }, { headers });

                    setPaymentStatus('Payment succeeded!');

                    // Enregistrer la notification de paiement réussi
                    await axios.post('http://localhost:5000/notifications', {
                        userId: user._id,
                        message: 'Payment succeeded!',
                    });
                    notifier.success('Payment succeeded!');
                    navigate('/verif-pay', { state: { paymentStatus: 'Payment succeeded!' } });
                } else {
                    setPaymentStatus(`Payment failed: ${paymentIntent.status}`);

                    // Enregistrer la notification de paiement échoué
                    await axios.post('http://localhost:5000/notifications', {
                        userId: user._id,
                        message: `Payment failed: ${paymentIntent.status}`,
                    });
                    notifier.alert(`Payment failed: ${paymentIntent.status}`);
                    navigate('/verif-pay', { state: { paymentStatus: `Payment failed: ${paymentIntent.status}` } });
                }
            }
        }
    };

    // Limiter aux lettres uniquement + Convertir en majuscules
    const handleFirstNameChange = (e) => {
        const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\- ]/g, '');
        setFirstName(value.toUpperCase());
        setFirstNameError(false); 
    };
    const handleLastNameChange = (e) => {
        const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\- ]/g, '');
        setLastName(value.toUpperCase()); 
        setLastNameError(false);
    };
    
    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth sx={{ p: 3 }}>
          <DialogTitle>Effectuer le Paiement</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
<<<<<<< HEAD
                Montant : {order.OrderPrice} €
=======
                Montant : {order.OrderPrice.toFixed(2)} €
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
            </Typography>
            <TextField
                label="Prénom"
                variant="outlined"
                margin="normal"
                value={firstName}
                onChange={handleFirstNameChange}
                error={firstNameError}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mr: 5 }}
            />
            <TextField
                label="Nom"
                variant="outlined"
                margin="normal"
                value={lastName}
                onChange={handleLastNameChange}
                error={lastNameError}
                required
                InputLabelProps={{ shrink: true }}
            />
            <CardElement style={{ margin: '1rem 0' }} disabled={true} />
            <Typography variant="body2" color="error" paragraph>
                {paymentStatus}
            </Typography>
            </DialogContent>
            <DialogActions>
            <Button onClick={onClose}>Annuler</Button>
            <Button onClick={handlePayment} disabled={!stripe} variant="contained" color="primary">
<<<<<<< HEAD
                Payer {order.OrderPrice} €
=======
                Payer {order.OrderPrice.toFixed(2)} €
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
            </Button>
            </DialogActions>
        </Dialog>
      );
    };

export default ViewPaymentDialog ;
