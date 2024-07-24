import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

const EmailForm = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/sendEmail', { to, subject, message });
      console.log('Email envoyé:', response.data);
      setError('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      setError('Erreur lors de l\'envoi de l\'e-mail. Veuillez réessayer.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2> Envoyer un e-mail</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label> À :</label>
          <input type="email" value={to} onChange={(e) => setTo(e.target.value)} required />
        </div>
        <div>
          <label> Objet :</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label> Message :</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>Envoyer</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default EmailForm;