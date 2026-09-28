const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({ origin: "*" })); // Allow requests from any frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/api/status', (req, res) => {
    res.json({ status: "Asteria Backend Online" });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));