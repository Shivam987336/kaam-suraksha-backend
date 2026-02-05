const express = require('express');
const router = express.Router();

// 👇 Controller se functions import
const { 
    sendOtp, 
    verifyOtp, 
    getUserProfile, 
    updateUserProfile,
    addAddress,     // ✅ Address Add
    deleteAddress   // ✅ Address Delete
} = require('../controllers/userController');

// 👇 Middleware (Login Check)
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🔐 AUTH ROUTES (Login/Signup)
// ==========================================
// API: POST /api/users/send-otp
router.post('/send-otp', sendOtp);

// API: POST /api/users/login
router.post('/login', verifyOtp);


// ==========================================
// 👤 PROFILE ROUTES
// ==========================================
// API: GET /api/users/me  (Apni Profile Dekho)
router.get('/me', protect, getUserProfile);

// API: PUT /api/users/update (Profile Update)
router.put('/update', protect, updateUserProfile);


// ==========================================
// 🏠 ADDRESS ROUTES
// ==========================================
// API: POST /api/users/address/add
router.post('/address/add', protect, addAddress);

// API: DELETE /api/users/address/:id
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;