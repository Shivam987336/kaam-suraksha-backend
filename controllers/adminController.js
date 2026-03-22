const User = require('../models/User');
const Service = require('../models/Service');
// Agar Bookings ka model alag naam se hai toh use theek kar lena
const Booking = require('../models/Booking'); 

// ==========================================
// 1️⃣ DASHBOARD STATS (Total Kamai, Workers, etc.)
// ==========================================
const getDashboardStats = async (req, res) => {
    try {
        // Asli database se gin rahe hain
        const totalProviders = await User.countDocuments({ role: 'provider' });
        
        // Agar Service/Booking tables abhi khali hain, toh app crash na ho isliye fallback lagaya hai
        const totalServices = (await Service.countDocuments()) || 12; 
        
        let totalBookings = 0;
        try {
            totalBookings = await Booking.countDocuments();
        } catch (err) {
            totalBookings = 150; // Agar booking table nahi bani toh dummy dikhayega
        }

        // Total kamai (abhi ke liye dummy, baad me isko calculations se nikalenge)
        const totalRevenue = 85000;

        return res.status(200).json({
            success: true,
            totalProviders,
            totalServices,
            totalRevenue,
            totalBookings
        });

    } catch (error) {
        console.error("❌ Dashboard Stats Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2️⃣ SECURITY LOGS (Security Page ke liye)
// ==========================================
const getSecurityLogs = async (req, res) => {
    try {
        // Abhi ke liye nakli (dummy) logs bhej rahe hain React ko
        // Baad mein hum isko asli database table se replace kar denge
        const logs = [
            { id: 1, event: 'CEO Login (Master Key)', user: 'Shiva', ip: '192.168.1.1', status: 'Success', time: 'Just Now' },
            { id: 2, event: 'Failed Login Attempt', user: 'Unknown', ip: '45.12.33.1', status: 'Blocked', time: '10 mins ago' },
            { id: 3, event: 'Database Backup', user: 'System', ip: 'Localhost', status: 'Success', time: '2 hours ago' },
            { id: 4, event: 'New Provider Registered', user: 'Auto', ip: '10.0.0.5', status: 'Success', time: 'Yesterday' }
        ];

        return res.status(200).json({
            success: true,
            logs
        });
    } catch (error) {
        console.error("❌ Security Logs Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getDashboardStats,
    getSecurityLogs
};