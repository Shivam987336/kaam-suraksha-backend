const Booking = require('../models/Booking');

// 1. Booking Create Karna (User karega)
const createBooking = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        let { service, issue, price, providerId } = req.body; 

        // Start OTP generate kar rahe hain (Provider ko dikhane ke liye)
        const startOtp = Math.floor(1000 + Math.random() * 9000).toString();

        const booking = await Booking.create({
            user: req.user._id,        
            provider: providerId || "659c3d42f8c5c72d8e4f1a2b", // Backup ID
            service,
            issue,
            price,
            startOtp, // 👈 Save Start OTP
            status: 'pending'
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Status Update (Accept/Start/Complete Logic)
const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = status;

        // 🛠️ Agar kaam shuru (in_progress) ho raha hai, toh Completion OTP generate karo
        if (status === 'in_progress') {
            booking.endOtp = Math.floor(1000 + Math.random() * 9000).toString();
        }

        // 🛡️ Agar kaam khatam (completed) ho raha hai, toh Warranty banao
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

// 3. OTP Verification (Flutter App ke liye)
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

// 4. Submit Rating (Job khatam hone ke baad)
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

// 5. Get Warranty Details
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

// --- Purane Functions ---
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('provider', 'name phone').sort({ date: -1 });
        res.status(200).json(bookings);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ provider: req.user._id }).populate('user', 'name phone address').sort({ date: -1 });
        res.status(200).json(bookings);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// =======================================================
// 🎥 NEW VIDEO FEATURES (SHOWCASE & REELS)
// =======================================================

// A. HOME SCREEN: Sirf Top Quality Videos (Featured)
const getFeaturedVideos = async (req, res) => {
    try {
        const videos = await Booking.find({
            status: 'completed',
            providerVideo: { $ne: null }, // Video honi chahiye
            rating: { $gte: 4.5 }         // ⭐ Sirf 4.5 se upar wali (Best Work)
        })
        .select('providerVideo service rating review provider')
        .populate('provider', 'name')
        .sort({ rating: -1 }) // Highest rating pehle
        .limit(5); // Sirf top 5 dikhayenge

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching featured videos" });
    }
};

// B. REELS SCREEN: Sabki Videos (Scrollable Feed)
const getAllVideoFeed = async (req, res) => {
    try {
        const videos = await Booking.find({
            status: 'completed',
            providerVideo: { $ne: null }, // Video honi chahiye
            rating: { $gte: 3 }           // 3 Star se upar sab chalega (Providers happy rahenge)
        })
        .select('providerVideo service rating review provider date')
        .populate('provider', 'name') 
        .sort({ date: -1 }); // Nayi video sabse pehle

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching video feed" });
    }
};

module.exports = { 
    createBooking, 
    getMyBookings, 
    getProviderBookings, 
    updateJobStatus, 
    verifyOtp, 
    submitRating, 
    getWarranty,
    getFeaturedVideos, // 👈 New Export
    getAllVideoFeed    // 👈 New Export
};