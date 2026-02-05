const mongoose = require('mongoose');

// 👇 Sub-Service Schema (Items ke liye: Fan Repair, Switch Change etc.)
const subServiceSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    }, 
    // ✅ Price OPTIONAL hai (Bidding ke liye 0 ya null ho sakta hai)
    price: { 
        type: Number,
        default: 0 
    }, 
    desc: { type: String }, // Description (e.g., "Includes wire check")
    time: { type: String }  // Estimated time (e.g., "30 mins")
});

// 👇 Main Service Schema (Category ke liye: Electrician, Plumber)
const serviceSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
    // 🖼️ Icon/Image (Frontend par dikhane ke liye)
    icon: { 
        type: String, 
        default: 'https://cdn-icons-png.flaticon.com/512/1087/1087815.png' // Default Service Icon
    }, 
    // 🟢 Status (Agar kisi service ko band karna ho)
    isActive: {
        type: Boolean,
        default: true
    },
    
    // 🔧 List of Sub-Services
    subServices: [subServiceSchema] 
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);