const express = require('express');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create Booking (auth protected)
router.post('/', auth, async (req, res) => {
  try {
    const {
      movieId,
      showDate,
      showTime,
      seats,
      theater,
      paymentIntentId,
    } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    let totalAmount = 0;
    seats.forEach(seat => { totalAmount += seat.price; });
    const gst = totalAmount * 0.18;
    const bookingFee = seats.length * 25;
    totalAmount = Math.round(totalAmount + gst + bookingFee);

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
      paymentIntentId,
    });
    await booking.save();

    await Movie.findByIdAndUpdate(movieId, { $inc: { bookingCount: seats.length } });

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating booking' });
  }
});

module.exports = router;
