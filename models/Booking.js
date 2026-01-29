const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    // 1. Customer (User) - Ye to shuru mein hi chahiye
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // 2. Mistri (Provider) - ❌ FIXED: 'required: true' hata diya
    // Kyunki booking create karte time Provider nahi pata hota (Bidding System)
    provider: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Provider' 
    },
    
    // Main Category (e.g., AC Repair)
    service: { type: String, required: true },

    // ✅ NEW: Selected Items List (e.g., Split AC x2, Window AC x1)
    // Jo tune pichhle screen par select kiya tha, wo yahan save hoga
    items: [
        {
            title: String, // Split AC
            qty: Number    // 2
        }
    ],
    
    // Issue Description (User jo likhega)
    issue: { type: String }, 
    
    // Price (Abhi 0 rahega, Bidding ke baad update hoga)
    price: { type: Number, default: 0 },
    
    // Status
    status: { 
        type: String, 
        enum: ['pending', 'bidding', 'accepted', 'in_progress', 'completed', 'cancelled'],
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

    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);