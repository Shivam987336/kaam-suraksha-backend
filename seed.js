const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const User = require('./models/User');

dotenv.config();

// ==========================================
// 🔥 FULL 20 SERVICES DATA (With Urban Company Style Vector Icons)
// ==========================================
const servicesData = [
    // --- 1. AC & Appliances ---
    {
        name: "AC & Appliance Repair",
        icon: "https://img.icons8.com/fluency/96/air-conditioner.png",
        subServices: [
            { title: "AC Service", price: 599, time: "45 min" },
            { title: "AC Gas Filling", price: 2499, time: "30 min" },
            { title: "Fridge Repair", price: 349, time: "1 hr" },
            { title: "Washing Machine Check", price: 199, time: "30 min" }
        ]
    },
    // --- 2. Salon (Women) ---
    {
        name: "Women's Salon & Spa",
        icon: "https://img.icons8.com/fluency/96/cosmetics.png",
        subServices: [
            { title: "Basic Facial", price: 499, time: "45 min" },
            { title: "Hair Cut", price: 299, time: "30 min" },
            { title: "Waxing (Full Arms)", price: 199, time: "20 min" },
            { title: "Manicure & Pedicure", price: 799, time: "1 hr" }
        ]
    },
    // --- 3. Men's Salon ---
    {
        name: "Men's Salon & Massage",
        icon: "https://img.icons8.com/fluency/96/barbershop.png",
        subServices: [
            { title: "Hair Cut", price: 150, time: "30 min" },
            { title: "Shaving / Beard Trim", price: 100, time: "20 min" },
            { title: "Head Massage", price: 250, time: "20 min" },
            { title: "Face Cleanup", price: 400, time: "40 min" }
        ]
    },
    // --- 4. Cleaning ---
    {
        name: "House Maid / Cleaning",
        icon: "https://img.icons8.com/fluency/96/vacuum-cleaner.png",
        subServices: [
            { title: "Full Home Deep Clean", price: 1999, time: "4 hrs" },
            { title: "Bathroom Cleaning", price: 399, time: "45 min" },
            { title: "Kitchen Cleaning", price: 699, time: "2 hrs" },
            { title: "Sofa Cleaning", price: 599, time: "1 hr" }
        ]
    },
    // --- 5. Electrician ---
    {
        name: "Electrician",
        icon: "https://img.icons8.com/fluency/96/electrical.png",
        subServices: [
            { title: "Fan Repair", price: 149, time: "30 min" },
            { title: "Switchboard Installation", price: 99, time: "20 min" },
            { title: "Inverter Fitting", price: 399, time: "1 hr" },
            { title: "MCB Change", price: 250, time: "30 min" }
        ]
    },
    // --- 6. Plumber ---
    {
        name: "Plumber",
        icon: "https://img.icons8.com/fluency/96/plumbing.png",
        subServices: [
            { title: "Tap Repair", price: 99, time: "30 min" },
            { title: "Pipe Leakage Fix", price: 249, time: "45 min" },
            { title: "Water Tank Cleaning", price: 599, time: "2 hrs" },
            { title: "Basin Blockage", price: 300, time: "40 min" }
        ]
    },
    // --- 7. Carpenter ---
    {
        name: "Carpenter",
        icon: "https://img.icons8.com/fluency/96/saw.png",
        subServices: [
            { title: "Door Lock Repair", price: 199, time: "30 min" },
            { title: "Furniture Assembly", price: 399, time: "1 hr" },
            { title: "Handle/Hinge Fix", price: 150, time: "20 min" },
            { title: "New Door Installation", price: 599, time: "2 hrs" }
        ]
    },
    // --- 8. Painter ---
    {
        name: "Painter",
        icon: "https://img.icons8.com/fluency/96/paint-roller.png",
        subServices: [
            { title: "Single Room Paint", price: 2499, time: "1 day" },
            { title: "Full House Painting", price: 12000, time: "4 days" },
            { title: "Wall Putty Work", price: 500, time: "3 hrs" }
        ]
    },
    // --- 9. Car Wash ---
    {
        name: "Car & Bike Wash",
        icon: "https://img.icons8.com/fluency/96/car-wash.png",
        subServices: [
            { title: "Bike Foam Wash", price: 99, time: "20 min" },
            { title: "Car Exterior Wash", price: 299, time: "40 min" },
            { title: "Car Interior Clean", price: 499, time: "1 hr" },
            { title: "Car Full Service", price: 999, time: "2 hrs" }
        ]
    },
    // --- 10. Cook ---
    {
        name: "Cook / Tiffin Service",
        icon: "https://img.icons8.com/fluency/96/cooking-pot.png",
        subServices: [
            { title: "One Time Meal (4 People)", price: 300, time: "1.5 hrs" },
            { title: "Monthly Lunch Tiffin", price: 2500, time: "Monthly" },
            { title: "Party Cook (per hour)", price: 500, time: "1 hr" }
        ]
    },
    // --- 11. Pest Control ---
    {
        name: "Pest Control",
        icon: "https://img.icons8.com/fluency/96/bug.png",
        subServices: [
            { title: "Cockroach Control (1BHK)", price: 899, time: "1 hr" },
            { title: "Termite Treatment", price: 2999, time: "3 hrs" },
            { title: "Bed Bug Control", price: 1200, time: "2 hrs" }
        ]
    },
    // --- 12. RO Service ---
    {
        name: "RO / Water Purifier",
        icon: "https://img.icons8.com/fluency/96/water-dispenser.png",
        subServices: [
            { title: "RO Service", price: 399, time: "45 min" },
            { title: "Filter Change", price: 899, time: "30 min" },
            { title: "Installation", price: 499, time: "1 hr" }
        ]
    },
    // --- 13. Shifting ---
    {
        name: "Shifting Labour",
        icon: "https://img.icons8.com/fluency/96/truck.png",
        subServices: [
            { title: "1 Helper (Loading/Unloading)", price: 400, time: "2 hrs" },
            { title: "Mini Tempo + 1 Helper", price: 1500, time: "Trip" },
            { title: "Full House Shifting", price: 5000, time: "Variable" }
        ]
    },
    // --- 14. Driver ---
    {
        name: "Driver on Demand",
        icon: "https://img.icons8.com/fluency/96/steering-wheel.png",
        subServices: [
            { title: "Driver for 4 Hours", price: 400, time: "4 hrs" },
            { title: "Driver for 8 Hours", price: 700, time: "8 hrs" },
            { title: "Outstation (per day)", price: 1200, time: "24 hrs" }
        ]
    },
    // --- 15. Pandit Ji ---
    {
        name: "Pandit Ji",
        icon: "https://img.icons8.com/fluency/96/om.png",
        subServices: [
            { title: "Satyanarayan Katha", price: 1100, time: "2 hrs" },
            { title: "Griha Pravesh", price: 2100, time: "3 hrs" },
            { title: "Vehicle Pooja", price: 251, time: "30 min" }
        ]
    },
    // --- 16. Nurse ---
    {
        name: "Home Nurse",
        icon: "https://img.icons8.com/fluency/96/nurse.png",
        subServices: [
            { title: "Injection Service", price: 150, time: "15 min" },
            { title: "Dressing / Wound Care", price: 300, time: "30 min" },
            { title: "Full Day Care", price: 1500, time: "12 hrs" }
        ]
    },
    // --- 17. Elder Care ---
    {
        name: "Elder Care",
        icon: "https://img.icons8.com/fluency/96/family.png",
        subServices: [
            { title: "Attendant (Day)", price: 800, time: "10 hrs" },
            { title: "Attendant (Night)", price: 1000, time: "12 hrs" }
        ]
    },
    // --- 18. Baby Sitter ---
    {
        name: "Baby Sitter / Nanny",
        icon: "https://img.icons8.com/fluency/96/baby-carriage.png",
        subServices: [
            { title: "Nanny for 4 Hours", price: 500, time: "4 hrs" },
            { title: "Full Day Babysitting", price: 1000, time: "10 hrs" }
        ]
    },
    // --- 19. Mobile/Laptop ---
    {
        name: "Mobile & Laptop Repair",
        icon: "https://img.icons8.com/fluency/96/laptop.png",
        subServices: [
            { title: "Mobile Screen Guard", price: 150, time: "10 min" },
            { title: "Laptop OS Installation", price: 499, time: "1 hr" },
            { title: "Battery Replacement", price: 300, time: "30 min" }
        ]
    },
    // --- 20. Security ---
    {
        name: "Security Guard",
        icon: "https://img.icons8.com/fluency/96/security-guard.png",
        subServices: [
            { title: "Guard for Function (8 hrs)", price: 900, time: "8 hrs" },
            { title: "Night Watchman", price: 1200, time: "12 hrs" }
        ]
    }
];

// 🔥 PROVIDERS DATA (Dummy Data)
const providersData = [
  {
    name: "Raju Plumber",
    phone: "9876540001",
    role: "provider",
    category: "Plumber",
    isOnline: true,
    location: { type: 'Point', coordinates: [77.1025, 28.7041] }
  },
  {
    name: "Shamshad Electrician",
    phone: "9876540002",
    role: "provider",
    category: "Electrician",
    isOnline: true,
    location: { type: 'Point', coordinates: [77.1025, 28.7041] }
  },
  {
    name: "Sunita Cleaner",
    phone: "9876540003",
    role: "provider",
    category: "House Maid / Cleaning",
    isOnline: true,
    location: { type: 'Point', coordinates: [77.1025, 28.7041] }
  }
];

// 🔥 MAIN FUNCTION
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // 🧹 Purana Data Saaf Karo
    await Service.deleteMany();
    await User.deleteMany({ role: 'provider' });

    console.log('🧹 Old Services & Providers Cleared...');

    // 📥 Naya High-Quality Data Daalo
    await Service.insertMany(servicesData);
    console.log(`✅ ${servicesData.length} Professional Services Added!`);

    await User.insertMany(providersData);
    console.log('✅ Dummy Providers Added!');

    console.log('🎉 SUCCESS! Database Ready Hai with Urban Company Style Images!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();