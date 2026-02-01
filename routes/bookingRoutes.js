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
    getProviderBookings, 
    acceptJob,
    updateJobStatus, 
    verifyOtp,       
    submitRating, 
    getWarranty,
    getFeaturedVideos, 
    getAllVideoFeed    
} = require('../controllers/bookingController');

// Middleware
const { protect } = require('../middleware/authMiddleware'); // Path check kar lena

// =============================================
// 🎥 VIDEO UPLOAD SETUP (MULTER)
// =============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Uploads folder mein save hoga
    },
    filename: (req, file, cb) => {
        // Unique filename: fieldname-date.mp4
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50000000 } // Limit: 50MB Video
});

// =========================================================
// 🚀 MAIN ROUTES
// =========================================================

// 1. CREATE & GET BOOKINGS
router.post('/', protect, createBooking);      
router.get('/my-bookings', protect, getMyBookings); 

// 2. PROVIDER SPECIFIC ROUTES (Paths Fixed ✅)
router.get('/provider/requests', protect, getProviderRequests); // Pending Jobs
router.get('/provider/accepted', protect, getProviderBookings); // My Jobs

// 3. JOB ACTIONS
router.put('/:id/accept', protect, acceptJob);       
router.put('/:id/status', protect, updateJobStatus); 

// 4. SECURITY (OTP)
router.post('/:id/verify-otp', protect, verifyOtp);  

// 5. EXTRAS (Rating & Warranty)
router.put('/:id/rate', protect, submitRating); // PUT method better for update
router.get('/warranty/:id', protect, getWarranty);

// =============================================
// 📹 PUBLIC VIDEO ROUTES (Reels)
// =============================================
router.get('/videos/featured', getFeaturedVideos); 
router.get('/videos/feed', getAllVideoFeed);

// =============================================
// 📊 PROVIDER STATS (Dashboard Logic)
// =============================================
router.get('/provider/stats', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ 
            provider: req.user._id, 
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
            if (b.providerVideo) {
                workGallery.push({
                    video: b.providerVideo,
                    rating: b.rating || 0,
                    review: b.review || "No Review",
                    customer: b.user ? b.user.name : "Customer",
                    date: b.createdAt
                });
            }
        });

        const avgRating = ratedBookings > 0 ? (totalRating / ratedBookings).toFixed(1) : "0.0";

        res.json({
            totalJobs: bookings.length,
            averageRating: avgRating,
            totalReviews: ratedBookings,
            gallery: workGallery.reverse()
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).send('Server Error');
    }
});

// =============================================
// 📤 VIDEO UPLOAD ROUTE (Local Storage)
// =============================================
router.post('/:id/upload-video', protect, upload.single('video'), async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        // Render/Server ka URL generate kar rahe hain
        const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; 
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.providerVideo = videoUrl;
        await booking.save();
        
        res.json({ success: true, message: "Work Video Uploaded!", videoUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Video Upload Failed", error: error.message });
    }
});

module.exports = router;