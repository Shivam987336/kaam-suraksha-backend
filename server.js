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

// 📁 UPLOADS FOLDER CHECK (Images & Videos ke liye)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 🎥 Uploads folder ko Public banana (Taaki Flutter me Videos dikhein)
app.use('/uploads', express.static(uploadDir));

// 🕵️‍♂️ Debug Logger (Request track karne ke liye)
app.use((req, res, next) => {
    console.log(`📡 Request: ${req.method} ${req.url}`);
    next();
});

// ==========================================
// 🔗 ROUTES CONFIGURATION
// ==========================================

// 🔐 Users (Customer Login, Profile, Address) - ✅ UPDATED
// Humne authRoutes hata diya hai, ab sab userRoutes se chalega
app.use('/api/users', require('./routes/userRoutes'));

// 🛠️ Providers (Wallet, Jobs, Status, Login)
app.use('/api/providers', require('./routes/providerRoutes'));

// 📅 Services & Bookings (Bidding Logic)
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// 💬 Chat System (Messages)
app.use('/api/chat', require('./routes/chatRoutes'));

// 📹 Video Uploads (Reels/Work Proof)
app.use('/api/videos', require('./routes/videoRoutes'));

// 🏠 Root Route
app.get('/', (req, res) => {
    res.send('🚀 Kaam Suraksha Backend is Running Professionally!');
});

// ==========================================
// 🚀 SERVER START
// ==========================================
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📂 Static files available at: http://localhost:${PORT}/uploads/`);
});