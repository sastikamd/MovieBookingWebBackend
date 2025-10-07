const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Route: POST /api/payments/create-checkout-session
 * Creates a Stripe Checkout session (recommended for hosted checkout)
 */
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { movieId, seats, userId } = req.body;

    // Calculate total amount here if you want or rely on price_data in line items
    // Each seat forms one line item with unit_amount = seat.price in paise

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: seats.map(seat => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Seat ${seat.seatNumber} for movie ${movieId}`,
          },
          unit_amount: seat.price * 100, // Convert to paise
        },
        quantity: 1,
      })),
      metadata: {
        userId: userId,
        movieId: movieId,
        seats: JSON.stringify(seats),
      },
      success_url: `${process.env.APP_URL}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/movies`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Optional Route: POST /api/payments/create-payment-intent
 * Directly create payment intent (used in some custom payment flows)
 */

router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Rupees to paise
      currency: 'inr',
      metadata: {
        userId: req.user.id,
      },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

