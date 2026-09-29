const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: Number,
    default: 1,
  },
  currentLocation: {
    type: String,
    default: 'Mission Control',
  },
  inventory: {
    type: [String],
    default: [
      'Map',
      'Book of the Great Library',
      'Radio Signal Tuner',
      'Hacking System',
      'Poison',
      'Hints',
    ],
  },
  isEliminated: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', UserSchema);
