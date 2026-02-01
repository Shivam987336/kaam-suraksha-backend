const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // 1. Customer (User)
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // 2. Mistri (Provider) 
    // shuru mein null rahega, jab provider accept karega tab update hoga
    provider: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' // ⚠️ NOTE: Agar tera Provider model alag hai to 'Provider' likh, warna 'User' hi rakh
    },
    
    // Main Category (e.g., AC Repair)
    service: { type: String, required: true },

    // ✅ ITEM DETAILS (Flexible: Array or String)
    // Flutter se agar object array aa raha hai to ye use hoga
    items: [
        {
            title: String, // Split AC
            qty: Number    // 2
        }
    ],
    // Flutter se agar simple text aa raha hai (e.g. "2 Split AC repair") to ye use hoga
    itemsSummary: { type: String }, 
    
    // Issue Description
    issue: { type: String }, 
    
    // 📍 ADDRESS & TIME
    address: { type: String, required: true },
    location: {
        lat: Number,
        lng: Number
    },
    scheduledDate: { type: String }, // e.g., "12 Aug"
    scheduledTime: { type: String }, // e.g., "10:00 AM"

    // 💰 PRICE & BIDDING SYSTEM
    price: { type: Number, default: 0 }, // Final decided price
    
    // 👇 NEW: Bids Array (Taaki multiple providers boli laga sakein)
    bids: [
        {
            provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            amount: { type: Number },
            message: { type: String },
            createdAt: { type: Date, default: Date.now }
        }
    ],

    // 💳 PAYMENT STATUS (Flutter Payment Screen ke liye)
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentMode: { type: String }, // 'cash', 'online', 'upi'
    
    // Status Flow
    status: { 
        type: String, 
        enum: ['pending', 'bidding', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending' 
    },

    // 🔐 SECURITY (OTP Logic)
    // Job shuru karne ke liye OTP (User Provider ko dega)
    otp: { type: String }, 
    
    // ⭐ FEEDBACK
    rating: { type: Number, default: 0 },
    review: { type: String },

    // 🛡️ WARRANTY CARD (Flutter Warranty Screen ke liye)
    warrantyId: { type: String },
    warrantyExpiry: { type: Date },

    // 🎥 VIDEO PROOF (Flutter Reels Screen ke liye)
    providerVideo: { type: String }, // URL of the video uploaded by provider

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);