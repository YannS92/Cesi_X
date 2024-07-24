import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifPay = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paymentStatus = location.state?.paymentStatus;

    const handleHomeRedirect = () => {
        navigate('/');
    };

    return (
        <div>
            <h1>Vérification du Paiement</h1>
            {paymentStatus ? (
                <p>{paymentStatus}</p>
            ) : (
                <p>Erreur : Statut de paiement non disponible.</p>
            )}
            <button onClick={handleHomeRedirect}>Retour à l'accueil</button>
        </div>
    );
};

export default VerifPay;
