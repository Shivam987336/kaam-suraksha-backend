const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// 🛠️ YAHAN THI GALTI: Object mein se 'protect' function nikal liya
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 📥 1. GET MESSAGES (Chat Load karne ke liye)
// API: GET /api/chat/:bookingId
// ==========================================
// ✅ FIX: authMiddleware ki jagah protect laga diya
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Messages dhoondo aur purane pehle, naye baad mein sort karo
    const messages = await Message.find({ bookingId }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Fetch Chat Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ==========================================
// 📤 2. SEND MESSAGE (Naya Message bhejne ke liye)
// API: POST /api/chat/send
// ==========================================
// ✅ FIX: authMiddleware ki jagah protect laga diya
router.post('/send', protect, async (req, res) => {
  try {
    const { bookingId, message } = req.body;

    if (!bookingId || !message) {
      return res.status(400).json({ message: "Booking ID and Message are required" });
    }

    // Database mein save karo
    const newMessage = await Message.create({
      bookingId,
      sender: req.user._id, // Logged in user (Provider ya Customer)
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send Chat Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;