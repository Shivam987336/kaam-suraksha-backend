const express = require('express');
const router = express.Router();

// Controller se saare functions import kiye (Address wale bhi)
const { 
    sendOtp, 
    verifyOtp, 
    getUserProfile, 
    updateUserProfile,
    addAddress,     // 👈 Ye Naya Hai
    deleteAddress   // 👈 Ye Bhi Naya Hai
} = require('../controllers/userController');

// Middleware (Guard) import kiya
const { protect } = require('../middleware/authMiddleware');

// 👉 Public Routes (Sabke liye khula)
router.post('/send-otp', sendOtp);
router.post('/login-otp', verifyOtp);

// 🔒 Protected Routes (Token chahiye)
router.get('/profile', protect, getUserProfile); // Profile Dekho
router.put('/profile', protect, updateUserProfile); // Profile Badlo

// 🏠 Address Routes (Ye Naye Hain)
router.post('/address', protect, addAddress);       // Address Save karo
router.delete('/address/:id', protect, deleteAddress); // Address Delete karo

module.exports = router;