const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔐 Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1️⃣ SEND OTP (Mock)
const sendOtp = async (req, res) => {
    console.log(`📨 OTP Request for ${req.body.phone}`);
    res.status(200).json({ message: 'OTP sent', otp: '1234', error: false });
};

// 2️⃣ VERIFY OTP & LOGIN (👉 FIXED FOR ADMIN ACCESS)
const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body; // ✅ Ab OTP bhi read kar rahe hain
    console.log(`🚀 LOGIN HIT: Phone ${phone} | OTP: ${otp}`);

    try {
        let user = await User.findOne({ phone });

        // 👇 MASTER ADMIN LOGIC (Jugaad)
        // Agar OTP "admin123" hai, to banda Admin ban jayega
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
                email: `${phone}@test.com`,
                role: role, // ✅ Role ab dynamic hai
                addresses: []
            });
        } else {
            // Agar user pehle se hai aur tune "admin123" dala, to usse Admin bana do
            if (role === "admin") {
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
            role: user.role, // ✅ Frontend ko pata chalega ki ye Admin hai
            token: generateToken(user.id),
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