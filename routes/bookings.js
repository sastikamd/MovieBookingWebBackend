const express = require('express');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');
const { sendEmail, sendSMS } = require('../utils/notifications');

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking and send confirmation notifications
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, showDate, showTime, seats, theater } = req.body;

    // Validate movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Calculate total amount
    let totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
    const gst = totalAmount * 0.18;           // 18% GST
    const bookingFee = seats.length * 25;     // ₹25 per ticket
    totalAmount = Math.round(totalAmount + gst + bookingFee);

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      movie: movieId,
      movieTitle: movie.title,
      showDate,
      showTime,
      seats,
      totalAmount,
      theater,
      status: 'confirmed',
      paymentStatus: 'completed',
      reminderSent: false // for 1-hour reminder scheduler
    });

    await booking.save();

    // Update movie booking count
    await Movie.findByIdAndUpdate(movieId, { $inc: { bookingCount: seats.length } });

    // Send Email & SMS using req.user
    const emailContent = `
      <p>Hi ${req.user.name},</p>
      <p>Your booking is confirmed!</p>
      <p><strong>Movie:</strong> ${movie.title}</p>
      <p><strong>Theater:</strong> ${theater}</p>
      <p><strong>Showtime:</strong> ${showDate} ${showTime}</p>
      <p><strong>Seats:</strong> ${seats.map(s => s.seatNumber).join(', ')}</p>
      <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
    `;
    sendEmail(req.user.email, '🎬 Booking Confirmation', emailContent).catch(console.error);

    const smsMessage = `Your booking for ${movie.title} at ${showTime} is confirmed. Seats: ${seats.map(s => s.seatNumber).join(', ')}. Enjoy!`;
    sendSMS(req.user.phone, smsMessage).catch(console.error);

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking' });
  }
});

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get a single booking by ID for the authenticated user
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id })
      .populate('movie', 'title poster duration')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching booking' });
  }
});

module.exports = router;
