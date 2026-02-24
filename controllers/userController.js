const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔐 Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// 1️⃣ SEND OTP (Only for compatibility)
// ==========================================
const sendOtp = async (req, res) => {
    return res.status(200).json({
        message: "OTP handled by Firebase",
        error: false
    });
};

// ==========================================
// 2️⃣ VERIFY OTP & LOGIN (Firebase Based)
// ==========================================
const verifyOtp = async (req, res) => {
    const { phone } = req.body;

    console.log(`🚀 LOGIN HIT: Phone ${phone}`);

    try {
        // 🛡️ Security Fix: Check if phone exists and is a string
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({
                message: "Valid Phone number required",
                error: true
            });
        }

        let user = await User.findOne({ phone });

        // 👤 Create new user if not exists
        if (!user) {
            console.log("👤 Creating New User...");
            user = await User.create({
                phone,
                name: "New User",
                email: "",
                role: "user", // Default role safe hai
                addresses: [],
                isOnline: true
            });
        }

        console.log(`✅ Login Success as ${user.role}`);

        return res.status(200).json({
            error: false,
            _id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
            isNewUser: user.name === "New User"
        });

    } catch (error) {
        console.error("❌ DB Error:", error);
        return res.status(500).json({
            message: "Server Error",
            error: true
        });
    }
};

// ==========================================
// 3️⃣ GET USER PROFILE
// ==========================================
const getUserProfile = async (req, res) => {
    try {
        // 🛡️ User ID find karte waqt dhyan rakha
        const user = await User.findById(req.user._id);
        if (user) {
            return res.status(200).json(user);
        } else {
            return res.status(404).json({
                message: "User not found",
                error: true
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: true
        });
    }
};

// ==========================================
// 4️⃣ UPDATE USER PROFILE
// ==========================================
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // 🛡️ Security Fix: Sirf wahi fields update hongi jo allowed hain (No Role bypass)
            if (req.body.name) user.name = req.body.name;
            if (req.body.email) user.email = req.body.email;
            if (req.body.category) user.category = req.body.category;
            if (req.body.image) user.image = req.body.image;

            if (req.body.latitude && req.body.longitude) {
                user.location = {
                    type: 'Point',
                    coordinates: [req.body.longitude, req.body.latitude],
                    address: req.body.address || user.location?.address
                };
            }

            const updatedUser = await user.save();

            return res.status(200).json({
                error: false,
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                category: updatedUser.category,
                image: updatedUser.image,
                token: generateToken(updatedUser._id),
            });
        } else {
            return res.status(404).json({
                message: "User not found",
                error: true
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: true
        });
    }
};

// ==========================================
// 5️⃣ ADD ADDRESS (Fully Secured)
// ==========================================
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (!user.addresses) user.addresses = [];
            
            // 🛡️ Security Fix: Extract ONLY the allowed fields from req.body
            // Taki koi extra data database mein ghus na sake
            const { type, name, phone, address, city, pincode } = req.body;

            // 🛡️ Basic Validation: Zaroori cheezein check karo
            if (!address || !city || !pincode) {
                return res.status(400).json({
                    message: "Address, City and Pincode are required",
                    error: true
                });
            }

            const newAddress = {
                type: type || 'Other',
                name: name || user.name, // Agar name nahi aaya to user ka naam daal do
                phone: phone || user.phone, // Agar phone nahi aaya to user ka phone daal do
                address,
                city,
                pincode
            };

            user.addresses.push(newAddress);
            await user.save();
            
            return res.status(200).json(user.addresses);
        } else {
            return res.status(404).json({
                message: "User not found",
                error: true
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
};

// ==========================================
// 6️⃣ DELETE ADDRESS
// ==========================================
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user && user.addresses) {
            // 🛡️ Filter address safely
            user.addresses = user.addresses.filter(
                (a) => a._id.toString() !== req.params.id.toString()
            );

            await user.save();
            return res.status(200).json(user.addresses);
        } else {
            return res.status(404).json({
                message: "User not found",
                error: true
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    getUserProfile,
    updateUserProfile,
    addAddress,
    deleteAddress
};