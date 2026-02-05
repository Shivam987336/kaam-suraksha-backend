const express = require('express');
const router = express.Router();

// 👇 Controller functions import (Jo humne pichle step mein banaye the)
const { 
    verifyProviderOtp,      // Login & Register both handled here
    getProviderJobs,        // Dashboard Jobs (Nearby)
    getProviderStats,       // Wallet Balance & Earnings
    withdrawMoney,          // Withdraw Request
    updateProviderProfile,  // Edit Profile
    toggleStatus            // Online/Offline Switch
} = require('../controllers/providerController');

// 👇 Middleware (Login check karne ke liye)
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// 🔐 AUTH ROUTES
// ==========================================

// Login / Register (OTP Based)
// API: POST /api/providers/login
router.post('/login', verifyProviderOtp);


// ==========================================
// 🛠️ DASHBOARD & JOBS ROUTES
// ==========================================

// Get Nearby Jobs (Pending & Bidding)
// API: GET /api/providers/jobs
router.get('/jobs', authMiddleware, getProviderJobs);

// Get Wallet Balance & Stats
// API: GET /api/providers/stats
router.get('/stats', authMiddleware, getProviderStats);
router.get('/wallet', authMiddleware, getProviderStats); // Alias route


// ==========================================
// 💰 WALLET ACTIONS
// ==========================================

// Withdraw Money
// API: POST /api/providers/withdraw
router.post('/withdraw', authMiddleware, withdrawMoney);


// ==========================================
// ⚙️ PROFILE & SETTINGS
// ==========================================

// Toggle Online/Offline
// API: PUT /api/providers/status
router.put('/status', authMiddleware, toggleStatus);

// Update Profile (Category, Rate, Location)
// API: PUT /api/providers/update
router.put('/update', authMiddleware, updateProviderProfile);

module.exports = router;