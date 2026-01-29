const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔐 Token Generator (FIXED ✅)
const generateToken = (id) => {
    // Pehle yahan 'secret_123' tha, ab humne isse sahi kar diya hai
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1️⃣ SEND OTP (Mock for now)
const sendOtp = async (req, res) => {
    console.log(`📨 OTP Request for ${req.body.phone}`);
    res.status(200).json({ message: 'OTP sent', otp: '1234', error: false });
};

// 2️⃣ VERIFY OTP & LOGIN
const verifyOtp = async (req, res) => {
    const { phone } = req.body;
    console.log(`🚀 LOGIN HIT: Phone ${phone}`);

    try {
        let user = await User.findOne({ phone });

        if (!user) {
            console.log("👤 New User Creating...");
            user = await User.create({
                phone,
                name: "New User",
                email: `${phone}@test.com`,
                role: "user",
                addresses: []
            });
        }

        console.log("✅ Login Success!");
        
        res.json({
            error: false,
            _id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            token: generateToken(user.id), // ✅ Ab Sahi Token Jayega
            isNewUser: false 
        });

    } catch (error) {
        console.error("❌ DB Error:", error);
        res.status(500).json({ message: "Server Error", error: true });
    }
};

// 3️⃣ USER PROFILE
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user) res.json(user); 
        else res.status(404).json({ message: 'User not found', error: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: true });
    }
};

// 4️⃣ UPDATE PROFILE
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            const updatedUser = await user.save();
            
            res.json({
                error: false,
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found', error: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: true });
    }
};

// 5️⃣ ADD ADDRESS
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user) {
            if(!user.addresses) user.addresses = [];
            user.addresses.push(req.body);
            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'User not found', error: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, error: true });
    }
};

// 6️⃣ DELETE ADDRESS
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user && user.addresses) {
            user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'User not found', error: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, error: true });
    }
};

module.exports = { 
    sendOtp, verifyOtp, getUserProfile, updateUserProfile, addAddress, deleteAddress 
};