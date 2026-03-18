const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service'); 

dotenv.config();

// 🔥 YAHAN HAIN URBAN COMPANY WALE PREMIUM 3D ICONS 🔥
const categoriesData = [
    { name: "Plumber", image: "https://img.icons8.com/3d-fluency/96/plumbing.png", status: "Active" },
    { name: "Electrician", image: "https://img.icons8.com/3d-fluency/96/light-bulb.png", status: "Active" },
    { name: "Carpenter", image: "https://img.icons8.com/3d-fluency/96/saw.png", status: "Active" },
    { name: "AC Repair", image: "https://img.icons8.com/3d-fluency/96/air-conditioner.png", status: "Active" },
    { name: "House Cleaning", image: "https://img.icons8.com/3d-fluency/96/broom.png", status: "Active" },
    { name: "Painter", image: "https://img.icons8.com/3d-fluency/96/paint-brush.png", status: "Active" },
    { name: "Pest Control", image: "https://img.icons8.com/3d-fluency/96/bug.png", status: "Active" },
    { name: "RO Repair", image: "https://img.icons8.com/3d-fluency/96/water-dispenser.png", status: "Active" },
    { name: "Washing Machine Repair", image: "https://img.icons8.com/3d-fluency/96/washing-machine.png", status: "Active" },
    { name: "Refrigerator Repair", image: "https://img.icons8.com/3d-fluency/96/fridge.png", status: "Active" },
    { name: "TV Repair", image: "https://img.icons8.com/3d-fluency/96/retro-tv.png", status: "Active" },
    { name: "Geyser Repair", image: "https://img.icons8.com/3d-fluency/96/water-heater.png", status: "Active" },
    { name: "Car Wash", image: "https://img.icons8.com/3d-fluency/96/car.png", status: "Active" },
    { name: "Sofa Cleaning", image: "https://img.icons8.com/3d-fluency/96/sofa.png", status: "Active" },
    { name: "Bathroom Cleaning", image: "https://img.icons8.com/3d-fluency/96/shower-and-tub.png", status: "Active" },
    { name: "Salon at Home", image: "https://img.icons8.com/3d-fluency/96/hair-dryer.png", status: "Active" },
    { name: "Massage Therapy", image: "https://img.icons8.com/3d-fluency/96/lotus.png", status: "Active" },
    { name: "Packers & Movers", image: "https://img.icons8.com/3d-fluency/96/truck.png", status: "Active" },
    { name: "CCTV Installation", image: "https://img.icons8.com/3d-fluency/96/cctv-camera.png", status: "Active" },
    { name: "Smart Home Setup", image: "https://img.icons8.com/3d-fluency/96/smart-home.png", status: "Active" }
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected!");

        await Service.deleteMany(); 
        console.log("🗑️ Purani categories saaf kar di...");

        await Service.insertMany(categoriesData);
        console.log("🎉 Badhai ho! Urban Company wale Premium 3D Icons Add ho gaye!");

        process.exit();
    } catch (error) {
        console.error("❌ Error aaya bhai:", error);
        process.exit(1);
    }
};

importData();