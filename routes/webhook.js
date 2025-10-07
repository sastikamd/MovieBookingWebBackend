const express = require('express');
const Stripe = require('stripe');
const Booking = require('../models/Booking'); // Adjust if your path differs
const Movie = require('../models/Movie');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      try {
        const { userId, movieId, seats } = paymentIntent.metadata;
        const movie = await Movie.findById(movieId);

        const booking = await Booking.create({
          user: userId,
          movie: movieId,
          showDate: movie.showDate,   // Adjust to your movie schema
          showTime: movie.showTime,
          seats: JSON.parse(seats),
          totalAmount: paymentIntent.amount_received / 100,
          paymentIntentId: paymentIntent.id,
        });

        console.log('Booking created successfully:', booking._id);
      } catch (err) {
        console.error('Error creating booking from webhook:', err);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
