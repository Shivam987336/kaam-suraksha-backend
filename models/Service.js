const mongoose = require('mongoose');

// 👇 Sub-Service Schema (Items ke liye)
const subServiceSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    }, 
    // ❌ Price ab OPTIONAL hai (Bidding ke liye)
    price: { 
        type: Number 
        // required: true  <-- YE HATA DIYA
    }, 
    desc: { type: String },
    time: { type: String }
});

// 👇 Main Service Schema (Category ke liye)
const serviceSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
    icon: { 
        type: String, 
        default: '🔧' 
    }, 
    subServices: [subServiceSchema] // Yahan list save hogi
});

module.exports = mongoose.model('Service', serviceSchema);