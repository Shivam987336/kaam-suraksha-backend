const express = require('express');
const router = express.Router();
const Service = require('../models/Service'); 

// ====================================================
// 🌟 PREMIUM PRO DATA: HD Real Photos (Urban Company Style)
// ====================================================
const serviceData = [
    // --- 1. AC & Appliances ---
    {
        name: "AC & Appliances",
        icon: "https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Split AC Service" }, { title: "Window AC Service" }, { title: "Refrigerator Repair" }, { title: "Washing Machine Repair" }, { title: "Microwave Oven Repair" } ]
    },
    // --- 2. Women's Salon ---
    {
        name: "Women's Salon",
        icon: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Facial & Cleanup" }, { title: "Hair Cut & Styling" }, { title: "Waxing" }, { title: "Manicure & Pedicure" } ]
    },
    // --- 3. Men's Salon ---
    {
        name: "Men's Salon",
        icon: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Hair Cut" }, { title: "Shaving & Beard" }, { title: "Head Massage" }, { title: "Face Care" } ]
    },
    // --- 4. Home Cleaning ---
    {
        name: "Home Cleaning",
        icon: "https://images.unsplash.com/photo-1581578731117-104f2a41272c?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Full Home Cleaning" }, { title: "Sofa & Carpet Cleaning" }, { title: "Kitchen Deep Cleaning" }, { title: "Bathroom Cleaning" } ]
    },
    // --- 5. Electrician ---
    {
        name: "Electrician",
        icon: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Fan & Cooler Repair" }, { title: "Switchboard & Fuse" }, { title: "New Wiring" }, { title: "Inverter & Battery" } ]
    },
    // --- 6. Plumber ---
    {
        name: "Plumber",
        icon: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Tap & Mixer Repair" }, { title: "Pipe Leakage" }, { title: "Water Tank Installation" }, { title: "Basin & Sink Blockage" } ]
    },
    // --- 7. Carpenter ---
    {
        name: "Carpenter",
        icon: "https://images.unsplash.com/photo-1622146522303-349f4817a36c?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Door & Lock Repair" }, { title: "Cupboard & Drawer" }, { title: "Furniture Repair" }, { title: "New Furniture Making" } ]
    },
    // --- 8. Painter ---
    {
        name: "Painter",
        icon: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Full House Painting" }, { title: "Single Wall Paint" }, { title: "Waterproofing" }, { title: "Wall Putty" } ]
    },
    // --- 9. Car Wash ---
    {
        name: "Car Wash",
        icon: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Bike Wash" }, { title: "Car Wash (Exterior)" }, { title: "Car Deep Clean (Interior)" } ]
    },
    // --- 10. House Maid ---
    {
        name: "House Maid",
        icon: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=800&auto=format&fit=crop",
        subServices: [ { title: "24x7 Maid Service" }, { title: "Jhadu Pocha (Cleaning)" }, { title: "Utensil Cleaning" }, { title: "Babysitter" } ]
    },
    // --- 11. Cook / Chef ---
    {
        name: "Cook / Chef",
        icon: "https://plus.unsplash.com/premium_photo-1681487814165-018814e29155?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Home Cook (Daily)" }, { title: "Party Chef (One Time)" }, { title: "Tiffin Service Setup" } ]
    },
    // --- 12. Driver ---
    {
        name: "Driver",
        icon: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Driver for Outstation" }, { title: "Driver within City" }, { title: "Permanent Driver" } ]
    },
    // --- 13. Pest Control ---
    {
        name: "Pest Control",
        icon: "https://plus.unsplash.com/premium_photo-1661963447711-27f892ffe292?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Cockroach Control" }, { title: "Termite (Deemak) Treatment" }, { title: "Bed Bugs Control" } ]
    },
    // --- 14. Pandit Ji ---
    {
        name: "Pandit Ji",
        icon: "https://images.unsplash.com/photo-1606293926075-69a00febf280?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Satyanarayan Katha" }, { title: "Griha Pravesh Puja" }, { title: "Marriage / Engagement Puja" }, { title: "Havan & Jaap" } ]
    },
    // --- 15. Gardener ---
    {
        name: "Gardener",
        icon: "https://images.unsplash.com/photo-1599687351724-dfa3c4ff81b1?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Garden Maintenance" }, { title: "Plant Trimming" }, { title: "New Plantation" }, { title: "Pot Changing" } ]
    },
    // --- 16. Labour / Helper ---
    {
        name: "Labour / Helper",
        icon: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Shifting Helper" }, { title: "Construction Labour" }, { title: "Heavy Lifting" }, { title: "Loading / Unloading" } ]
    },
    // --- 17. Mobile Repair ---
    {
        name: "Mobile Repair",
        icon: "https://images.unsplash.com/photo-1591196753356-8a2b012eb427?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Screen Replacement" }, { title: "Battery Issue" }, { title: "Software & Locking Issue" }, { title: "Speaker/Mic Repair" } ]
    },
    // --- 18. Yoga Trainer ---
    {
        name: "Yoga Trainer",
        icon: "https://images.unsplash.com/photo-1599447421405-0c325d2a941e?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Personal Yoga Class" }, { title: "Group Yoga Session" }, { title: "Meditation & Healing" } ]
    },
    // --- 19. Elderly Care ---
    {
        name: "Elderly Care",
        icon: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Nursing Care (24x7)" }, { title: "Patient Companion" }, { title: "Physiotherapy at Home" } ]
    },
    // --- 20. Tiffin Service ---
    {
        name: "Tiffin Service",
        icon: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop", 
        subServices: [ { title: "Veg Lunch/Dinner" }, { title: "Non-Veg Meals" }, { title: "Diet / Healthy Food" } ]
    }
];

// ==========================================
// 🚀 ROUTES
// ==========================================

// 1. Get ALL Categories (Name + Icon)
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({}, 'name icon'); 
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. Get Sub-Services by Category Name
// ✅ FIXED URL: 'sub' -> 'subservices' to match Flutter App
router.get('/:category/subservices', async (req, res) => {
    try {
        const categoryName = req.params.category;
        
        // Case-insensitive Match
        const service = await Service.findOne({ 
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
        
        service ? res.json(service.subServices) : res.json([]); 
    } catch (error) {
        res.status(500).json({ message: "Error fetching sub-services" });
    }
});

// 3. SEED DATA ROUTE (Run this once to load HD Data)
router.get('/seed-data', async (req, res) => {
    try {
        await Service.deleteMany({}); // Delete Old
        await Service.insertMany(serviceData); // Insert HD Data
        res.send("✅ PREMIUM Data Updated: All Services now have HD Photos!");
    } catch (err) {
        res.status(500).send("❌ Error: " + err.message);
    }
});

module.exports = router;