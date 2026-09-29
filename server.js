const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

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
  if (typeof storedPassword !== 'string') {
    return false;
  }

  if (!storedPassword.startsWith('scrypt$')) {
    return storedPassword === password;
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
    discoveredTruth: player.discoveredTruth,
  };
}

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected to Asteria Core'))
  .catch((error) => console.log('Database connection failed:', error));

app.get('/api/status', (req, res) => {
  res.json({ status: 'Asteria Backend Online' });
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

    const player = await User.create({
      username,
      password: await hashPassword(password),
    });

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

    if (!(await verifyPassword(password, player.password))) {
      return res.status(401).json({ error: 'Invalid passkey. Access denied.' });
    }

    if (!player.password.startsWith('scrypt$')) {
      player.password = await hashPassword(password);
      await player.save();
    }

    return res.json({
      message: 'Welcome back, Explorer.',
      player: serializePlayer(player),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server singularity error. Try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
