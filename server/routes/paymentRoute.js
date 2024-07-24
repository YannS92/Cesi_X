const express = require("express");
const paymentRoute = express.Router();
const Payment = require('../models/payment');

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PMUzFKJ5LRFuT3XK0gGfYY7jtr2CUDbJP8mQt4IQyNjZq63GUXUDaq1qdGqLkN1UdUDSVm1eZXzNhz6bCFtef1j00tyTYOHs6');

paymentRoute.post('/create-payment-intent', async (req, res) => {
    const { amount, currency, paymentMethodId, userId, orderId } = req.body;
  
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: 'never',
          },
      });
      // Enregistrement du paiement dans la base de données
      const payment = new Payment({
        userId,
        orderId,
        amount,
        currency,
        status: paymentIntent.status,
        createdAt: new Date(),
      });
      await payment.save();
  
      res.send({ paymentIntent });
    } catch (error) {
      const payment = new Payment({
        userId,
        orderId,
        amount,
        currency,
        status: 'failed',
        createdAt: new Date(),
      });
      await payment.save();
      res.status(500).send({ error: error.message });
    }
  });
  
  paymentRoute.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
  });

  // Route pour supprimer un paiement par son ID
  paymentRoute.delete('/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        await Payment.findByIdAndDelete(paymentId);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
  });

module.exports = paymentRoute;