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
        // itemsSummary bhi add kiya agar Flutter se string format mein aaye
        const { service, category, items, itemsSummary, issue, address, date, time, location, price } = req.body; 

        // Start OTP generate (Security)
        const startOtp = Math.floor(1000 + Math.random() * 9000).toString();

        const booking = await Booking.create({
            user: req.user._id,        
            // provider: abhi null rahega (Open Job)
            service,
            category, // e.g., "Plumber"
            items,    // List of items (Array)
            itemsSummary, // String summary (Backup)
            issue,
            address,  // 📍 Address
            scheduledDate: date, // Model mein field name scheduledDate hai
            scheduledTime: time,
            location, // Lat/Lng
            startOtp,
            price: price || 0, // Bidding/Estimate price
            status: 'pending' // Default Pending
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking Create Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================================================
// 2. PROVIDER: PENDING REQUESTS DEKHNA
// ==================================================
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
// 3. PROVIDER: JOB ACCEPT KARNA
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
        if (status === 'started' || status === 'in_progress') {
            // Agar pehle se nahi bana hai toh banao
            if (!booking.endOtp) {
                booking.endOtp = Math.floor(1000 + Math.random() * 9000).toString();
            }
        }

        // 🛡️ Kaam Khatam -> Warranty Generate
        if (status === 'completed') {
            if (!booking.warrantyId) {
                booking.warrantyId = `KS-${Math.floor(100000 + Math.random() * 900000)}`;
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 30); // 30 Days Warranty (Standard)
                booking.warrantyExpiry = expiry;
            }
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

        if (otp && otp.toString() === correctOtp.toString()) {
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
// 7. GET WARRANTY (For Flutter Warranty Screen)
// ==================================================
const getWarranty = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('provider', 'name');
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        
        // Agar completed hai par warranty nahi bani (rare case), toh abhi bana do
        if (booking.status === 'completed' && !booking.warrantyId) {
             booking.warrantyId = `KS-${Math.floor(100000 + Math.random() * 900000)}`;
             const expiry = new Date();
             expiry.setDate(expiry.getDate() + 30);
             booking.warrantyExpiry = expiry;
             await booking.save();
        }

        if (!booking.warrantyId) {
            return res.status(400).json({ message: "Warranty inactive (Job not completed)" });
        }

        res.status(200).json({
            warrantyId: booking.warrantyId,
            expiryDate: booking.warrantyExpiry ? booking.warrantyExpiry.toDateString() : "N/A",
            providerName: booking.provider ? booking.provider.name : "Expert Provider"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================================================
// 8. LISTING FUNCTIONS (My Bookings)
// ==================================================
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('provider', 'name phone image') // Image bhi chahiye profile ke liye
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
// 9. VIDEO FEATURES (SHOWCASE & REELS)
// ==================================================
// 🆕 Upload Video Function (Provider App use karega)
const uploadWorkVideo = async (req, res) => {
    try {
        const { videoUrl } = req.body; 
        
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Security check: Sirf wohi provider upload kar paye jisne kaam kiya
        if (booking.provider && booking.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to upload video for this job" });
        }

        booking.providerVideo = videoUrl;
        await booking.save();

        res.status(200).json({ message: "Video uploaded successfully!", booking });
    } catch (error) {
        res.status(500).json({ message: "Error uploading video" });
    }
};

const getFeaturedVideos = async (req, res) => {
    try {
        const videos = await Booking.find({
            status: 'completed',
            providerVideo: { $ne: null },
            rating: { $gte: 4.5 }
        })
        .select('providerVideo service rating review provider')
        .populate('provider', 'name image') // Image bhi chahiye
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
        .populate('provider', 'name image') // Provider image for Reels UI
        .sort({ createdAt: -1 });

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching video feed" });
    }
};

module.exports = { 
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
    getAllVideoFeed,
    uploadWorkVideo // 👈 Ye add kar diya
};