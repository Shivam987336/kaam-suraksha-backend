const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');

// 🔐 Token Generator 
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1️⃣ SEND OTP (Mock)
const sendOtp = async (req, res) => {
    console.log(`📨 Provider OTP Request for ${req.body.phone}`);
    res.status(200).json({ message: 'OTP sent to Provider', otp: '1234', error: false });
};

// 2️⃣ VERIFY OTP & LOGIN (Provider ke liye)
const verifyOtp = async (req, res) => {
    const { phone } = req.body;
    console.log(`🛠️ PROVIDER LOGIN HIT: Phone ${phone}`);

    try {
        // 1. Provider dhoondo
        let provider = await Provider.findOne({ phone });

        // 2. Agar nahi hai, toh naya banao (Registration)
        if (!provider) {
            console.log("👷 New Provider Creating...");
            provider = await Provider.create({
                phone,
                name: "New Mistri",
                email: "",
                category: "Unassigned", // Baad mein update karega
                rate: 0,
                role: "provider",
                isVerified: false,
                isOnline: true // Default Online
            });
        }

        console.log("✅ Provider Login Success!");

        // 3. Response Bhejo
        res.json({
            error: false,
            _id: provider.id,
            name: provider.name,
            phone: provider.phone,
            category: provider.category,
            role: "provider",
            token: generateToken(provider.id), // ✅ Sahi Token
            isNewUser: provider.category === "Unassigned",
            isOnline: provider.isOnline // 👇 Login karte hi status bhi bhej do
        });

    } catch (error) {
        console.error("❌ Provider DB Error:", error);
        res.status(500).json({ message: "Server Error", error: true });
    }
};

// 3️⃣ GET PROVIDER PROFILE
const getProviderProfile = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user._id); 
        if (provider) {
            res.json(provider);
        } else {
            res.status(404).json({ message: 'Provider not found', error: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: true });
    }
};

// 4️⃣ UPDATE PROFILE (Category Update)
const updateProviderProfile = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user._id);

        if (provider) {
            provider.name = req.body.name || provider.name;
            provider.email = req.body.email || provider.email;
            provider.category = req.body.category || provider.category; 
            provider.rate = req.body.rate || provider.rate; 
            provider.desc = req.body.desc || provider.desc; 

            const updatedProvider = await provider.save();

            console.log("✅ Provider Details Updated:", updatedProvider.category);

            res.json({
                error: false,
                _id: updatedProvider._id,
                name: updatedProvider.name,
                category: updatedProvider.category,
                rate: updatedProvider.rate,
                token: generateToken(updatedProvider._id),
                isOnline: updatedProvider.isOnline
            });
        } else {
            res.status(404).json({ message: 'Provider not found', error: true });
        }
    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ message: 'Update Failed', error: true });
    }
};

// 5️⃣ PUBLIC: Get Providers by Category (User App ke liye)
const getProvidersByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        // 👇 SIRF ONLINE WALO KO DHUNDO
        const providers = await Provider.find({ 
            category: category,
            isOnline: true // 👈 Important: Jo online hai wahi dikhega
        });
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6️⃣ TOGGLE ONLINE/OFFLINE STATUS (NEW FUNCTION ✅)
const toggleOnlineStatus = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user._id);

        if (provider) {
            // App se jo value aayi (true/false) wo set karo
            provider.isOnline = req.body.isOnline; 
            await provider.save();
            
            console.log(`🔌 ${provider.name} status changed to: ${provider.isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
            
            res.json({ success: true, isOnline: provider.isOnline });
        } else {
            res.status(404).json({ message: "Provider not found" });
        }
    } catch (error) {
        console.error("Toggle Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { 
    sendOtp, 
    verifyOtp, 
    getProviderProfile, 
    updateProviderProfile, 
    getProvidersByCategory,
    toggleOnlineStatus // 👈 YE MAT BHULNA
};