const mongoose = require('mongoose');

const providerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    
    // 👇 Update: Default 'Unassigned' kar diya taaki naye registration mein error na aaye
    category: { type: String, default: "Unassigned" }, 
    
    experience: { type: String, default: "0 Years" }, 
    rating: { type: Number, default: 0 }, // New Mistri ki rating 0 honi chahiye
    
    // 👇 Update: Rate abhi zero rahega, dashboard se set hoga
    rate: { type: Number, default: 0 }, 
    
    image: { type: String, default: "" }, 
    about: { type: String, default: "Professional worker providing quality service." },
    
    // Purana field (Shayad booking ke liye use ho raha ho)
    isAvailable: { type: Boolean, default: true },

    // 👇 NEW FIELD FOR ON/OFF BUTTON ✅
    isOnline: { type: Boolean, default: true } 
  },
  { timestamps: true }
);

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;