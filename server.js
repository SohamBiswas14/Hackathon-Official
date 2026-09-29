require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
// This line automatically hosts your frontend folder!
app.use(express.static(path.join(__dirname, 'frontend')));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected to Asteria Core"))
    .catch((err) => console.log("Database connection failed:", err));

// --- TEST ROUTE ---
app.get('/api/status', (req, res) => {
    res.json({ status: "Asteria Backend Online" });
});

// --- API ROUTE: START OR LOAD GAME ---
app.post('/api/start', async(req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }

        // 1. Check if this player already exists
        let player = await User.findOne({ username: username });

        if (player) {
            return res.json({
                message: "Welcome back, Explorer.",
                player: player,
                isNew: false
            });
        } else {
            // 2. Player does not exist. Create a new one!
            player = new User({ username: username });
            await player.save();

            return res.json({
                message: "New terminal connection established.",
                player: player,
                isNew: true
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server singularity error. Try again." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));