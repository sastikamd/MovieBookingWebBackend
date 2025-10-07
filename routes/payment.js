const express = require('express');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

const router = express.Router();

// Create Stripe Customer
router.post('/customer', async (req, res) => {
  const { email, firstname, lastname } = req.body;
  try {
    const customer = await stripe.customers.create({
      email,
      name: `${firstname} ${lastname}`,
      metadata: { firstname, lastname },
    });
    res.json({ success: true, customerId: customer.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create SetupIntent
router.post('/setupintent', async (req, res) => {
  try {
    const { customer } = req.body;
    const options = {
      payment_method_types: ['card', 'us_bank_account', 'cashapp', 'link'],
    };
    if (customer) options.customer = customer;

    const setupIntent = await stripe.setupIntents.create(options);
    res.json({ success: true, clientSecret: setupIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create PaymentIntent
router.post('/paymentintent', async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parsedAmount * 100), // Rupees to paise
      currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
