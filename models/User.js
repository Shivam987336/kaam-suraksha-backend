const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    // 👤 BASIC DETAILS
    name: { 
      type: String, 
      default: "User" // Default naam taaki blank na rahe
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true, 
    },
    email: { 
      type: String, 
      default: "", 
    },
    // ⚠️ CHANGE: Password ko Optional kar diya (OTP Login ke liye)
    password: { 
      type: String, 
      required: false 
    },
    role: { 
      type: String, 
      enum: ['user', 'provider', 'admin'],
      default: 'user', 
    },

    // 🏠 CUSTOMER ADDRESSES
    addresses: [
      {
        label: { type: String }, // e.g., "Home", "Office"
        fullAddress: { type: String }, 
        pincode: { type: String },
        city: { type: String }
      }
    ],

    // ===========================================
    // 🛠️ PROVIDER SPECIFIC FIELDS
    // ===========================================
    
    // 📍 LOCATION (Maps ke liye zaroori)
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [Longitude, Latitude]
        address: { type: String }
    },

    // 🔧 CATEGORY (Plumber, Electrician etc.)
    category: { 
        type: String,
        // Sirf tab required jab role 'provider' ho
        required: function() { return this.role === 'provider'; }
    },

    // 🟢 ONLINE STATUS
    isOnline: { 
        type: Boolean, 
        default: true 
    },

    // 💰 WALLET
    walletBalance: { 
        type: Number, 
        default: 0 
    },
    totalEarnings: {
        type: Number,
        default: 0
    },

    // ⭐ RATING
    rating: { 
        type: Number, 
        default: 5.0 
    },
    totalJobs: { 
        type: Number, 
        default: 0 
    },

    // 🏦 BANK DETAILS
    bankDetails: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String },
        holderName: { type: String }
    },
    
    // 🖼️ PROFILE IMAGE
    image: {
        type: String,
        default: ""
    }
  },
  {
    timestamps: true,
  }
);

// 🌍 GEO-SPATIAL INDEX (Important for "Find Nearby")
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
module.exports = User;