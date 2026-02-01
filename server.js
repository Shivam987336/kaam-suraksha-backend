const express = require('express');
const cors = require('cors'); 
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path'); 
const fs = require('fs');

// 1. Environment Variables Load
dotenv.config();

// 2. Database Connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🛠️ MIDDLEWARE
// ==========================================
app.use(cors()); // Flutter/Mobile connectivity ke liye
app.use(express.json()); // JSON data handle karne ke liye

// 📁 UPLOADS FOLDER CHECK (Agar folder nahi hai to bana dega)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 🎥 Uploads folder ko Public banana (Taaki Flutter me Videos dikhein)
app.use('/uploads', express.static(uploadDir));

// 🕵️‍♂️ Debug Logger (Taki terminal me request dikhe)
app.use((req, res, next) => {
    console.log(`📡 Request: ${req.method} ${req.url}`);
    next();
});

// ==========================================
// 🔗 ROUTES CONFIGURATION
// ==========================================

// Auth & Users
app.use('/api/auth', require('./routes/providerRoutes')); 
app.use('/api/users', require('./routes/userRoutes'));

// Providers
app.use('/api/providers', require('./routes/providerRoutes'));

// Services & Bookings
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// 🏠 Root Route
app.get('/', (req, res) => {
    res.send('🚀 Kaam Suraksha Backend is Running Professionally!');
});

// ==========================================
// 🚀 SERVER START
// ==========================================
// '0.0.0.0' zaroori hai Render/Cloud deployment ke liye
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📂 Static files available at: http://localhost:${PORT}/uploads/`);
});