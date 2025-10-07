const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theater: {
    type: String,
    required: true
  },
  showDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  seatsAvailable: {
    type: Number,
    default: 100
  },
  price: {
    premium: { type: Number, default: 400 },
    regular: { type: Number, default: 280 },
    economy: { type: Number, default: 200 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Show', showSchema);
