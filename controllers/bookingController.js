const Booking = require('../models/Booking');
const User = require('../models/User');
const admin = require('firebase-admin'); // 🔥 FIREBASE IMPORT KIYA HAIN YAHAN

// ==================================================
// 1. CUSTOMER: CREATE BOOKING (Fixed or Bidding) + NOTIFICATIONS 🔔
// ==================================================
exports.createBooking = async (req, res) => {
    try {
        const { service, bookingType, address, latitude, longitude, price, items, issue } = req.body;

        // Validation
        if (!service || !address || !bookingType) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. Database mein Booking Save Karo
        const newBooking = new Booking({
            user: req.user._id,
            service,
            bookingType, // 'FIXED' or 'BIDDING'
            address,
            // YAHAN TERA FIX HAI 👇 (|| 0 add kar diya hai)
            location: { type: 'Point', coordinates: [longitude || 0, latitude || 0] }, 
            price: bookingType === 'FIXED' ? price : 0,
            items,
            issue,
            status: bookingType === 'BIDDING' ? 'bidding' : 'pending',
            startOtp: Math.floor(1000 + Math.random() * 9000).toString() // Auto Generate OTP
        });

        await newBooking.save();

        // 🔥 2. FIREBASE NOTIFICATION LOGIC 🔥
        try {
            // Aas-paas (10km) ke un providers ko dhoondo jo same category ke hain, online hain aur jinka FCM Token hai
            const nearbyProviders = await User.find({
                role: 'provider',
                category: service,
                isOnline: true,
                fcmToken: { $ne: "" }, // Token hona zaroori hai
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [longitude || 0, latitude || 0] },
                        $maxDistance: 10000 // 10km Radius
                    }
                }
            });

            const tokens = nearbyProviders.map(p => p.fcmToken).filter(token => token);

            // Agar aas-paas koi provider mila, toh sabko ek saath message bhej do
            if (tokens.length > 0) {
                const message = {
                    notification: {
                        title: `Naya Kaam Aaya Hai: ${service} 🛠️`,
                        body: `${address} se nayi request aayi hai. Jaldi check karein!`
                    },
                    tokens: tokens, 
                };

                const response = await admin.messaging().sendEachForMulticast(message);
                console.log(`🔔 Notifications sent successfully: ${response.successCount}`);
            } else {
                console.log("⚠️ Koi aas-paas ka provider nahi mila jisko notification bhej sakein.");
            }
        } catch (notifError) {
            console.error("❌ Notification bhejne mein error aaya:", notifError);
            // Agar notification fail ho jaye, toh bhi booking complete honi chahiye
        }

        res.status(201).json({ message: "Booking Created", booking: newBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// 2. CUSTOMER: GET MY BOOKINGS
// ==================================================
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('provider', 'name image phone rating')
            .populate('bids.provider', 'name image rating') // Bids dikhane ke liye
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// 3. PROVIDER: PLACE BID (For Bidding Jobs)
// ==================================================
exports.placeBid = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { bidAmount, message } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== 'bidding') {
            return res.status(400).json({ message: "Bidding is closed for this job" });
        }

        // Check if already bid
        const existingBid = booking.bids.find(b => b.provider.toString() === req.user._id.toString());
        if (existingBid) {
            return res.status(400).json({ message: "You have already placed a bid" });
        }

        booking.bids.push({
            provider: req.user._id,
            amount: bidAmount,
            message
        });
        
        await booking.save();
        res.json({ message: "Bid Placed Successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// 4. CUSTOMER: ACCEPT BID
// ==================================================
exports.acceptBid = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { selectedProviderId, finalPrice } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.provider = selectedProviderId;
        booking.price = finalPrice;
        booking.status = 'accepted';
        
        // Clear other bids (Optional, keeping history is better)
        // booking.bids = []; 

        await booking.save();
        res.json({ message: "Provider Hired Successfully!", booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// 5. PROVIDER: ACCEPT FIXED JOB (Instant)
// ==================================================
exports.acceptFixedJob = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== 'pending') return res.status(400).json({ message: "Job already taken or unavailable" });

        booking.provider = req.user._id;
        booking.status = 'accepted';

        await booking.save();
        res.json({ message: "Job Accepted!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// 6. SECURITY: VERIFY OTP (Start Work)
// ==================================================
exports.verifyOtp = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { otp } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.startOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        booking.status = 'in_progress';
        booking.startOtp = null; // Consume OTP
        await booking.save();

        res.json({ message: "OTP Verified! Work Started." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// 7. PROVIDER: UPDATE STATUS (Complete Job)
// ==================================================
exports.updateStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
        
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        res.json({ message: "Status Updated", status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// 8. CUSTOMER: SUBMIT RATING
// ==================================================
exports.submitRating = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { rating, review } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.rating = rating;
        booking.review = review;
        await booking.save();

        // Update Provider's Average Rating
        const provider = await User.findById(booking.provider);
        if (provider) {
            const totalJobs = provider.totalJobs || 0;
            const currentRating = provider.rating || 5;
            
            // Simple Average Formula
            const newRating = ((currentRating * totalJobs) + rating) / (totalJobs + 1);
            
            provider.rating = parseFloat(newRating.toFixed(1));
            provider.totalJobs = totalJobs + 1;
            await provider.save();
        }

        res.json({ message: "Rating Submitted!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};