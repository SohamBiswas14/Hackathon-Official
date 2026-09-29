const mongoose = require('mongoose');

// This is the blueprint for our players
const UserSchema = new mongoose.Schema({
        username: {
                type: String,
                required: true,
                unique: true // No two players can have the same name
        },
        currentLevel: {
                type: Number,
                default: 1 // Everyone starts at clue #1
        },
        discoveredTruth: {
                type: Boolean,
                default: false // Becomes true at the Singularity ending
        }
});

module.exports = mongoose.model('User', UserSchema);