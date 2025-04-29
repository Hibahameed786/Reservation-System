const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve static HTML from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Handle reservation POST
app.post('/reserve', (req, res) => {
    const reservation = req.body;

    let data = [];
    if (fs.existsSync('data.json')) {
        const file = fs.readFileSync('data.json');
        data = JSON.parse(file);
    }

    data.push(reservation);
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    res.json({ message: 'Reservation saved successfully!' });
});

// Get all reservations
app.get('/reservations', (req, res) => {
    if (fs.existsSync('data.json')) {
        const file = fs.readFileSync('data.json');
        const data = JSON.parse(file);
        res.json(data);
    } else {
        res.json([]);
    }
});

// Correct port for Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
