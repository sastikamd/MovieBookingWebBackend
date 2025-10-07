const express = require('express');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      movieId,
      showDate,
      showTime,
      seats,
      theater,
      paymentIntentId
    } = req.body;

    // Get movie details
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    seats.forEach(seat => {
      totalAmount += seat.price;
    });

    // Add GST (18%) and booking fee (â‚¹25 per ticket)
    const gst = totalAmount * 0.18;
    const bookingFee = seats.length * 25;
    totalAmount = totalAmount + gst + bookingFee;

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      movie: movieId,
      movieTitle: movie.title,
      showDate,
      showTime,
      seats,
      totalAmount: Math.round(totalAmount),
      theater,
      status: 'confirmed',
      paymentStatus: 'completed',
      paymentIntentId 
    });

    await booking.save();

    setImmediate(async () => {
      try {
        const user = req.user; 
        console.log('🔔 user:', req.user);
        const movie = await Movie.findById(movieId);
        const result = await notificationService.sendBookingNotifications(booking, user, movie);
        console.log('🔔 Email result:', result.email);
      } catch (err) {
        console.error('🔔 Notification error:', err);
      }
    });

    // Update movie booking count
    await Movie.findByIdAndUpdate(movieId, {
      $inc: { bookingCount: seats.length }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating booking'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get user bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('movie', 'title poster duration').lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booking'
    });
  }
});

// GET /api/bookings/by-payment-intent/:paymentIntentId
router.get('/by-payment-intent/:paymentIntentId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ paymentIntentId: req.params.paymentIntentId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking by paymentIntent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



module.exports = router;
