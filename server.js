require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const User = require('./models/User');

const scryptAsync = promisify(scrypt);
const app = express();

async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(password, salt, 64);
    return `scrypt$${salt}$${hash.toString('hex')}`;
}

async function verifyPassword(password, storedPassword) {
    if (typeof storedPassword !== 'string' || !storedPassword.startsWith('scrypt$')) {
        return false;
    }

    const [, salt, storedHash] = storedPassword.split('$');
    if (!salt || !storedHash) {
        return false;
    }

    const expectedHash = Buffer.from(storedHash, 'hex');
    const actualHash = await scryptAsync(password, salt, expectedHash.length);
    return expectedHash.length > 0 && timingSafeEqual(actualHash, expectedHash);
}

function serializePlayer(player) {
    return {
        id: player._id,
        username: player.username,
        currentLevel: player.currentLevel,
        inventory: player.inventory,
        discoveredTruth: player.discoveredTruth,
    };
}

app.use(cors({ origin: "*" }));
app.use(express.json());
// This line automatically hosts your frontend folder!
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/phase4.html', (req, res) => res.sendFile(path.join(__dirname, 'phase4.html')));
app.get('/phase4.js', (req, res) => res.sendFile(path.join(__dirname, 'phase4.js')));
app.get('/phase4style.css', (req, res) => res.sendFile(path.join(__dirname, 'phase4style.css')));
app.get('/phase5.html', (req, res) => res.sendFile(path.join(__dirname, 'phase5.html')));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected to Asteria Core"))
    .catch((err) => console.log("Database connection failed:", err));

// --- TEST ROUTE ---
app.get('/api/status', (req, res) => {
    res.json({ status: "Asteria Backend Online" });
});

app.post('/api/signup', async (req, res) => {
    try {
        const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and passkey are required.' });
        }

        const existingPlayer = await User.findOne({ username });
        if (existingPlayer) {
            return res.status(409).json({ error: 'Recruit ID already exists. Initiate login instead.' });
        }

        const player = await User.create({ username, password: await hashPassword(password) });
        return res.status(201).json({
            message: 'New terminal connection established.',
            player: serializePlayer(player),
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Recruit ID already exists. Initiate login instead.' });
        }

        console.error(error);
        return res.status(500).json({ error: 'Server singularity error. Try again.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and passkey are required.' });
        }

        const player = await User.findOne({ username });
        if (!player) {
            return res.status(404).json({ error: 'Agent not found. Verify recruit ID.' });
        }

        const validPassword = player.password.startsWith('scrypt$')
            ? await verifyPassword(password, player.password)
            : player.password === password;

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid passkey. Access denied.' });
        }

        if (!player.password.startsWith('scrypt$')) {
            player.password = await hashPassword(password);
            await player.save();
        }

        return res.json({ message: 'Welcome back, Explorer.', player: serializePlayer(player) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server singularity error. Try again.' });
    }
});

app.post('/api/game/advance-phase', async (req, res) => {
    try {
        const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
        if (!username) {
            return res.status(400).json({ error: 'Username required.' });
        }

        const player = await User.findOne({ username });
        if (!player) {
            return res.status(404).json({ error: 'Player not found.' });
        }
        if (player.isEliminated) {
            return res.status(403).json({ error: 'Player is eliminated.' });
        }

        const gameLocations = ['Mission Control', 'Planet Sonic Enigma', 'System Aurora', 'Abyssal Void', 'The Singularity'];
        if (player.currentLevel < gameLocations.length) {
            player.currentLevel += 1;
            player.currentLocation = gameLocations[player.currentLevel - 1];
            await player.save();
        }

        return res.json({
            message: 'Phase completed. Warp drive engaged.',
            newLevel: player.currentLevel,
            newLocation: player.currentLocation,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to advance phase.' });
    }
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