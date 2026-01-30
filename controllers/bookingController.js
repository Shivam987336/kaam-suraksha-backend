const Booking = require('../models/Booking');

// ==================================================
// 1. CUSTOMER: BOOKING CREATE KARNA
// ==================================================
const createBooking = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // ✅ Frontend se naya data receive kar rahe hain
        const { service, category, items, issue, address, date, time, location } = req.body; 

        // Start OTP generate (Security)
        const startOtp = Math.floor(1000 + Math.random() * 9000).toString();

        const booking = await Booking.create({
            user: req.user._id,        
            // provider: abhi null rahega (Open Job)
            service,
            category, // e.g., "Plumber" (Zaroori hai filtering ke liye)
            items,    // List of items (Split AC x2)
            issue,
            address,  // 📍 Address Zaroori hai
            date,
            time,
            location, // Lat/Lng for Map
            startOtp,
            status: 'pending' // Default Pending
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking Create Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================================================
// 2. PROVIDER: PENDING REQUESTS DEKHNA (NEW ✅)
// ==================================================
// Ye function Provider ko wo jobs dikhayega jo 'pending' hain aur uski category ki hain
const getProviderRequests = async (req, res) => {
    try {
        const providerCategory = req.user.category; // Provider ki category (e.g. Plumber)

        const requests = await Booking.find({
            status: 'pending',        // Jo abhi tak accept nahi hui
            category: providerCategory // Sirf uski category ki jobs
        })
        .populate('user', 'name address phone') // User details dikhao
        .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================================================
// 3. PROVIDER: JOB ACCEPT KARNA (NEW ✅)
// ==================================================
const acceptJob = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== 'pending') return res.status(400).json({ message: "Job already taken" });

        // Assign Provider & Update Status
        booking.provider = req.user._id;
        booking.status = 'accepted';
        
        await booking.save();
        res.status(200).json({ message: "Job Accepted!", booking });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================================================
// 4. STATUS UPDATE (Start / Complete Logic)
// ==================================================
const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = status;

        // 🛠️ Kaam Shuru -> End OTP Generate
        if (status === 'started') {
            booking.endOtp = Math.floor(1000 + Math.random() * 9000).toString();
        }

        // 🛡️ Kaam Khatam -> Warranty Generate
        if (status === 'completed') {
            booking.warrantyId = `KS-${Math.floor(100000 + Math.random() * 900000)}`;
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 7); // 7 Days Warranty
            booking.warrantyExpiry = expiry;
        }

        await booking.save();
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
};

// ==================================================
// 5. OTP VERIFICATION
// ==================================================
const verifyOtp = async (req, res) => {
    try {
        const { otp, type } = req.body; // type: 'start' or 'end'
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const correctOtp = type === 'start' ? booking.startOtp : booking.endOtp;

        if (otp === correctOtp) {
            res.status(200).json({ success: true, message: "OTP Verified!" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================================================
// 6. RATING & FEEDBACK
// ==================================================
const submitRating = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { rating, review }, 
            { new: true }
        );
        res.status(200).json({ message: "Feedback saved!", booking });
    } catch (error) {
        res.status(500).json({ message: 'Error saving rating' });
    }
};

// ==================================================
// 7. GET WARRANTY
// ==================================================
const getWarranty = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('provider', 'name');
        if (!booking || !booking.warrantyId) {
            return res.status(404).json({ message: "Warranty not found" });
        }
        res.status(200).json({
            warrantyId: booking.warrantyId,
            expiryDate: booking.warrantyExpiry.toDateString(),
            providerName: booking.provider.name
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================================================
// 8. LISTING FUNCTIONS (My Bookings)
// ==================================================
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('provider', 'name phone')
            .sort({ createdAt: -1 }); // Newest first
        res.status(200).json(bookings);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// Provider ke 'Accepted' jobs
const getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ provider: req.user._id })
            .populate('user', 'name phone address')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// ==================================================
// 🎥 VIDEO FEATURES (SHOWCASE & REELS)
// ==================================================
const getFeaturedVideos = async (req, res) => {
    try {
        const videos = await Booking.find({
            status: 'completed',
            providerVideo: { $ne: null },
            rating: { $gte: 4.5 }
        })
        .select('providerVideo service rating review provider')
        .populate('provider', 'name')
        .sort({ rating: -1 })
        .limit(5);

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching featured videos" });
    }
};

const getAllVideoFeed = async (req, res) => {
    try {
        const videos = await Booking.find({
            status: 'completed',
            providerVideo: { $ne: null },
            rating: { $gte: 3 }
        })
        .select('providerVideo service rating review provider date')
        .populate('provider', 'name') 
        .sort({ createdAt: -1 });

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching video feed" });
    }
};

module.exports = { 
    createBooking, 
    getMyBookings, 
    getProviderRequests, // 👈 New: Pending Jobs
    getProviderBookings, // 👈 Existing: Accepted Jobs
    acceptJob,           // 👈 New: Accept Logic
    updateJobStatus, 
    verifyOtp, 
    submitRating, 
    getWarranty,
    getFeaturedVideos,
    getAllVideoFeed
};