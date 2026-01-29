const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Booking = require('../models/Booking'); // Database Model
const { protect } = require('../middleware/authMiddleware'); // Auth Check

// 👇 Controller imports
const { 
    getProviderBookings,
    updateJobStatus, 
    verifyOtp,       
    submitRating, 
    getWarranty,
    getFeaturedVideos, 
    getAllVideoFeed    
} = require('../controllers/bookingController');

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

// =============================================
// 🏠 PUBLIC ROUTES
// =============================================
router.get('/featured-videos', getFeaturedVideos); 
router.get('/video-feed', getAllVideoFeed);

// =========================================================
// 🚀 MAIN BIDDING & BOOKING ROUTES
// =========================================================

// 1. GET ALL BOOKINGS
router.get('/', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
                                      .populate('provider', 'name image rating') 
                                      .sort({ date: -1 }); 
        res.json(bookings);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// 2. CREATE NEW BOOKING (✅ FIXED: Status lowercase kar diya)
router.post('/', protect, async (req, res) => {
    try {
        const { service, issue, price, providerId, address, itemsSummary, date, time } = req.body;

        // 🛠️ FIX: String ko Array mein convert
        let formattedItems = [];
        if (itemsSummary) {
            formattedItems.push({
                title: itemsSummary, 
                qty: 1               
            });
        }

        const newBooking = new Booking({
            user: req.user.id,
            service,
            issue,
            price, 
            provider: providerId || null, 
            address,      
            items: formattedItems, 
            scheduledDate: date,
            scheduledTime: time,
            // 👇 MAIN FIX: 'Pending' -> 'pending', 'Bidding' -> 'bidding'
            status: providerId ? 'pending' : 'bidding' 
        });

        const booking = await newBooking.save();
        res.status(201).json(booking);
    } catch (err) {
        console.error("Create Booking Error:", err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// 3. UPDATE BOOKING
router.put('/:id', protect, async (req, res) => {
    try {
        const { providerId, price, status } = req.body;

        let booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        // Update details
        booking.provider = providerId; 
        booking.price = price;        
        booking.status = status || 'accepted'; 

        await booking.save(); 
        res.json(booking); 

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// =============================================
// 🛠️ OTHER FEATURES
// =============================================

router.post('/:id/rate', protect, submitRating);
router.get('/warranty/:id', protect, getWarranty);

// Provider Specific
router.get('/provider-requests', protect, getProviderBookings);
router.put('/:id/status', protect, updateJobStatus); 
router.post('/:id/verify-otp', protect, verifyOtp);

// 👇 PROVIDER DASHBOARD STATS
router.get('/provider-stats', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ 
            provider: req.user.id, 
            status: 'completed' 
        }).populate('user', 'name image');

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
                    date: b.date
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

// 👇 UPLOAD VIDEO ROUTE
router.post('/:id/upload-video', protect, upload.single('video'), async (req, res) => {
    try {
        const bookingId = req.params.id;
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