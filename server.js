const express = require('express');
const cors = require('cors'); // ✅ CORS hai
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path'); 

// Environment Variables Load
dotenv.config();

// Database Connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🛠️ MIDDLEWARE
// ==========================================
app.use(cors()); // ✅ Isse Laptop/Mobile connect honge
app.use(express.json());

// 🎥 Uploads folder Public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🕵️‍♂️ Debug Logger
app.use((req, res, next) => {
    console.log(`\n📡 Request: ${req.method} ${req.url}`);
    next();
});

// ==========================================
// 🔗 REAL ROUTES CONNECTIONS
// ==========================================

// 👇 1. AUTH ROUTE (YAHAN CHANGE KIYA HAI) ✅
// Humne 'authRoutes' ki jagah 'providerRoutes' link kar diya
// Kyunki tune code usi file mein likha hai.
app.use('/api/auth', require('./routes/providerRoutes')); 

// 2. Users 
app.use('/api/users', require('./routes/userRoutes'));

// 3. Providers 
app.use('/api/providers', require('./routes/providerRoutes'));

// 4. Services 
app.use('/api/services', require('./routes/serviceRoutes'));

// 5. Bookings
app.use('/api/bookings', require('./routes/bookingRoutes'));


// 🏠 Root Route 
app.get('/', (req, res) => {
    res.send('🚀 Kaam Suraksha Backend is Running Professionally!');
});

// ==========================================
// 🚀 SERVER START
// ==========================================
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`✅ Server running on port ${PORT}`);
});