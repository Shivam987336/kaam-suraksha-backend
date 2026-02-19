const express = require('express');
const router = express.Router();

// 👇 Controller functions import 
const { 
    verifyProviderOtp,      // Login & Register both handled here
    getProviderJobs,        // Dashboard Jobs (Nearby)
    getProviderStats,       // Wallet Balance & Earnings
    withdrawMoney,          // Withdraw Request
    updateProviderProfile,  // Edit Profile
    toggleStatus            // Online/Offline Switch
} = require('../controllers/providerController');

// 🛠️ YAHAN THI GALTI: Maine Object mein se function nikal liya hai
// Agar tere middleware me function ka naam 'verifyToken' hai, toh 'protect' ki jagah wo likh dena.
const { protect } = require('../middleware/authMiddleware'); 

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
// ✅ FIX: authMiddleware ki jagah protect laga diya
router.get('/jobs', protect, getProviderJobs);

// Get Wallet Balance & Stats
// API: GET /api/providers/stats
router.get('/stats', protect, getProviderStats);
router.get('/wallet', protect, getProviderStats); // Alias route


// ==========================================
// 💰 WALLET ACTIONS
// ==========================================

// Withdraw Money
// API: POST /api/providers/withdraw
router.post('/withdraw', protect, withdrawMoney);


// ==========================================
// ⚙️ PROFILE & SETTINGS
// ==========================================

// Toggle Online/Offline
// API: PUT /api/providers/status
router.put('/status', protect, toggleStatus);

// Update Profile (Category, Rate, Location)
// API: PUT /api/providers/update
router.put('/update', protect, updateProviderProfile);

module.exports = router;