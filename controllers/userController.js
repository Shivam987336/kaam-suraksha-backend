const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔐 Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// 1. SEND OTP (Mock)
// ==========================================
const sendOtp = async (req, res) => {
    console.log(`📨 OTP Request for ${req.body.phone}`);
    // Real App mein yahan SMS API call hogi
    res.status(200).json({ message: 'OTP sent', otp: '1234', error: false });
};

// ==========================================
// 2. VERIFY OTP & LOGIN (With Admin Hack)
// ==========================================
const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    console.log(`🚀 LOGIN HIT: Phone ${phone} | OTP: ${otp}`);

    try {
        let user = await User.findOne({ phone });

        // 👇 MASTER ADMIN LOGIC (Jugaad)
        let role = "user"; 
        if (otp === "admin123") {
            role = "admin";
            console.log("👑 MASTER PASSWORD USED: ADMIN ACCESS GRANTED!");
        }

        if (!user) {
            console.log("👤 New User Creating...");
            user = await User.create({
                phone,
                name: role === "admin" ? "Super Admin" : "New User",
                email: "", // Khali rakh sakte hain kyunki optional hai
                role: role, 
                addresses: [],
                isOnline: true
            });
        } else {
            // Agar purana user hai aur "admin123" dala, toh upgrade kar do
            if (role === "admin" && user.role !== "admin") {
                user.role = "admin";
                await user.save();
                console.log("⚡ Existing User Upgraded to Admin!");
            }
        }

        console.log(`✅ Login Success as ${user.role}!`);
        
        res.json({
            error: false,
            _id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role, 
            token: generateToken(user.id),
            isNewUser: user.name === "New User" 
        });

    } catch (error) {
        console.error("❌ DB Error:", error);
        res.status(500).json({ message: "Server Error", error: true });
    }
};

// ==========================================
// 3. GET USER PROFILE
// ==========================================
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user) res.json(user); 
        else res.status(404).json({ message: 'User not found', error: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: true });
    }
};

// ==========================================
// 4. UPDATE PROFILE
// ==========================================
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            // Image update logic bhi yahan aa sakta hai
            if(req.body.image) user.image = req.body.image;

            const updatedUser = await user.save();
            
            res.json({
                error: false,
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                image: updatedUser.image,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found', error: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: true });
    }
};

// ==========================================
// 5. ADD ADDRESS
// ==========================================
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

// ==========================================
// 6. DELETE ADDRESS
// ==========================================
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
    sendOtp, 
    verifyOtp, 
    getUserProfile, 
    updateUserProfile, 
    addAddress, 
    deleteAddress 
};