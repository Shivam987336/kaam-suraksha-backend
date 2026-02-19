const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getMyBookings, 
    placeBid, 
    acceptBid, 
    acceptFixedJob, 
    updateStatus,
    verifyOtp,      // ✅ Added back
    submitRating    // ✅ Added back
} = require('../controllers/bookingController');

// 🛠️ YAHAN THI GALTI: Object mein se 'protect' function nikal liya
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🏠 CUSTOMER (USER) ROUTES
// ==========================================

// 1. Create New Job (Fixed or Bidding)
// ✅ FIX: authMiddleware ki jagah protect laga diya
router.post('/create', protect, createBooking);

// 2. Get My Booking History
router.get('/my-bookings', protect, getMyBookings);

// 3. Accept a Bid (For Bidding Jobs)
router.put('/accept-bid/:bookingId', protect, acceptBid);

// 4. Rate Provider (After Job Completion)
router.put('/rate/:bookingId', protect, submitRating);


// ==========================================
// 🛠️ PROVIDER (MISTRI) ROUTES
// ==========================================

// 5. Place a Bid (For Bidding Jobs)
router.post('/bid/:bookingId', protect, placeBid);

// 6. Accept Fixed Job (Instant Booking)
router.put('/accept/:bookingId', protect, acceptFixedJob);

// 7. Update Job Status (Start Work / In Progress)
router.put('/status/:bookingId', protect, updateStatus);

// 8. Verify OTP (To Start Job securely)
router.post('/verify-otp/:bookingId', protect, verifyOtp);

// 9. Mark Job as Completed
router.put('/complete/:bookingId', protect, (req, res, next) => {
    req.body.status = 'completed'; // Force status to completed
    updateStatus(req, res, next);
});

module.exports = router;