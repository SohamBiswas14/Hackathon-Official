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
  // NEW: Track collected bomb defusal codes
  collectedCodes: {
    type: [String],
    default: [],
  },
  // NEW: Track if they've unscrambled the binary (Phase 2 requirement)
  hasDecodedBinary: {
    type: Boolean,
    default: false,
  },
  isEliminated: {
    type: Boolean,
    default: false,
  },
  // NEW: Track if game is beaten
  gameCompleted: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('User', UserSchema);
