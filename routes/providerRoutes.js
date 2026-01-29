const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider'); // ✅ Ye Import Zaroori hai!

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

// 1️⃣ Auth Routes
router.post('/send-otp', sendOtp);
router.post('/login', verifyOtp);

// 2️⃣ Profile Routes
router.get('/profile', protect, getProviderProfile);
router.put('/profile', protect, updateProviderProfile);
router.put('/update-details', protect, updateProviderProfile);

// 3️⃣ Public Route
router.get('/category/:category', getProvidersByCategory);

// ==========================================
// 🟢 ONLINE/OFFLINE TOGGLE ROUTE (Fixed ✅)
// ==========================================
// Hum logic yahin likh rahe hain taaki koi confusion na ho
router.put('/status', protect, async (req, res) => {
    try {
        // 1. Provider dhundo
        const provider = await Provider.findById(req.user.id);

        if (!provider) {
            return res.status(404).json({ msg: 'Provider not found' });
        }

        // 2. Status Toggle karo (True <-> False)
        // Agar frontend se specific status aa raha hai to wo use karo, nahi to toggle
        if (req.body.isOnline !== undefined) {
            provider.isOnline = req.body.isOnline;
        } else {
            provider.isOnline = !provider.isOnline;
        }

        // 3. Save karo
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