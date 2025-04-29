const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// GET /reservations - returns reservation data from data.json
app.get('/reservations', (req, res) => {
    if (fs.existsSync('data.json')) {
        const file = fs.readFileSync('data.json');
        const data = JSON.parse(file);
        res.json(data);
    } else {
        res.json([]);
    }
});

// Use the dynamic port from Render or fallback to 8080 locally
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
