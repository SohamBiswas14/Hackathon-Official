require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({ origin: "*" })); // Allow requests from any frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to Asteria Core"))
    .catch((err) => console.log("Database connection failed:", err));

app.get('/api/status', (req, res) => {
    res.json({ status: "Asteria Backend Online" });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));