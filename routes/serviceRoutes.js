const express = require('express');
const router = express.Router();
const Service = require('../models/Service'); 

// ====================================================
// 🌟 MEGA DATA: 20 Categories (Urban + Desi Style)
// ====================================================
const serviceData = [
    // --- 1 to 9: ORIGINAL SERVICES ---
    {
        name: "AC & Appliances",
        icon: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Split AC Service" }, { title: "Window AC Service" }, { title: "Refrigerator Repair" }, { title: "Washing Machine Repair" }, { title: "Microwave Oven Repair" } ]
    },
    {
        name: "Women's Salon",
        icon: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Facial & Cleanup" }, { title: "Hair Cut & Styling" }, { title: "Waxing" }, { title: "Manicure & Pedicure" } ]
    },
    {
        name: "Men's Salon",
        icon: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Hair Cut" }, { title: "Shaving & Beard" }, { title: "Head Massage" }, { title: "Face Care" } ]
    },
    {
        name: "Home Cleaning",
        icon: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Full Home Cleaning" }, { title: "Sofa & Carpet Cleaning" }, { title: "Kitchen Deep Cleaning" }, { title: "Bathroom Cleaning" } ]
    },
    {
        name: "Electrician",
        icon: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Fan & Cooler Repair" }, { title: "Switchboard & Fuse" }, { title: "New Wiring" }, { title: "Inverter & Battery" } ]
    },
    {
        name: "Plumber",
        icon: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Tap & Mixer Repair" }, { title: "Pipe Leakage" }, { title: "Water Tank Installation" }, { title: "Basin & Sink Blockage" } ]
    },
    {
        name: "Carpenter",
        icon: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Door & Lock Repair" }, { title: "Cupboard & Drawer" }, { title: "Furniture Repair" }, { title: "New Furniture Making" } ]
    },
    {
        name: "Painter",
        icon: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Full House Painting" }, { title: "Single Wall Paint" }, { title: "Waterproofing" }, { title: "Wall Putty" } ]
    },
    {
        name: "Car Wash",
        icon: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=500&q=80", 
        subServices: [ { title: "Bike Wash" }, { title: "Car Wash (Exterior)" }, { title: "Car Deep Clean (Interior)" } ]
    },

    // --- 10 to 20: NEW UNIQUE / DESI SERVICES ---
    {
        name: "House Maid",
        icon: "https://cdn-icons-png.flaticon.com/512/2942/2942083.png",
        subServices: [ { title: "24x7 Maid Service" }, { title: "Jhadu Pocha (Cleaning)" }, { title: "Utensil Cleaning" }, { title: "Babysitter" } ]
    },
    {
        name: "Cook / Chef",
        icon: "https://cdn-icons-png.flaticon.com/512/1830/1830839.png",
        subServices: [ { title: "Home Cook (Daily)" }, { title: "Party Chef (One Time)" }, { title: "Tiffin Service Setup" } ]
    },
    {
        name: "Driver",
        icon: "https://cdn-icons-png.flaticon.com/512/1995/1995470.png",
        subServices: [ { title: "Driver for Outstation" }, { title: "Driver within City" }, { title: "Permanent Driver" } ]
    },
    {
        name: "Pest Control",
        icon: "https://cdn-icons-png.flaticon.com/512/2604/2604344.png",
        subServices: [ { title: "Cockroach Control" }, { title: "Termite (Deemak) Treatment" }, { title: "Bed Bugs Control" } ]
    },
    {
        name: "Pandit Ji",
        icon: "https://cdn-icons-png.flaticon.com/512/7226/7226346.png",
        subServices: [ { title: "Satyanarayan Katha" }, { title: "Griha Pravesh Puja" }, { title: "Marriage / Engagement Puja" }, { title: "Havan & Jaap" } ]
    },
    {
        name: "Gardener",
        icon: "https://cdn-icons-png.flaticon.com/512/1518/1518963.png",
        subServices: [ { title: "Garden Maintenance" }, { title: "Plant Trimming" }, { title: "New Plantation" }, { title: "Pot Changing" } ]
    },
    {
        name: "Labour / Helper",
        icon: "https://cdn-icons-png.flaticon.com/512/4836/4836603.png",
        subServices: [ { title: "Shifting Helper" }, { title: "Construction Labour" }, { title: "Heavy Lifting" }, { title: "Loading / Unloading" } ]
    },
    {
        name: "Mobile Repair",
        icon: "https://cdn-icons-png.flaticon.com/512/644/644618.png",
        subServices: [ { title: "Screen Replacement" }, { title: "Battery Issue" }, { title: "Software & Locking Issue" }, { title: "Speaker/Mic Repair" } ]
    },
    {
        name: "Yoga Trainer",
        icon: "https://cdn-icons-png.flaticon.com/512/2647/2647614.png",
        subServices: [ { title: "Personal Yoga Class" }, { title: "Group Yoga Session" }, { title: "Meditation & Healing" } ]
    },
    {
        name: "Elderly Care",
        icon: "https://cdn-icons-png.flaticon.com/512/3002/3002674.png",
        subServices: [ { title: "Nursing Care (24x7)" }, { title: "Patient Companion" }, { title: "Physiotherapy at Home" } ]
    },
    {
        name: "Tiffin Service",
        icon: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
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
router.get('/:category/sub', async (req, res) => {
    try {
        const categoryName = req.params.category;
        // Case-insensitive search
        const service = await Service.findOne({ 
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
        
        if (service) {
            res.json(service.subServices);
        } else {
            res.json([]); 
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching sub-services" });
    }
});

// 3. SEED DATA ROUTE (Jaadu wala link)
router.get('/seed-data', async (req, res) => {
    try {
        // Purana data delete karega taaki duplicate na ho
        await Service.deleteMany({}); 
        
        // Naya MEGA data insert karega
        await Service.insertMany(serviceData);
        
        res.send("✅ MEGA Data Updated: All 20 Categories (Urban + Desi) Added Successfully!");
    } catch (err) {
        res.status(500).send("❌ Error: " + err.message);
    }
});

module.exports = router;