const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// 🛠️ MULTER CONFIGURATION (File Storage Logic)
// ==========================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 'uploads' folder mein save karega
    },
    filename: function (req, file, cb) {
        // Unique File Name: video-bookingId-timestamp.mp4
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter (Sirf Video allow karein)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB
    fileFilter: fileFilter
});

// ==========================================
// 📹 1. UPLOAD WORK VIDEO
// API: POST /api/videos/upload/:bookingId
// Body: Form-Data (Key: 'video')
// ==========================================
router.post('/upload/:bookingId', authMiddleware, upload.single('video'), async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No video file uploaded" });
        }

        // URL Generate karo (Local Server ke liye)
        // Production mein yahan S3/Cloudinary ka URL aayega
        const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Database Update karo (Booking Model mein 'providerVideo' field)
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Booking model mein naya field update
        booking.providerVideo = videoUrl;
        await booking.save();

        res.status(200).json({ 
            message: "Video uploaded successfully", 
            url: videoUrl 
        });

    } catch (error) {
        console.error("Video Upload Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ==========================================
// 🎬 2. GET FEATURED VIDEOS (Home Screen)
// API: GET /api/videos/featured
// ==========================================
router.get('/featured', async (req, res) => {
    // Abhi ke liye Dummy Data bhej rahe hain
    // Future mein Database se fetch kar sakte ho
    res.json([
        {
            id: '1',
            thumbnail: 'https://img.freepik.com/free-psd/plumbing-service-banner-template_23-2148563574.jpg',
            title: 'Expert Plumbers in Action',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
        },
        {
            id: '2',
            thumbnail: 'https://img.freepik.com/free-vector/electrician-service-banner_23-2148559663.jpg',
            title: 'Safe Electrical Wiring Tips',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4'
        }
    ]);
});

// ==========================================
// 📺 3. GET ALL VIDEO FEED
// API: GET /api/videos/all
// ==========================================
router.get('/all', async (req, res) => {
    try {
        // Woh bookings dhoondo jahan video upload hui hai
        const bookingsWithVideo = await Booking.find({ providerVideo: { $exists: true, $ne: null } })
                                               .select('service providerVideo rating review')
                                               .populate('provider', 'name image');

        res.json(bookingsWithVideo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;