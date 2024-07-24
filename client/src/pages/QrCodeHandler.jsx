import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const QrCodeHandler = () => {
  const { subOrderId } = useParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validateDelivery = async () => {
    setLoading(true);
    try {
      const API_URL = (window.location.host).split(":")[0]
      const response = await axios.put(`http://${API_URL}:5000/order/validate-delivery/${subOrderId}`, {}, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.success) {
        setMessage('Sub-order validated for delivery successfully!');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error validating sub-order for delivery:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error validating sub-order for delivery: ${error.response.data.message}`);
      } else {
        setMessage('An error occurred while validating the sub-order for delivery.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Validating Delivery</h1>
      {message && <p>{message}</p>}
      <button onClick={validateDelivery} disabled={loading}>
        {loading ? 'Validating...' : 'Validate Delivery'}
      </button>
    </div>
  );
};

export default QrCodeHandler;
