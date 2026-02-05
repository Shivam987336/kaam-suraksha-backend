const Booking = require('../models/Booking');
const User = require('../models/User');

// 📅 1. CREATE BOOKING (User Side)
exports.createBooking = async (req, res) => {
    try {
        const { service, bookingType, scheduleType, address, latitude, longitude, price, items, issue } = req.body;

        const newBooking = new Booking({
            user: req.user._id,
            service,
            bookingType,
            scheduleType,
            address,
            location: { type: 'Point', coordinates: [longitude, latitude] }, // GeoJSON
            price: bookingType === 'FIXED' ? price : 0, // Fixed hai to price save karo, warna 0
            items,
            issue,
            status: bookingType === 'BIDDING' ? 'bidding' : 'pending'
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking Created", booking: newBooking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📋 2. GET MY BOOKINGS (User Side)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('provider', 'name image phone rating') // Provider details
            .populate('bids.provider', 'name image rating') // Bidders details
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔨 3. PLACE BID (Provider Side)
exports.placeBid = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { bidAmount, message } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Add Bid
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

// ✅ 4. ACCEPT BID (User Side)
exports.acceptBid = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { selectedProviderId, finalPrice } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.provider = selectedProviderId;
        booking.price = finalPrice;
        booking.status = 'accepted';
        booking.otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

        await booking.save();
        res.json({ message: "Provider Hired!", booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 👷 5. ACCEPT FIXED JOB (Provider Side)
exports.acceptFixedJob = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ message: "Job not found" });
        if (booking.status !== 'pending') return res.status(400).json({ message: "Job already taken" });

        booking.provider = req.user._id;
        booking.status = 'accepted';
        booking.otp = Math.floor(1000 + Math.random() * 9000).toString();

        await booking.save();
        res.json({ message: "Job Accepted!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔄 6. UPDATE STATUS (Start/Complete)
exports.updateStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body; // 'in_progress' or 'completed'

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = status;
        await booking.save();

        // Agar Complete hua hai, to Provider ke wallet me paisa add karo (Optional logic)
        if (status === 'completed') {
             // Wallet logic future me providerController me handle hoga
        }

        res.json({ message: "Status Updated", status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};