const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { movieId, seats, userId } = req.body;

    // You may want to calculate total amount or get info from DB
    // For example, calculate price from seats here or on frontend
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: seats.map(seat => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Seat ${seat.seatNumber} for movie ${movieId}`,
          },
          unit_amount: seat.price * 100, // converting rupees to paise
        },
        quantity: 1,
      })),
      // Pass metadata for booking creation later
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

module.exports = router;
