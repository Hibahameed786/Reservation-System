const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// POST: Save a new reservation
app.post('/reserve', (req, res) => {
    const reservation = req.body;

    // Read existing reservations
    let data = [];
    if (fs.existsSync('data.json')) {
        const file = fs.readFileSync('data.json');
        data = JSON.parse(file);
    }

    // Add new reservation
    data.push(reservation);

    // Save back to file
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    res.json({ message: 'Reservation saved successfully!' });
});

// GET: Show all reservations (for admin)
app.get('/reservations', (req, res) => {
    if (fs.existsSync('data.json')) {
        const file = fs.readFileSync('data.json');
        const data = JSON.parse(file);
        res.json(data);
    } else {
        res.json([]);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});


