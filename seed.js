const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const Provider = require('./models/Provider');

dotenv.config();

// ==========================================
// 🔥 1. NEW SERVICES DATA (With Image URLs 🖼️)
// ==========================================
const servicesData = [
    {
        name: "AC & Appliance Repair",
        icon: "https://cdn-icons-png.flaticon.com/512/3565/3565099.png", 
        subServices: [
            { name: "AC Service", price: 599, time: "45 min" },
            { name: "AC Gas Filling", price: 2499, time: "30 min" },
            { name: "Fridge Repair", price: 349, time: "1 hr" },
            { name: "Washing Machine Checkup", price: 199, time: "30 min" }
        ]
    },
    {
        name: "Women's Salon & Spa",
        icon: "https://cdn-icons-png.flaticon.com/512/3252/3252273.png", 
        subServices: [
            { name: "Basic Facial", price: 499, time: "45 min" },
            { name: "Hair Cut", price: 299, time: "30 min" },
            { name: "Waxing (Full Arms)", price: 199, time: "20 min" },
            { name: "Manicure & Pedicure", price: 799, time: "1 hr" }
        ]
    },
    {
        name: "Home Cleaning",
        icon: "https://cdn-icons-png.flaticon.com/512/2061/2061960.png", 
        subServices: [
            { name: "Full Home Deep Clean", price: 1999, time: "4 hrs" },
            { name: "Bathroom Cleaning", price: 399, time: "45 min" },
            { name: "Sofa Cleaning", price: 599, time: "1 hr" },
            { name: "Kitchen Cleaning", price: 699, time: "2 hrs" }
        ]
    },
    {
        name: "Electrician",
        icon: "https://cdn-icons-png.flaticon.com/512/2917/2917711.png", 
        subServices: [
            { name: "Fan Repair", price: 149, time: "30 min" },
            { name: "Switchboard Installation", price: 99, time: "20 min" },
            { name: "Inverter Fitting", price: 399, time: "1 hr" }
        ]
    },
    {
        name: "Plumber",
        icon: "https://cdn-icons-png.flaticon.com/512/2950/2950942.png", 
        subServices: [
            { name: "Tap Repair", price: 99, time: "30 min" },
            { name: "Pipe Leakage Fix", price: 249, time: "45 min" },
            { name: "Water Tank Cleaning", price: 599, time: "2 hrs" }
        ]
    },
    {
        name: "Carpenter",
        icon: "https://cdn-icons-png.flaticon.com/512/2921/2921226.png", 
        subServices: [
            { name: "Door Lock Repair", price: 199, time: "30 min" },
            { name: "Furniture Assembly", price: 399, time: "1 hr" },
            { name: "New Door Installation", price: 599, time: "2 hrs" }
        ]
    },
    {
        name: "Painter",
        icon: "https://cdn-icons-png.flaticon.com/512/2972/2972105.png", 
        subServices: [
            { name: "Single Room Paint", price: 2499, time: "1 day" },
            { name: "Full Home Painting", price: 12000, time: "4 days" },
            { name: "Wall Putty Work", price: 500, time: "3 hrs" }
        ]
    },
    {
        name: "Car & Bike Wash",
        icon: "https://cdn-icons-png.flaticon.com/512/2312/2312296.png", 
        subServices: [
            { name: "Bike Foam Wash", price: 99, time: "20 min" },
            { name: "Car Interior Clean", price: 499, time: "1 hr" },
            { name: "Car Full Service", price: 999, time: "2 hrs" }
        ]
    }
];

// 🔥 2. PROVIDERS DATA (Dummy Workers)
const providersData = [
  {
    name: "Raju Plumber",
    phone: "9876540001",
    category: "Plumber",
    rate: 200,
    isAvailable: true
  },
  {
    name: "Shamshad Electrician",
    phone: "9876540002",
    category: "Electrician",
    rate: 300,
    isAvailable: true
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
    await Provider.deleteMany();
    console.log('🧹 Old Data Cleared (Emojis Removed)...');

    // 📥 Naya Data Daalo
    await Service.insertMany(servicesData);
    console.log('✅ 8 New Categories (With Images) Added!');

    await Provider.insertMany(providersData);
    console.log('✅ Providers Added!');
    
    console.log('🎉 SUCCESS! Ab App Chalao!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();