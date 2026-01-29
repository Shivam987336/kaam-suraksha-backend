const express = require('express');
const router = express.Router();
const Service = require('../models/Service'); 

// ====================================================
// 🌟 FINAL DATA: No Prices, Only Item Names (For Bidding)
// ====================================================
const serviceData = [
    {
        name: "AC & Appliances",
        icon: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Split AC" },       // 👈 Sirf Machine ka naam
            { title: "Window AC" },
            { title: "Refrigerator" },   // (Fridge)
            { title: "Washing Machine" },
            { title: "Microwave Oven" }
        ]
    },
    {
        name: "Women's Salon",
        icon: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Facial & Cleanup" },
            { title: "Hair Cut & Styling" },
            { title: "Waxing" },
            { title: "Manicure & Pedicure" }
        ]
    },
    {
        name: "Men's Salon",
        icon: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Hair Cut" },
            { title: "Shaving & Beard" },
            { title: "Head Massage" },
            { title: "Face Care" }
        ]
    },
    {
        name: "Home Cleaning",
        icon: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Full Home Cleaning" },
            { title: "Sofa & Carpet Cleaning" },
            { title: "Kitchen Deep Cleaning" },
            { title: "Bathroom Cleaning" }
        ]
    },
    {
        name: "Electrician",
        icon: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Fan & Cooler" },
            { title: "Switchboard & Fuse" },
            { title: "Wiring Work" },
            { title: "Inverter & Battery" }
        ]
    },
    {
        name: "Plumber",
        icon: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Tap & Mixer" },
            { title: "Pipe Leakage" },
            { title: "Water Tank" },
            { title: "Basin & Sink" }
        ]
    },
    {
        name: "Carpenter",
        icon: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Door & Lock" },
            { title: "Cupboard & Drawer" },
            { title: "Furniture Repair" },
            { title: "New Furniture Making" }
        ]
    },
    {
        name: "Painter",
        icon: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Full House Painting" },
            { title: "Single Wall Paint" },
            { title: "Waterproofing" }
        ]
    },
    {
        name: "Car Wash",
        icon: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=500&q=80", 
        subServices: [
            { title: "Bike Wash" },
            { title: "Car Wash (Exterior)" },
            { title: "Car Deep Clean (Interior)" }
        ]
    }
];

// 🚀 ROUTES
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({}, 'name icon'); 
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/:category/sub', async (req, res) => {
    try {
        const categoryName = req.params.category;
        const service = await Service.findOne({ 
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
        service ? res.json(service.subServices) : res.json([]); 
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

router.get('/seed-data', async (req, res) => {
    try {
        await Service.deleteMany({}); 
        await Service.insertMany(serviceData);
        res.send("✅ Data Updated: No Prices, Only Item Names!");
    } catch (err) {
        res.status(500).send("❌ Error: " + err.message);
    }
});

module.exports = router;