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

const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// 🏠 CUSTOMER (USER) ROUTES
// ==========================================

// 1. Create New Job (Fixed or Bidding)
router.post('/create', authMiddleware, createBooking);

// 2. Get My Booking History
router.get('/my-bookings', authMiddleware, getMyBookings);

// 3. Accept a Bid (For Bidding Jobs)
router.put('/accept-bid/:bookingId', authMiddleware, acceptBid);

// 4. Rate Provider (After Job Completion)
router.put('/rate/:bookingId', authMiddleware, submitRating);


// ==========================================
// 🛠️ PROVIDER (MISTRI) ROUTES
// ==========================================

// 5. Place a Bid (For Bidding Jobs)
router.post('/bid/:bookingId', authMiddleware, placeBid);

// 6. Accept Fixed Job (Instant Booking)
router.put('/accept/:bookingId', authMiddleware, acceptFixedJob);

// 7. Update Job Status (Start Work / In Progress)
router.put('/status/:bookingId', authMiddleware, updateStatus);

// 8. Verify OTP (To Start Job securely)
router.post('/verify-otp/:bookingId', authMiddleware, verifyOtp);

// 9. Mark Job as Completed
router.put('/complete/:bookingId', authMiddleware, (req, res, next) => {
    req.body.status = 'completed'; // Force status to completed
    updateStatus(req, res, next);
});

module.exports = router;