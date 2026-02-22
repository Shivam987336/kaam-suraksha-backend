const express = require('express');
const router = express.Router();

// 👇 Controller functions
const { 
    sendOtp, 
    verifyOtp, 
    getUserProfile, 
    updateUserProfile,
    addAddress,
    deleteAddress
} = require('../controllers/userController');

// 👇 Middleware (Login Protection)
const { protect } = require('../middleware/authMiddleware');


// ==========================================
// 🔐 AUTH ROUTES
// ==========================================

// 📌 Send OTP
// POST /api/users/send-otp
router.post('/send-otp', sendOtp);

// 📌 Verify OTP (Login)
// POST /api/users/verify-otp
router.post('/verify-otp', verifyOtp);


// ==========================================
// 👤 PROFILE ROUTES
// ==========================================

// 📌 Get My Profile
// GET /api/users/me
router.get('/me', protect, getUserProfile);

// 📌 Update Profile
// PUT /api/users/update
router.put('/update', protect, updateUserProfile);


// ==========================================
// 🏠 ADDRESS ROUTES
// ==========================================

// 📌 Add Address
// POST /api/users/address/add
router.post('/address/add', protect, addAddress);

// 📌 Delete Address
// DELETE /api/users/address/:id
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;