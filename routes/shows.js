const express = require('express');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware to allow only admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Create new show (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { movieId, theater, showDate, startTime, seatsAvailable, price } = req.body;

    // Validate movie
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const newShow = await Show.create({
      movie: movieId,
      theater,
      showDate,
      startTime,
      seatsAvailable: seatsAvailable || 100,
      price: price || movie.pricing
    });

    res.json({ success: true, data: newShow });
  } catch (error) {
    console.error('Create show error:', error);
    res.status(500).json({ success: false, message: 'Server error creating show' });
  }
});

// Get all shows for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const shows = await Show.find({ movie: req.params.movieId }).sort({ showDate: 1, startTime: 1 });
    res.json({ success: true, data: shows });
  } catch (error) {
    console.error('Get shows error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching shows' });
  }
});

module.exports = router;
