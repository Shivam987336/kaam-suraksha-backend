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
        if (!phone) {
            return res.status(400).json({
                message: "Phone number required",
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
                role: "user",
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
        const user = await User.findById(req.user._id);
        if (user) {
            return res.json(user);
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
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.category)
                user.category = req.body.category;

            if (req.body.image)
                user.image = req.body.image;

            if (req.body.latitude && req.body.longitude) {
                user.location = {
                    type: 'Point',
                    coordinates: [req.body.longitude, req.body.latitude],
                    address: req.body.address
                };
            }

            const updatedUser = await user.save();

            return res.json({
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
// 5️⃣ ADD ADDRESS
// ==========================================
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (!user.addresses) user.addresses = [];
            user.addresses.push(req.body);
            await user.save();
            return res.json(user.addresses);
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
            user.addresses = user.addresses.filter(
                (a) => a._id.toString() !== req.params.id
            );

            await user.save();
            return res.json(user.addresses);
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