const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Booking = require('../models/Booking'); 

// 👇 Controller functions import
const { 
    createBooking,
    getMyBookings,
    getProviderRequests,
    getProviderBookings, // Accepted Jobs
    acceptJob,
    updateJobStatus, 
    verifyOtp,       
    submitRating, 
    getWarranty,
    getFeaturedVideos, 
    getAllVideoFeed    
} = require('../controllers/bookingController');

// Middleware
const { protect } = require('../middleware/authMiddleware');

// =============================================
// 🎥 VIDEO UPLOAD SETUP (MULTER)
// =============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });


// =========================================================
// 🚀 MAIN ROUTES (Linked to Controller)
// =========================================================

// 1. CREATE & GET BOOKINGS
router.post('/', protect, createBooking);      // ✅ User creates booking (OTP Auto-generated)
router.get('/my-bookings', protect, getMyBookings); // ✅ User sees history

// 2. PROVIDER SPECIFIC ROUTES
router.get('/provider-requests', protect, getProviderRequests); // ✅ New Jobs (Pending)
router.get('/provider-bookings', protect, getProviderBookings); // ✅ My Jobs (Accepted)

// 3. JOB ACTIONS
router.put('/:id/accept', protect, acceptJob);       // ✅ Accept Job
router.put('/:id/status', protect, updateJobStatus); // ✅ Start/Complete Job

// 4. SECURITY (OTP)
router.post('/:id/verify-otp', protect, verifyOtp);  // ✅ Verify OTP

// 5. EXTRAS (Rating & Warranty)
router.post('/:id/rate', protect, submitRating);
router.get('/warranty/:id', protect, getWarranty);


// =============================================
// 📹 PUBLIC VIDEO ROUTES
// =============================================
router.get('/featured-videos', getFeaturedVideos); 
router.get('/video-feed', getAllVideoFeed);


// =============================================
// 📊 PROVIDER STATS (Inline Logic for Dashboard)
// =============================================
router.get('/provider-stats', protect, async (req, res) => {
    try {
        // Sirf Completed Jobs uthao
        const bookings = await Booking.find({ 
            provider: req.user.id, 
            status: 'completed' 
        }).populate('user', 'name');

        let totalRating = 0;
        let ratedBookings = 0;
        let workGallery = [];

        bookings.forEach(b => {
            if (b.rating > 0) {
                totalRating += b.rating;
                ratedBookings++;
            }
            // Agar video hai to gallery mein dalo
            if (b.providerVideo) {
                workGallery.push({
                    video: b.providerVideo,
                    rating: b.rating || 0,
                    review: b.review || "No Review",
                    customer: b.user ? b.user.name : "Customer",
                    date: b.date
                });
            }
        });

        const avgRating = ratedBookings > 0 ? (totalRating / ratedBookings).toFixed(1) : "0.0";

        res.json({
            totalJobs: bookings.length,
            averageRating: avgRating,
            totalReviews: ratedBookings,
            gallery: workGallery.reverse() // Latest pehle
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).send('Server Error');
    }
});


// =============================================
// 📤 VIDEO UPLOAD ROUTE
// =============================================
router.post('/:id/upload-video', protect, upload.single('video'), async (req, res) => {
    try {
        const bookingId = req.params.id;
        // Server URL create karo
        const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; 
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.providerVideo = videoUrl;
        
        await booking.save();
        res.json({ success: true, message: "Work Video Uploaded Successfully!", videoUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Video Upload Failed", error: error.message });
    }
});

module.exports = router;