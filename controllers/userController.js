const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔐 Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// 1️⃣ SEND OTP 
// ==========================================
const sendOtp = async (req, res) => {
    const { phone } = req.body;
    
    // 🔥 CEO ke liye Firebase OTP bypass
    if (phone === '9873366601') {
        return res.status(200).json({
            message: "Welcome Boss! Use your secret OTP to login.",
            error: false
        });
    }

    return res.status(200).json({
        message: "OTP handled by Firebase",
        error: false
    });
};

// ==========================================
// 2️⃣ VERIFY OTP & LOGIN (VIP Access Added)
// ==========================================
const verifyOtp = async (req, res) => {
    // 🔥 YAHAN GADBAD THI: Ab hum phone aur otp dono le rahe hain
    const { phone, otp } = req.body; 

    console.log(`🚀 LOGIN HIT: Phone ${phone}`);

    try {
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ message: "Valid Phone number required", error: true });
        }

        // 👑 CEO MASTER LOGIN LOGIC (Yahan tera taala-chabhi hai)
        if (phone === '9873366601' && otp === '654321') {
            console.log("👑 CEO LOGGED IN USING MASTER KEY!");
            
            let admin = await User.findOne({ phone });
            
            // Agar CEO pehli baar aa raha hai, toh entry banao Admin role ke sath
            if (!admin) {
                admin = await User.create({
                    phone,
                    name: "Shiva (CEO)",
                    role: "admin", // 👈 Dashboard isko dekh kar entry dega
                    isOnline: true
                });
            } else if (admin.role !== 'admin') {
                // Agar galti se 'user' ban gaya tha, toh usko 'admin' promote kar do
                admin.role = 'admin';
                await admin.save();
            }

            return res.status(200).json({
                error: false,
                _id: admin._id,
                name: admin.name,
                phone: admin.phone,
                role: admin.role,
                token: generateToken(admin._id)
            });
        }

        // 👤 NORMAL USER LOGIC (App walo ke liye)
        let user = await User.findOne({ phone });

        if (!user) {
            console.log("👤 Creating New User...");
            user = await User.create({
                phone,
                name: "New User",
                role: "user", // 👈 Normal logo ke liye user role
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
        return res.status(500).json({ message: "Server Error", error: true });
    }
};

// ==========================================
// 3️⃣ GET USER PROFILE
// ==========================================
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            return res.status(200).json(user);
        } else {
            return res.status(404).json({ message: "User not found", error: true });
        }
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: true });
    }
};

// ==========================================
// 4️⃣ UPDATE USER PROFILE
// ==========================================
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
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
            return res.status(404).json({ message: "User not found", error: true });
        }
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: true });
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
            
            const { type, name, phone, address, city, pincode } = req.body;

            if (!address || !city || !pincode) {
                return res.status(400).json({ message: "Address, City and Pincode are required", error: true });
            }

            const newAddress = {
                type: type || 'Other',
                name: name || user.name, 
                phone: phone || user.phone, 
                address, city, pincode
            };

            user.addresses.push(newAddress);
            await user.save();
            
            return res.status(200).json(user.addresses);
        } else {
            return res.status(404).json({ message: "User not found", error: true });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
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
                (a) => a._id.toString() !== req.params.id.toString()
            );

            await user.save();
            return res.status(200).json(user.addresses);
        } else {
            return res.status(404).json({ message: "User not found", error: true });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
    }
};

module.exports = {
    sendOtp, verifyOtp, getUserProfile, updateUserProfile, addAddress, deleteAddress
};