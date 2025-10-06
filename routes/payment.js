const express = require('express');
const Razorpay = require('razorpay');
const { auth } = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/order', auth, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in smallest currency unit (paise)

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      payment_capture: 1   // auto capture
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
});

// (Optional) Verify payment signature endpoint
router.post('/verify', auth, (req, res) => {
  // Implementation depends on your payment verification workflow
  // You can verify the signature here or later
  res.json({ success: true, message: 'Payment verified' });
});

module.exports = router;
