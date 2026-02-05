const User = require('../models/User'); // ✅ Provider model hata diya, User use karenge
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// 🔐 Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// 1. PROVIDER LOGIN / REGISTER (OTP VERIFY)
// ==========================================
exports.verifyProviderOtp = async (req, res) => {
    const { phone } = req.body;
    try {
        // 1. User dhoondo (Role check zaroori hai)
        let user = await User.findOne({ phone });

        if (!user) {
            console.log("👷 New Provider Creating...");
            user = await User.create({
                phone,
                name: "New Mistri",
                role: "provider", // ✅ Role set kiya
                category: "Unassigned",
                isOnline: true,
                location: { type: 'Point', coordinates: [0, 0] } // Default location
            });
        } else {
            // Agar pehle se user hai par provider nahi hai
            if (user.role !== 'provider') {
                return res.status(400).json({ message: "This number is registered as a Customer." });
            }
        }

        res.json({
            _id: user.id,
            name: user.name,
            phone: user.phone,
            category: user.category,
            role: user.role,
            token: generateToken(user.id),
            isNewUser: user.category === "Unassigned",
            isOnline: user.isOnline
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 2. DASHBOARD: GET NEARBY JOBS (Request Tab)
// ==========================================
exports.getProviderJobs = async (req, res) => {
    try {
        const provider = await User.findById(req.user._id);
        
        // Provider ki Location
        const coordinates = provider.location.coordinates;
        // Agar location set nahi hai toh empty list bhejo
        if (coordinates[0] === 0 && coordinates[1] === 0) {
            return res.json([]); 
        }

        // 🔍 Logic: 
        // 1. Pending (Fixed) ya Bidding wali jobs
        // 2. 10km radius ke andar
        const jobs = await Booking.find({
            status: { $in: ['pending', 'bidding'] },
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: coordinates },
                    $maxDistance: 10000 // 10,000 meters = 10km
                }
            }
        }).populate('user', 'name address phone image');

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// 3. DASHBOARD: STATS & WALLET
// ==========================================
exports.getProviderStats = async (req, res) => {
    try {
        const provider = await User.findById(req.user._id);
        
        // Completed Jobs count karo
        const completedJobs = await Booking.countDocuments({ 
            provider: req.user._id, 
            status: 'completed' 
        });

        res.json({
            walletBalance: provider.walletBalance || 0,
            totalEarnings: provider.totalEarnings || 0,
            totalJobs: completedJobs,
            rating: provider.rating || 5.0,
            isOnline: provider.isOnline,
            category: provider.category
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// 4. WALLET: WITHDRAW MONEY
// ==========================================
exports.withdrawMoney = async (req, res) => {
    try {
        const { amount } = req.body;
        const provider = await User.findById(req.user._id);

        if (provider.walletBalance < amount) {
            return res.status(400).json({ message: "Insufficient Wallet Balance" });
        }

        // Deduct Money
        provider.walletBalance -= amount;
        
        // Transaction History logic yahan add kar sakte ho future mein
        
        await provider.save();

        res.json({ 
            message: "Withdrawal Successful", 
            success: true,
            newBalance: provider.walletBalance 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// 5. PROFILE: UPDATE DETAILS (Category/Rate)
// ==========================================
exports.updateProviderProfile = async (req, res) => {
    try {
        const provider = await User.findById(req.user._id);

        if (provider) {
            provider.name = req.body.name || provider.name;
            provider.category = req.body.category || provider.category;
            
            // Location Update (GeoJSON)
            if (req.body.latitude && req.body.longitude) {
                provider.location = {
                    type: 'Point',
                    coordinates: [req.body.longitude, req.body.latitude]
                };
            }

            const updatedProvider = await provider.save();
            res.json(updatedProvider);
        } else {
            res.status(404).json({ message: 'Provider not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Update Failed' });
    }
};

// ==========================================
// 6. TOGGLE ONLINE/OFFLINE
// ==========================================
exports.toggleStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        await User.findByIdAndUpdate(req.user._id, { isOnline });
        res.json({ success: true, isOnline });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};