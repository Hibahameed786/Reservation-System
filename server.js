
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser'); // From HEAD
const nodemailer = require('nodemailer'); // From HEAD

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));


// Middleware
app.use(bodyParser.json()); // From HEAD

// Constants
const MAX_RESERVATIONS = 60;
const allowedTimes = ['18:00', '20:00']; // 6PM and 8PM

// Email configuration (from HEAD)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '25991@yenepoya.edu.in',
        pass: 'dzqjzrhxpfnblswm'
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// GET /reservations - returns reservation data from data.json

app.get('/reservations', (req, res) => {
    const reservations = fs.existsSync('data.json')
        ? JSON.parse(fs.readFileSync('data.json'))
        : [];
    res.json(reservations);
});


// Get available slots (from HEAD)
app.get('/available', (req, res) => {
    const reservations = fs.existsSync('data.json')
        ? JSON.parse(fs.readFileSync('data.json'))
        : [];

    const upcomingSlots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysChecked = 0;
    while (upcomingSlots.length < 3 && daysChecked < 31) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + daysChecked);
        const yyyyMMdd = currentDate.toISOString().split('T')[0];

        for (let time of allowedTimes) {
            const isBooked = reservations.some(r => r.date === yyyyMMdd && r.time === time);
            if (!isBooked && upcomingSlots.length < 3) {
                upcomingSlots.push({ date: yyyyMMdd, time });
            }
        }
        daysChecked++;
    }

    const remaining = MAX_RESERVATIONS - reservations.length;
    res.json({ availableSlots: upcomingSlots, remaining });
});

// Make a reservation (from HEAD)
app.post('/reserve', (req, res) => {
    const { name, email, date, time } = req.body;

    if (!allowedTimes.includes(time)) {
        return res.status(400).json({ message: 'Invalid time slot. Only 6PM or 8PM allowed.' });
    }

    const reservations = fs.existsSync('data.json')
        ? JSON.parse(fs.readFileSync('data.json'))
        : [];

    if (reservations.length >= MAX_RESERVATIONS) {
        return res.status(400).json({ message: 'All slots are booked for the month.' });
    }

    const alreadyBooked = reservations.some(r => r.date === date && r.time === time);
    if (alreadyBooked) {
        return res.status(400).json({ message: 'This slot is already booked. Please choose another.' });
    }

    reservations.push({ name, email, date, time });
    fs.writeFileSync('data.json', JSON.stringify(reservations, null, 2));

    // Send confirmation email (from HEAD)
    const formattedTime = time === '18:00' ? '6:00 PM - 7:00 PM' : '8:00 PM - 9:00 PM';
    const mailOptions = {
        from: '25991@yenepoya.edu.in',
        to: email,
        subject: 'Reservation Confirmation',
        text: `Dear ${name},\n\nYour reservation is confirmed for ${date} at ${formattedTime}.\n\nThank you!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Mail Error:', error);
            return res.status(500).json({ message: 'Reservation saved, but confirmation email failed to send.' });
        } else {
            console.log('Email sent:', info.response);
            return res.json({ message: 'Reservation successful! Confirmation email sent.' });
        }
    });
});

// Start server (from Commit bfcc84f)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

