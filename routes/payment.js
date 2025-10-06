const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create Payment Intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
      currency: currency,
      metadata: {
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment Intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment Intent creation failed'
    });
  }
});

// Confirm Payment (optional verification endpoint)
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent to check status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        message: 'Payment confirmed',
        paymentIntent
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment confirmation failed'
    });
  }
});

module.exports = router;
