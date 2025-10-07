const express = require('express');
const router = express.Router(); // ✅ You were missing this
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');

// Middleware to allow only admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
// Create new movie (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, description, genre, director, cast, duration, language, rating, poster, releaseDate, status, pricing } = req.body;

    const newMovie = await Movie.create({
      title,
      description,
      genre,
      director,
      cast,
      duration,
      language,
      rating,
      poster,
      releaseDate,
      status: status || 'now-showing',
      pricing
    });

    res.json({ success: true, data: newMovie });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({ success: false, message: 'Server error creating movie' });
  }
});

module.exports = router; 