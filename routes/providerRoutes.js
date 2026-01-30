const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider'); 

// 👇 Controller functions import
const { 
    sendOtp, 
    verifyOtp, 
    getProviderProfile, 
    updateProviderProfile, 
    getProvidersByCategory
} = require('../controllers/providerController');

// Middleware
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🛠️ PROVIDER ROUTES
// ==========================================

// 1️⃣ Auth Routes (OTP Login)
router.post('/send-otp', sendOtp);
router.post('/login', verifyOtp);

// 2️⃣ Profile Routes
router.get('/profile', protect, getProviderProfile);
router.put('/profile', protect, updateProviderProfile);
router.put('/update-details', protect, updateProviderProfile);

// 3️⃣ Public Route (Category wise data)
router.get('/category/:category', getProvidersByCategory);


// ==========================================
// 💰 4. WALLET & EARNINGS ROUTE
// ==========================================
router.get('/wallet/:id', async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        res.json({
            totalEarnings: provider.totalEarnings || 0,
            availableBalance: provider.walletBalance || 0,
            transactions: provider.transactions || [] 
        });

    } catch (err) {
        console.error("Wallet Error:", err.message);
        res.status(500).send("Server Error");
    }
});


// ==========================================
// 🏦 5. BANK DETAILS UPDATE ROUTE
// ==========================================
router.put('/update-bank/:id', async (req, res) => {
    const { bankName, accountNumber, ifscCode, holderName } = req.body;

    try {
        let provider = await Provider.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        provider.bankDetails = {
            bankName,
            accountNumber,
            ifscCode,
            holderName
        };

        await provider.save();
        res.json({ message: "✅ Bank Details Updated!" });

    } catch (err) {
        console.error("Bank Update Error:", err.message);
        res.status(500).send("Server Error");
    }
});


// ==========================================
// 🟢 6. ONLINE/OFFLINE TOGGLE ROUTE
// ==========================================
router.put('/status', protect, async (req, res) => {
    try {
        const provider = await Provider.findById(req.user.id);

        if (!provider) {
            return res.status(404).json({ msg: 'Provider not found' });
        }

        if (req.body.isOnline !== undefined) {
            provider.isOnline = req.body.isOnline;
        } else {
            provider.isOnline = !provider.isOnline;
        }

        await provider.save();

        console.log(`STATUS UPDATE: ${provider.name} is now ${provider.isOnline ? '🟢 Online' : '🔴 Offline'}`);
        
        res.json({ 
            success: true, 
            isOnline: provider.isOnline,
            msg: `You are now ${provider.isOnline ? 'Online' : 'Offline'}`
        });

    } catch (err) {
        console.error("Status Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;