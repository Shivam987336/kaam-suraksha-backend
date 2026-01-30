const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // 1. Customer (User)
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // 2. Mistri (Provider) - Initially Empty (For Bidding)
    provider: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Provider' 
    },
    
    // Main Category (e.g., AC Repair)
    service: { type: String, required: true },

    // ✅ SELECTED ITEMS (e.g., Split AC x2)
    items: [
        {
            title: String, // Split AC
            qty: Number    // 2
        }
    ],
    
    // Issue Description
    issue: { type: String }, 
    
    // 📍 ADDRESS & TIME (Added for Provider)
    address: { type: String, required: true },
    location: {
        lat: Number,
        lng: Number
    },
    scheduledDate: { type: String }, // e.g., "12 Aug"
    scheduledTime: { type: String }, // e.g., "10:00 AM"

    // Price (Bidding ke baad update hoga)
    price: { type: Number, default: 0 },
    
    // Status
    status: { 
        type: String, 
        enum: ['pending', 'bidding', 'accepted', 'started', 'completed', 'cancelled'],
        default: 'pending' 
    },

    // 🔐 Security
    startOtp: { type: String },
    endOtp: { type: String },

    // ⭐ Feedback
    rating: { type: Number, default: 0 },
    review: { type: String },

    // 🛡️ Warranty
    warrantyId: { type: String },
    warrantyExpiry: { type: Date },

    // 🎥 VIDEO PROOF
    providerVideo: { type: String }, 

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);