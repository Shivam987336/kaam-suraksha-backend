const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const User = require('./models/User'); // ✅ Provider hata kar User lagaya

dotenv.config();

// ==========================================
// 🔥 1. NEW SERVICES DATA (Fixed Keys)
// ==========================================
const servicesData = [
    {
        name: "AC & Appliance Repair",
        icon: "https://cdn-icons-png.flaticon.com/512/3565/3565099.png", 
        subServices: [
            { title: "AC Service", price: 599, time: "45 min" }, // 'name' -> 'title'
            { title: "AC Gas Filling", price: 2499, time: "30 min" },
            { title: "Fridge Repair", price: 349, time: "1 hr" },
            { title: "Washing Machine Checkup", price: 199, time: "30 min" }
        ]
    },
    {
        name: "Women's Salon & Spa",
        icon: "https://cdn-icons-png.flaticon.com/512/3252/3252273.png", 
        subServices: [
            { title: "Basic Facial", price: 499, time: "45 min" },
            { title: "Hair Cut", price: 299, time: "30 min" },
            { title: "Waxing (Full Arms)", price: 199, time: "20 min" },
            { title: "Manicure & Pedicure", price: 799, time: "1 hr" }
        ]
    },
    {
        name: "Home Cleaning",
        icon: "https://cdn-icons-png.flaticon.com/512/2061/2061960.png", 
        subServices: [
            { title: "Full Home Deep Clean", price: 1999, time: "4 hrs" },
            { title: "Bathroom Cleaning", price: 399, time: "45 min" },
            { title: "Sofa Cleaning", price: 599, time: "1 hr" },
            { title: "Kitchen Cleaning", price: 699, time: "2 hrs" }
        ]
    },
    {
        name: "Electrician",
        icon: "https://cdn-icons-png.flaticon.com/512/2917/2917711.png", 
        subServices: [
            { title: "Fan Repair", price: 149, time: "30 min" },
            { title: "Switchboard Installation", price: 99, time: "20 min" },
            { title: "Inverter Fitting", price: 399, time: "1 hr" }
        ]
    },
    {
        name: "Plumber",
        icon: "https://cdn-icons-png.flaticon.com/512/2950/2950942.png", 
        subServices: [
            { title: "Tap Repair", price: 99, time: "30 min" },
            { title: "Pipe Leakage Fix", price: 249, time: "45 min" },
            { title: "Water Tank Cleaning", price: 599, time: "2 hrs" }
        ]
    },
    {
        name: "Carpenter",
        icon: "https://cdn-icons-png.flaticon.com/512/2921/2921226.png", 
        subServices: [
            { title: "Door Lock Repair", price: 199, time: "30 min" },
            { title: "Furniture Assembly", price: 399, time: "1 hr" },
            { title: "New Door Installation", price: 599, time: "2 hrs" }
        ]
    },
    {
        name: "Painter",
        icon: "https://cdn-icons-png.flaticon.com/512/2972/2972105.png", 
        subServices: [
            { title: "Single Room Paint", price: 2499, time: "1 day" },
            { title: "Full House Painting", price: 12000, time: "4 days" },
            { title: "Wall Putty Work", price: 500, time: "3 hrs" }
        ]
    },
    {
        name: "Car & Bike Wash",
        icon: "https://cdn-icons-png.flaticon.com/512/2312/2312296.png", 
        subServices: [
            { title: "Bike Foam Wash", price: 99, time: "20 min" },
            { title: "Car Interior Clean", price: 499, time: "1 hr" },
            { title: "Car Full Service", price: 999, time: "2 hrs" }
        ]
    }
];

// 🔥 2. PROVIDERS DATA (Updated for User Model)
const providersData = [
  {
    name: "Raju Plumber",
    phone: "9876540001",
    role: "provider", // ✅ Role Add kiya
    category: "Plumber",
    isOnline: true,
    // 📍 Location zaroori hai "Nearby" feature ke liye
    location: { type: 'Point', coordinates: [77.1025, 28.7041] } // Delhi coords
  },
  {
    name: "Shamshad Electrician",
    phone: "9876540002",
    role: "provider", // ✅ Role Add kiya
    category: "Electrician",
    isOnline: true,
    location: { type: 'Point', coordinates: [77.1025, 28.7041] }
  }
];

// 🔥 3. MAIN FUNCTION
const importData = async () => {
  try {
    // Database se Connect karo
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // 🧹 Purana Data Saaf Karo
    await Service.deleteMany();
    // ⚠️ Note: Hum saare users delete nahi kar rahe, sirf providers filter karke delete kar sakte hain
    // Lekin testing ke liye poora clean karna easy hai:
    await User.deleteMany({ role: 'provider' }); 
    
    console.log('🧹 Old Services & Providers Cleared...');

    // 📥 Naya Data Daalo
    await Service.insertMany(servicesData);
    console.log('✅ 8 New Services Added!');

    await User.insertMany(providersData);
    console.log('✅ Dummy Providers Added to User Table!');
    
    console.log('🎉 SUCCESS! Database Ready Hai!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();